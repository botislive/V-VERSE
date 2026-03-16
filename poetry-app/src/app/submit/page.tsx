'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom, useAtomValue } from 'jotai';
import { participantAtom, submissionModeAtom, submissionContentAtom, submissionStatusAtom } from '@/lib/store';
import { Mic, FileText, AlignCenter, Bold, Italic, Quote, Sparkles, Feather } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import AudioRecorder from './AudioRecorder';

export default function SubmitPage() {
  const router = useRouter();
  const participant = useAtomValue(participantAtom);
  const [mode, setMode] = useAtom(submissionModeAtom);
  const [content, setContent] = useAtom(submissionContentAtom);
  const [status, setStatus] = useAtom(submissionStatusAtom);

  const [textContent, setTextContent] = useState('');
  
  // Text Editor Formatting States
  const [formatBold, setFormatBold] = useState(false);
  const [formatItalic, setFormatItalic] = useState(true); // default italic
  const [formatQuote, setFormatQuote] = useState(false);
  const [formatCenter, setFormatCenter] = useState(false);

  // Handle redirect if directly accessed without registration
  useEffect(() => {
    if (!participant && typeof window !== 'undefined') {
      router.replace('/');
    }
  }, [participant, router]);

  const handleAudioComplete = (blob: Blob | null) => {
    setContent(blob);
  };

  const handleReviewAndSubmit = async () => {
    if (!participant) return;
    if (mode === 'text' && !textContent.trim()) return;
    if (mode === 'audio' && !content) return;

    setStatus('submitting');
    
    try {
      // 1. Create or Find Participant
      let userId = '';
      const { data: existingUser } = await supabase
        .from('participants')
        .select(`
          id,
          submissions ( id )
        `)
        .eq('phone', participant.phone)
        .single();
        
      if (existingUser) {
        if (existingUser.submissions && existingUser.submissions.length > 0) {
           setStatus('error');
           console.error('Process blocked: A submission already exists for this phone number.');
           return;
        }
        userId = existingUser.id;
      } else {
        const { data: newUser, error: userError } = await supabase
          .from('participants')
          .insert({
            username: participant.username,
            phone: participant.phone,
            college: participant.college
          })
          .select()
          .single();
          
        if (userError) throw userError;
        userId = newUser.id;
      }

      // 2. Handle Submission Content
      let finalContent = mode === 'text' ? textContent : '';

      if (mode === 'audio' && content instanceof Blob) {
        const fileName = `${userId}-${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from('audio_submissions')
          .upload(fileName, content, {
            contentType: 'audio/webm'
          });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('audio_submissions')
          .getPublicUrl(fileName);
          
        finalContent = publicUrl;
      }

      // 3. Save Submission Record
      const { error: subError } = await supabase
        .from('submissions')
        .insert({
          user_id: userId,
          type: mode,
          content: finalContent
        });

      if (subError) throw subError;

      setStatus('success');
      router.push('/celebration');

    } catch (err) {
      console.error('Submission failed:', err);
      setStatus('error');
    }
  };

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-8 min-h-screen flex flex-col justify-center relative z-10">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-display italic">Cast your verses into the world.</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Choose your preferred medium for the 2024 Grand Slam.</p>
      </div>

      <nav className="flex p-1 bg-[#1d1d1f] rounded-full border border-white/10 max-w-sm mx-auto w-full relative z-20">
        <button 
          onClick={() => setMode('audio')}
          className={`flex-1 py-2 px-6 rounded-full font-semibold shadow-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 ${mode === 'audio' ? 'bg-white text-black' : 'text-slate-400 hover:text-white bg-transparent'}`}
        >
          <Mic className="w-5 h-5" />
          Audio Entry
        </button>
        <button 
          onClick={() => setMode('text')}
          className={`flex-1 py-2 px-6 rounded-full font-semibold shadow-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 ${mode === 'text' ? 'bg-white text-black' : 'text-slate-400 hover:text-white bg-transparent'}`}
        >
          <FileText className="w-5 h-5" />
          Text Entry
        </button>
      </nav>

      {/* AUDIO UI */}
      {mode === 'audio' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <AudioRecorder onRecordingComplete={handleAudioComplete} />
        </motion.div>
      )}

      {/* TEXT UI */}
      {mode === 'text' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <section className="space-y-6" id="text-interface">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Written Manuscript</h3>
              <span className="text-[10px] text-[#0d6cf2] bg-[#0d6cf2]/10 px-2 py-0.5 rounded-full font-medium">
                {textContent.trim().split(/\s+/).filter(Boolean).length} / 500 WORDS
              </span>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-white/5">
                <button 
                  onClick={() => setFormatBold(!formatBold)}
                  className={`transition-colors ${formatBold ? 'text-[#0d6cf2]' : 'text-slate-400 hover:text-white'}`}
                ><Bold className="w-5 h-5" /></button>
                <button 
                  onClick={() => setFormatItalic(!formatItalic)}
                  className={`transition-colors ${formatItalic ? 'text-[#0d6cf2]' : 'text-slate-400 hover:text-white'}`}
                ><Italic className="w-5 h-5" /></button>
                <button 
                  onClick={() => setFormatQuote(!formatQuote)}
                  className={`transition-colors ${formatQuote ? 'text-[#0d6cf2]' : 'text-slate-400 hover:text-white'}`}
                ><Quote className="w-5 h-5" /></button>
                <div className="flex-1" />
                <button 
                  onClick={() => setFormatCenter(!formatCenter)}
                  className={`transition-colors ${formatCenter ? 'text-[#0d6cf2]' : 'text-slate-400 hover:text-white'}`}
                ><AlignCenter className="w-5 h-5" /></button>
              </div>

              <textarea 
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className={`w-full h-80 bg-transparent border-none focus:ring-0 font-display text-xl leading-relaxed placeholder:text-slate-600 outline-none text-white resize-none transition-all duration-300 ${
                  formatBold ? 'font-bold' : 'font-normal'
                } ${
                  formatItalic ? 'italic' : 'not-italic'
                } ${
                  formatCenter ? 'text-center' : 'text-left'
                } ${
                  formatQuote ? 'border-l-4 border-l-[#0d6cf2] bg-white/[0.02] pl-12 py-8 pr-8' : 'p-8'
                }`}
                placeholder="Pour your thoughts into words..."
              />
            </div>
          </section>
        </motion.div>
      )}

      <div className="pt-6">
        <button 
          onClick={handleReviewAndSubmit}
          disabled={status === 'submitting'}
          className="w-full py-4 bg-gradient-to-r from-[#0d6cf2] to-[#023e9c] text-white font-semibold rounded-2xl shadow-[0_0_30px_rgba(13,108,242,0.3)] hover:shadow-[0_0_50px_rgba(13,108,242,0.5)] border border-white/10 hover:scale-[1.01] transition-all duration-500 flex items-center justify-center gap-3 group text-lg tracking-wide disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-[0_0_30px_rgba(13,108,242,0.3)]"
        >
          {status === 'submitting' ? 'Submitting...' : 'Review & Submit'}
          {status === 'submitting' ? (
            <Sparkles className="w-5 h-5 animate-spin" />
          ) : (
            <Feather className="w-5 h-5 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          )}
        </button>
      </div>

    </main>
  );
}
