import { useEffect } from 'react';
import { useScratchpadStore } from '@/store/scratchpadStore';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ScratchpadList() {
  const { notes, currentNote, isLoading, error, fetchNotes, setCurrentNote } = useScratchpadStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setCurrentNote(null)}
      >
        New Note
      </Button>
      
      <div className="flex flex-col gap-2 mt-4">
        {notes.map((note) => (
          <Button
            key={note.id}
            variant={currentNote?.id === note.id ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentNote(note)}
          >
            {note.title || 'Untitled Note'}
          </Button>
        ))}
      </div>
    </div>
  );
} 