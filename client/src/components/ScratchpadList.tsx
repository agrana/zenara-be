import { useEffect } from 'react';
import { useScratchpadStore } from '@/store/scratchpadStore';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ScratchpadListProps {
  searchText?: string;
  currentTitle: string;
  currentContent: string;
}

export default function ScratchpadList({ searchText = '', currentTitle, currentContent }: ScratchpadListProps) {
  const { notes, currentNote, isLoading, error, fetchNotes, switchToNote } = useScratchpadStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Filter notes based on searchText
  const filteredNotes = searchText.trim() === ''
    ? notes
    : notes.filter(note =>
        note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchText.toLowerCase()))
      );

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
      <div className="flex flex-col gap-2">
        <Button
          variant={!currentNote ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => switchToNote(null, currentTitle, currentContent)}
        >
          + New Note
        </Button>
        {filteredNotes.map((note) => (
          <Button
            key={note.id}
            variant={currentNote?.id === note.id ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => switchToNote(note, currentTitle, currentContent)}
          >
            {note.title || 'Untitled Note'}
          </Button>
        ))}
      </div>
    </div>
  );
}