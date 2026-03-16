'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { participantAtom } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { User, Phone } from 'lucide-react';

export default function RegistrationPage() {
  const router = useRouter();
  const setParticipant = useSetAtom(participantAtom);

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('vignan');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !phone.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { data: existingUser } = await supabase
        .from('participants')
        .select(`
          id,
          submissions ( id )
        `)
        .eq('phone', phone)
        .single();

      if (existingUser && existingUser.submissions && existingUser.submissions.length > 0) {
        setError('A masterpiece has already been submitted for this phone number.');
        setLoading(false);
        return;
      }

      setParticipant({ username, phone, college });
      router.push('/submit');
    } catch (err) {
      console.error(err);
      setError('An error occurred during verification.');
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto relative">
      <div className="fixed -top-24 -left-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed -bottom-24 -right-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full flex justify-center mb-10 relative"
      >
        <img
          src="https://vignaniit.edu.in/images/LOGO_AAA%20copy.png"
          alt="Vignan Logo"
          className="w-48 h-auto object-contain rounded-2xl dark:bg-white dark:p-2"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="text-center mb-10"
      >
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white mb-3 font-sans">
          V-VERSE 1.0
        </h1>
        <p className="text-slate-400 dark:text-white font-medium tracking-[0.2em] uppercase text-[10px]">Annual Literary Competition</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="w-full glass-card p-10 rounded-[1.5rem] shadow-2xl premium-border border-none relative z-10"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-slate-400 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0d6cf2] w-5 h-5 opacity-60" />
              <input
                required
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 focus:border-[#0d6cf2] focus:ring-1 focus:ring-[#0d6cf2] rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-slate-400 ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0d6cf2] w-5 h-5 opacity-60" />
              <input
                required
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 focus:border-[#0d6cf2] focus:ring-1 focus:ring-[#0d6cf2] rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Affiliation</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="college"
                  value="vignan"
                  checked={college === 'vignan'}
                  onChange={(e) => setCollege(e.target.value)}
                  className="peer sr-only"
                />
                <div className="flex items-center justify-center px-2 py-3.5 rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 peer-checked:border-[#0d6cf2]/50 peer-checked:bg-[#0d6cf2]/20 peer-checked:text-white transition-all duration-200 hover:bg-white/[0.05]">
                  <span className="text-sm font-medium">Vignan</span>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="college"
                  value="other"
                  checked={college === 'other'}
                  onChange={(e) => setCollege(e.target.value)}
                  className="peer sr-only"
                />
                <div className="flex items-center justify-center px-2 py-3.5 rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 peer-checked:border-[#0d6cf2]/50 peer-checked:bg-[#0d6cf2]/20 peer-checked:text-white transition-all duration-200 hover:bg-white/[0.05]">
                  <span className="text-sm font-medium">Other</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4">
            {error && (
              <p className="text-red-400 text-xs text-center mb-4 tracking-wide font-medium">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0d6cf2] hover:opacity-90 disabled:opacity-50 text-white font-semibold text-lg py-4 rounded-full transition-all active:scale-[0.98] shadow-lg shadow-[#0d6cf2]/20"
            >
              {loading ? 'Verifying...' : 'Register Now'}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-10 text-slate-500 text-xs tracking-wide opacity-60 uppercase"
      >
        The Student Activity Council Presents
      </motion.p>
    </main>
  );
}
