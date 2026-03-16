'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Play, Square, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AudioRecorder({ 
  onRecordingComplete 
}: { 
  onRecordingComplete: (blob: Blob | null) => void 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Use aggressive compression to keep audio very small for the Supabase Free Tier (~180KB for 60s)
      const options = {
        audioBitsPerSecond: 24000, 
      };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimeLeft(60);
      setAudioUrl(null);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setTimeLeft(60);
    onRecordingComplete(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <section className="space-y-10 py-8" id="audio-interface">
      <div className="relative flex flex-col items-center justify-center pt-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-72 h-72 rounded-full border border-[#0d6cf2]/10 scale-110 opacity-20 animate-pulse" />
        </div>
        
        <div className="relative w-56 h-56 rounded-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1d1d1f] to-black border border-white/5 shadow-2xl overflow-hidden">
          {/* Progress ring background */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="112" cy="112" r="108" fill="none" stroke="rgba(13,108,242,0.1)" strokeWidth="4" />
            <motion.circle 
              cx="112" cy="112" r="108" 
              fill="none" 
              stroke="#0d6cf2" 
              strokeWidth="4"
              strokeDasharray="678"
              strokeDashoffset={isRecording ? 678 - (timeLeft / 60) * 678 : 0}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>
          
          <span className="text-6xl font-display font-light text-white tracking-tighter relative z-10">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-2 relative z-10">
            {isRecording ? 'Recording...' : audioUrl ? 'Recorded' : 'Maximum Duration'}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-12">
          <button 
            onClick={resetRecording}
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/10"
            disabled={isRecording}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className="group relative flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-2xl hover:scale-105 transition-transform"
          >
            {isRecording ? (
              <div className="w-8 h-8 bg-red-600 rounded-sm group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
            ) : (
              <Mic className="w-8 h-8 text-black group-hover:scale-110 transition-transform" />
            )}
          </button>
          
          <button 
             className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors border ${audioUrl ? 'text-white border-white/30 hover:bg-white/10' : 'text-slate-600 border-white/5'}`}
             disabled={!audioUrl || isRecording}
             onClick={() => {
                if (audioUrl) {
                  const audio = new Audio(audioUrl);
                  audio.play();
                }
             }}
          >
            <Play className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">
            {isRecording ? 'Listening...' : 'Ready to capture your voice'}
          </p>
          <p className="font-display italic text-2xl text-white">"Silence is a text easy to misread."</p>
        </div>
      </div>
      
      {/* CSS Simulated Waveform */}
      <div className="flex items-center justify-center gap-1.5 h-16">
        {[4, 8, 12, 16, 10, 14, 6, 12, 8, 4].map((h, i) => (
          <motion.div 
            key={i}
            animate={{ height: isRecording ? [h * 2, h * 4, h * 2] : h * 4 }}
            transition={{ repeat: isRecording ? Infinity : 0, duration: 0.5 + (i % 3) * 0.2 }}
            className={`w-1 rounded-full waveform-bar ${isRecording ? 'bg-[#0d6cf2]' : 'bg-[#0d6cf2]/40'}`} 
          />
        ))}
      </div>
    </section>
  );
}
