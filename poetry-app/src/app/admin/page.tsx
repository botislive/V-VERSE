'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { adminAtom } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Lock, User, KeyRound } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const setAdmin = useSetAtom(adminAtom);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('admins')
        .select('id')
        .eq('username', username)
        .eq('password_hash', password)
        .single();

      if (fetchError || !data) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      setAdmin(true);
      router.push('/admin/dashboard');

    } catch (err) {
      setError('An error occurred during authentication');
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 w-full min-h-screen relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm glass-card p-8 rounded-3xl shadow-2xl premium-border"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#0d6cf2]/10 rounded-full flex items-center justify-center mb-4 border border-[#0d6cf2]/30 text-[#0d6cf2]">
             <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Admin Portal</h1>
          <p className="text-slate-400 text-xs mt-2 tracking-widest uppercase">Secure Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2 relative">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0d6cf2] w-5 h-5 opacity-60" />
              <input 
                required
                type="text"
                placeholder="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-[#0d6cf2] rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none transition-colors"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2 relative">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0d6cf2] w-5 h-5 opacity-60" />
              <input 
                required
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-[#0d6cf2] rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#0d6cf2] hover:bg-[#0d6cf2]/80 text-white font-bold tracking-widest text-sm py-4 rounded-full transition-all disabled:opacity-50 mt-4 uppercase"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
