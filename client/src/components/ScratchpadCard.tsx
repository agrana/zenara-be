import { useState, useEffect } from "react";
import { useScratchpadStore, type FormatType } from "@/store/scratchpadStore";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Wand2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import styles from './ScratchpadCard.module.css';
import ScratchpadList from './ScratchpadList';

export default function ScratchpadCard() {
  const [isOpen, setIsOpen] = useState(true);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const { darkMode } = useAppStore();

  const {
    currentNote,
    format,
    processedContent,
    isProcessing,
    isLoading,
    error,
    setFormat,
    setProcessedContent,
    setIsProcessing,
    processContent,
    getFormatTemplate,
    createNote,
    updateNote,
    deleteNote
  } = useScratchpadStore();

  // Update local state when currentNote changes
  useEffect(() => {
    if (currentNote) {
      setContent(currentNote.content);
      setTitle(currentNote.title);
    } else {
      setContent('');
      setTitle('');
    }
  }, [currentNote]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    try {
      if (currentNote) {
        await updateNote(currentNote.id, title, content);
      } else {
        await createNote(title || 'Untitled Note', content);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const applyFormatTemplate = (formatType: FormatType) => {
    if (!content || window.confirm("This will replace your current content with a template. Continue?")) {
      const template = getFormatTemplate(formatType);
      setContent(template);
      setFormat(formatType);
    } else {
      setFormat(formatType);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-700">
        <ScratchpadList />
      </div>

      {/* Main content */}
      <div className="flex-1">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="glass rounded-xl shadow-xl overflow-hidden transition-all duration-300"
        >
          <CollapsibleTrigger className="w-full">
            <CardHeader className="p-4 bg-white/20 dark:bg-slate-800/20 cursor-pointer">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {currentNote ? 'Edit Note' : 'New Note'}
                </h2>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-800 dark:text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-800 dark:text-white" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="bg-white/80 dark:bg-slate-800/80 p-6">
              {error && (
                <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-1 items-center mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title"
                  className="flex-1 min-w-[200px] px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                />

                <Select
                  value={format}
                  onValueChange={(value) => applyFormatTemplate(value as FormatType)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Format: Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Format: Default</SelectItem>
                    <SelectItem value="diary">Format: Diary</SelectItem>
                    <SelectItem value="meeting">Format: Meeting Notes</SelectItem>
                    <SelectItem value="braindump">Format: Brain Dump</SelectItem>
                    <SelectItem value="brainstorm">Format: Brainstorm</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Save
                </Button>

                {currentNote && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await deleteNote(currentNote.id);
                      setTitle('');
                      setContent('');
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    Delete
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => processContent()}
                  disabled={isProcessing || !content}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-1" />
                  )}
                  Process
                </Button>
              </div>

              <div className={`h-[400px] overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 ${styles.mdEditorToolbar}`}>
                <MDEditor
                  value={content}
                  onChange={(value) => setContent(value || '')}
                  preview="edit"
                  height={400}
                  visibleDragbar={false}
                  className="bg-white dark:bg-slate-700"
                  data-color-mode={darkMode ? 'dark' : 'light'}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
