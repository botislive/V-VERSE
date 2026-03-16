'use client';

import { useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { participantAtom } from '@/lib/store';
import { ArrowLeft, Share2, Download, Award, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toBlob, toPng } from 'html-to-image';

export default function CertificatePage() {
  const router = useRouter();
  const participant = useAtomValue(participantAtom);
  const certRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'V-VERSE 1.0 Certificate',
      text: `Check out my Official Certificate of Excellence from the 2024 V-VERSE 1.0 Competition!`,
      url: window.location.origin,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (certRef.current === null || isDownloading) return;

    setIsDownloading(true);

    const filename = `V-VERSE_1.0_Certificate_${participant?.username?.trim().replace(/\s+/g, '_') || 'Participant'}.png`;
    const node = certRef.current;

    try {
      // Wait for custom fonts and one paint cycle to avoid partial renders.
      if (document.fonts) await document.fonts.ready;
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const triggerBlobDownload = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 300);
      };

      // Blob-first strategy avoids huge base64 strings and reduces crash risk.
      const blobStrategies = [2, 1.5, 1];
      let downloaded = false;

      for (const pixelRatio of blobStrategies) {
        try {
          const blob = await toBlob(node, {
            cacheBust: true,
            pixelRatio,
            backgroundColor: '#111111',
            skipFonts: false,
          });

          if (blob && blob.size > 5_000) {
            triggerBlobDownload(blob);
            downloaded = true;
            break;
          }
        } catch (strategyError) {
          console.warn(`Certificate blob strategy failed at pixelRatio ${pixelRatio}:`, strategyError);
        }
      }

      // Final fallback for environments where blob conversion fails.
      if (!downloaded) {
        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: 1,
          backgroundColor: '#111111',
          skipFonts: false,
        });

        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
        }, 300);
      }

    } catch (err) {
      console.error('Final failure in certificate generation:', err);
      alert('We encountered an issue generating your high-res certificate. Please try again or take a manual screenshot of the preview.');
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, participant]);

  return (
    <div className="bg-white dark:bg-black font-sans text-slate-900 dark:text-white min-h-screen flex flex-col pb-24 relative z-10">
      <header className="flex items-center bg-white dark:bg-black p-6 pb-4 justify-between border-b border-white/10">
        <button onClick={() => router.back()} className="text-[#0d6cf2] flex size-10 shrink-0 items-center justify-start hover:opacity-80">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-slate-900 dark:text-white text-sm uppercase tracking-[0.2em] font-medium flex-1 text-center">
          Certificate Preview
        </h2>
        <div className="flex w-10 items-center justify-end">
          <button 
            onClick={handleShare}
            className="flex cursor-pointer items-center justify-center text-[#0d6cf2] hover:opacity-80 transition-colors"
          >
            {copied ? <Check className="w-6 h-6 text-green-500" /> : <Share2 className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-6 overflow-hidden"
        >
          {/* Certificate Container */}
          <div 
             ref={certRef}
             className="relative flex flex-col items-stretch justify-start bg-[#111111] border border-white/10 p-[1px] shadow-[0_0_50px_rgba(13,108,242,0.1)] w-full max-w-lg mx-auto"
             style={{ 
               backgroundColor: '#111111',
               color: 'white',
               transform: 'translateZ(0)', // Force GPU layer
               backfaceVisibility: 'hidden'
             }}
          >
            <div className="border border-white/5 p-12 flex flex-col items-center text-center space-y-10 bg-gradient-to-b from-[#1a1a1a] to-black relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{ 
                  backgroundImage: 'radial-gradient(circle at 50% -20%, #0d6cf2 0%, transparent 60%)',
                  backgroundColor: '#111111' 
                }}
              />
              
              <div className="w-16 h-16 relative z-10">
                <div className="w-full h-full bg-[#0d6cf2] flex items-center justify-center">
                  <Award className="text-black w-10 h-10" />
                </div>
              </div>
              
              <div className="space-y-3 relative z-10">
                <h3 className="text-[#0d6cf2] text-[10px] uppercase tracking-[0.5em] font-bold">Official Certificate of Excellence</h3>
                <div className="h-[1px] w-20 bg-[#0d6cf2]/40 mx-auto" />
              </div>

              <div className="space-y-6 relative z-10">
                <p className="text-white/50 text-sm uppercase tracking-widest">This award is presented to</p>
                <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter uppercase break-words">
                  {participant?.username || "John Doe"}
                </h1>
                <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed font-light">
                  For exceptional literary contribution and artistic vision displayed during the <br/>
                  <span className="text-white font-medium">2024 VIGNAN POETRY DAY COMPETITION</span>
                </p>
              </div>

              <div className="pt-12 flex justify-between items-end w-full max-w-lg px-4 relative z-10">
                <div className="text-left border-t border-white/10 pt-4 w-32">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">Issue Date</p>
                  <p className="text-xs font-bold text-white mt-1">
                     {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
                  </p>
                </div>
                
                <div className="relative">
                  <div className="h-14 w-14 border border-[#0d6cf2]/30 flex items-center justify-center rotate-45">
                    <Award className="text-[#0d6cf2] -rotate-45 w-6 h-6" />
                  </div>
                </div>

                <div className="text-right border-t border-white/10 pt-4 w-32">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">Authorized By</p>
                  <p className="text-xs font-bold text-white mt-1">S. VIGNAN</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5, duration: 0.8 }}
           className="px-6 text-center space-y-4 pt-4"
        >
          <h3 className="text-white tracking-tighter text-4xl font-black uppercase">
            {participant?.username || "John Doe"}
          </h3>
          <p className="text-white/50 text-sm font-light leading-relaxed max-w-sm mx-auto uppercase tracking-wide">
            Winner of the 2024 Vignan V-VERSE 1.0 Competition. A digital distinction honoring exceptional literary vision and creative spirit.
          </p>
          
          <div className="pt-8 flex justify-center pb-20">
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-3 bg-[#0d6cf2] text-black px-10 py-5 font-black uppercase tracking-widest text-xs transition-all hover:bg-white hover:text-black shadow-[0_10px_30px_rgba(13,108,242,0.3)] hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              {isDownloading ? 'Generating...' : 'Download Digital Asset'}
            </button>
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 border border-white/10 px-6 py-3 rounded-full shadow-2xl"
          >
            <div className="bg-green-500/20 text-green-400 p-1.5 rounded-full">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-white text-sm font-medium pr-2">Link copied to clipboard</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
