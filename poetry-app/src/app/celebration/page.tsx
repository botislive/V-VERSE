'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export default function CelebrationPage() {
  const router = useRouter();

  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0d6cf2', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0d6cf2', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
           router.replace('/certificate');
        }, 800);
      }
    };
    frame();
  }, [router]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 w-full min-h-screen">
       <motion.div 
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ type: "spring", duration: 1 }}
         className="text-center space-y-4"
       >
         <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white">
           MASTERPIECE<br/>SUBMITTED
         </h1>
         <p className="text-[#0d6cf2] tracking-[0.4em] uppercase text-sm font-bold">
            Processing your certification...
         </p>
       </motion.div>
    </main>
  );
}
