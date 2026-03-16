import { atom } from 'jotai';

export interface Participant {
  username: string;
  phone: string;
  college: string;
}

export const participantAtom = atom<Participant | null>(null);
export const adminAtom = atom<boolean>(false);
export const submissionModeAtom = atom<'audio' | 'text'>('audio');
export const submissionContentAtom = atom<string | Blob | null>(null);
export const submissionStatusAtom = atom<'idle' | 'submitting' | 'success' | 'error'>('idle');
