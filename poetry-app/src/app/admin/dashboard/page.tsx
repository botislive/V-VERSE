'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { adminAtom } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mic, FileText, Download, LogOut, Search, Play, FileTerminal } from 'lucide-react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { X } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const isAdmin = useAtomValue(adminAtom);
  const [mounted, setMounted] = useState(false);

  // Data States
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCollege, setFilterCollege] = useState('all');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<{type: string, content: string, username: string} | null>(null);

  // Auth Protection
  useEffect(() => {
    setMounted(true);
    if (!isAdmin) {
      router.replace('/admin');
    } else {
      fetchData();
    }
  }, [isAdmin, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users and their submissions (left join)
      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          submissions (
            type,
            content,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  // Derive Stats
  const totalParticipants = participants.length;
  const totalAudio = participants.filter(p => p.submissions?.some((s: any) => s.type === 'audio')).length;
  const totalText = participants.filter(p => p.submissions?.some((s: any) => s.type === 'text')).length;

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'College', 'Submission Type', 'Submitted At', 'Content Link'];
    const rows = filteredRows.map(row => [
      row.username,
      row.phone,
      row.college,
      row.submissions?.[0]?.type || 'N/A',
      new Date(row.created_at).toLocaleString(),
      row.submissions?.[0]?.content || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => `"${e.join('","')}"`)].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `poetry_participants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: GridColDef[] = [
    { field: 'username', headerName: 'Scholar', flex: 1, minWidth: 150 },
    { field: 'phone', headerName: 'Contact', flex: 1, minWidth: 130 },
    { 
      field: 'college', 
      headerName: 'Affiliation', 
      flex: 1, 
      minWidth: 130,
      renderCell: (params) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${
          params.value === 'vignan' ? 'bg-[#0d6cf2]/20 text-[#0d6cf2]' : 'bg-white/10 text-white/50'
        }`}>
          {params.value}
        </span>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => {
        const hasSub = params.row.submissions && params.row.submissions.length > 0;
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${
            hasSub ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
          }`}>
            {hasSub ? 'Submitted' : 'Pending'}
          </span>
        );
      }
    },
    {
      field: 'action',
      headerName: 'Review',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => {
        const sub = params.row.submissions?.[0];
        if (!sub) return null;
        
        return (
          <button 
            onClick={() => {
              setSelectedSubmission({
                type: sub.type,
                content: sub.content,
                username: params.row.username
              });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-xs font-semibold uppercase tracking-widest text-[#0d6cf2]"
          >
            {sub.type === 'audio' ? <Play className="w-3 h-3" /> : <FileTerminal className="w-3 h-3" />}
            Review
          </button>
        );
      }
    }
  ];

  const filteredRows = participants.filter(p => {
    // Exact or partial match for phone numbers
    const matchesSearch = p.phone.includes(search);
    const matchesCollege = filterCollege === 'all' || p.college === filterCollege;
    return matchesSearch && matchesCollege;
  });

  if (!mounted || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans relative">
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-[#0d6cf2]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Grand Slam Dashboard</h1>
          <p className="text-[#0d6cf2] tracking-[0.2em] uppercase text-xs font-bold">Authorized Personnel Only</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-sm font-semibold tracking-widest uppercase"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20 text-sm font-semibold tracking-widest uppercase"
          >
            <LogOut className="w-4 h-4" /> Exit
          </button>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
        <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-[#0d6cf2]/20 flex items-center justify-center text-[#0d6cf2]">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-4xl font-black">{totalParticipants}</span>
          </div>
          <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold">Total Scholars</p>
          <div className="absolute bottom-0 left-0 h-1 bg-[#0d6cf2] w-0 group-hover:w-full transition-all duration-500" />
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Mic className="w-6 h-6" />
            </div>
            <span className="text-4xl font-black">{totalAudio}</span>
          </div>
          <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold">Audio Masterpieces</p>
          <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-0 group-hover:w-full transition-all duration-500" />
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-4xl font-black">{totalText}</span>
          </div>
          <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold">Text Manuscripts</p>
          <div className="absolute bottom-0 left-0 h-1 bg-purple-500 w-0 group-hover:w-full transition-all duration-500" />
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card rounded-3xl border border-white/10 p-6 relative z-10 flex flex-col h-[600px]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text"
              placeholder="Search by phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-[#0d6cf2] rounded-full py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors"
            />
          </div>
          
          <div className="flex bg-black/40 p-1 rounded-full border border-white/10 w-full md:w-auto">
            <button 
              onClick={() => setFilterCollege('all')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-colors ${filterCollege === 'all' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterCollege('vignan')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-colors ${filterCollege === 'vignan' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
            >
              Vignan Only
            </button>
          </div>
        </div>

        <div className="flex-1 w-full flex-grow">
          <DataGrid 
            rows={filteredRows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontFamily: 'Inter, sans-serif'
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#94a3b8',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                fontWeight: 700
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(255,255,255,0.02)'
              },
              '& .MuiDataGrid-footerContainer': {
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#94a3b8'
              },
              '& .MuiTablePagination-root': {
                color: '#94a3b8'
              },
              '& .MuiDataGrid-iconSeparator': {
                display: 'none'
              }
            }}
          />
        </div>
      </div>

      {/* Review Modal */}
      <Dialog 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#111111',
            borderRadius: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(13, 108, 242, 0.25)',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle className="flex justify-between items-center border-b border-white/10 pb-4 pt-6 px-8">
          <div>
            <span className="text-[#0d6cf2] text-[10px] font-bold tracking-[0.3em] uppercase block mb-1">
              {selectedSubmission?.type === 'audio' ? 'Audio Session' : 'Manuscript Review'}
            </span>
            <span className="text-white text-xl font-bold">{selectedSubmission?.username}</span>
          </div>
          <IconButton onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </IconButton>
        </DialogTitle>
        <DialogContent className="p-8 min-h-[300px] flex items-center justify-center relative">
          
          {selectedSubmission?.type === 'text' && (
             <div className="w-full h-full text-left">
               <p className="font-display italic text-2xl leading-relaxed text-white/90 whitespace-pre-wrap">
                 {selectedSubmission.content}
               </p>
             </div>
          )}

          {selectedSubmission?.type === 'audio' && (
             <div className="flex flex-col items-center justify-center space-y-8 w-full">
                <div className="w-32 h-32 rounded-full bg-[#0d6cf2]/10 border border-[#0d6cf2]/30 flex flex-col items-center justify-center animate-pulse relative">
                  <Mic className="w-10 h-10 text-[#0d6cf2]" />
                  <div className="absolute inset-0 border border-[#0d6cf2]/50 rounded-full scale-110 opacity-50" />
                </div>
                <audio 
                  controls 
                  src={selectedSubmission.content} 
                  className="w-full max-w-sm rounded-full overflow-hidden shadow-2xl [&::-webkit-media-controls-panel]:bg-black/50 [&::-webkit-media-controls-panel]:backdrop-blur-xl"
                  autoPlay
                />
             </div>
          )}

        </DialogContent>
      </Dialog>

    </div>
  );
}
