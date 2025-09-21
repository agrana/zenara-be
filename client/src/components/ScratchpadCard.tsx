import { useState, useEffect, useCallback, useRef } from "react";
import { useScratchpadStore, type FormatType } from "@/store/scratchpadStore";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Wand2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import MDEditor, { commands, title1 } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css?v=2';
import '@uiw/react-markdown-preview/markdown.css?v=2';
import styles from './ScratchpadCard.module.css';
import ScratchpadList from './ScratchpadList';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';
import { SelectMultipleContext } from "react-day-picker";
import { CommandList } from "cmdk";

// Custom toolbar commands
const title3 = {
  name: 'title3',
  keyCommand: 'title3',
  buttonProps: { 'aria-label': 'Insert title3' },
  icon: (
    <svg width="12" height="12" viewBox="0 0 520 520">
      <path fill="currentColor" d="M15.7083333,468 C7.03242448,468 0,462.030833 0,454.666667 L0,421.333333 C0,413.969167 7.03242448,408 15.7083333,408 L361.291667,408 C369.967576,408 377,413.969167 377,421.333333 L377,454.666667 C377,462.030833 369.967576,468 361.291667,468 L15.7083333,468 Z M21.6666667,366 C9.69989583,366 0,359.831861 0,352.222222 L0,317.777778 C0,310.168139 9.69989583,304 21.6666667,304 L498.333333,304 C510.300104,304 520,310.168139 520,317.777778 L520,352.222222 C520,359.831861 510.300104,366 498.333333,366 L21.6666667,366 Z M136.835938,64 L136.835937,126 L107.25,126 L107.25,251 L40.75,251 L40.75,126 L-5.68434189e-14,126 L-5.68434189e-14,64 L136.835938,64 Z M212,64 L212,251 L161.648438,251 L161.648438,64 L212,64 Z M378,64 L378,126 L343.25,126 L343.25,251 L281.75,251 L281.75,126 L238,126 L238,64 L378,64 Z M449.047619,189.550781 L520,189.550781 L520,251 L405,251 L405,64 L449.047619,64 L449.047619,189.550781 Z" />
    </svg>
  ),
  execute: (state: any, api: any) => {
    let modifyText = `### ${state.selectedText}\n`;
    if (!state.selectedText) {
      modifyText = `### `;
    }
    api.replaceSelection(modifyText);
  },
};

const title2 = {
  name: 'title2',
  keyCommand: 'title2',
  render: (command: any, disabled: any, executeCommand: any) => {
    return (
      <button
        aria-label="Insert title2"
        disabled={disabled}
        onClick={(evn) => {
          executeCommand(command, command.groupName)
        }}
      >
        <svg width="12" height="12" viewBox="0 0 520 520">
          <path fill="currentColor" d="M15.7083333,468 C7.03242448,468 0,462.030833 0,454.666667 L0,421.333333 C0,413.969167 7.03242448,408 15.7083333,408 L361.291667,408 C369.967576,408 377,413.969167 377,421.333333 L377,454.666667 C377,462.030833 369.967576,468 361.291667,468 L15.7083333,468 Z M21.6666667,366 C9.69989583,366 0,359.831861 0,352.222222 L0,317.777778 C0,310.168139 9.69989583,304 21.6666667,304 L498.333333,304 C510.300104,304 520,310.168139 520,317.777778 L520,352.222222 C520,359.831861 510.300104,366 498.333333,366 L21.6666667,366 Z M136.835938,64 L136.835937,126 L107.25,126 L107.25,251 L40.75,251 L40.75,126 L-5.68434189e-14,126 L-5.68434189e-14,64 L136.835938,64 Z M212,64 L212,251 L161.648438,251 L161.648438,64 L212,64 Z M378,64 L378,126 L343.25,126 L343.25,251 L281.75,251 L281.75,126 L238,126 L238,64 L378,64 Z M449.047619,189.550781 L520,189.550781 L520,251 L405,251 L405,64 L449.047619,64 L449.047619,189.550781 Z" />
        </svg>
      </button>
    )
  },
  execute: (state: any, api: any) => {
    let modifyText = `## ${state.selectedText}\n`;
    if (!state.selectedText) {
      modifyText = `## `;
    }
    api.replaceSelection(modifyText);
  },
}

function SubChildren({ close, execute, getState, textApi, dispatch }: any) {
  const [value, setValue] = React.useState('')
  const insert = () => {
    textApi.replaceSelection(value)
  }
  return (
    <div style={{ width: 120, padding: 10 }}>
      <div>My Custom Toolbar</div>
      <input type="text" onChange={(e) => setValue(e.target.value)} />
      <button type="button" onClick={() => dispatch({ $value: '~~~~~~' })}>State</button>
      <button type="button" onClick={insert}>Insert</button>
      <button type="button" onClick={() => close()}>Close</button>
      <button type="button" onClick={() => execute()}>Execute</button>
    </div>
  );
}

const subChild = {
  name: 'update',
  groupName: 'update',
  icon: (
    <svg viewBox="0 0 1024 1024" width="12" height="12">
      <path fill="currentColor" d="M716.8 921.6a51.2 51.2 0 1 1 0 102.4H307.2a51.2 51.2 0 1 1 0-102.4h409.6zM475.8016 382.1568a51.2 51.2 0 0 1 72.3968 0l144.8448 144.8448a51.2 51.2 0 0 1-72.448 72.3968L563.2 541.952V768a51.2 51.2 0 0 1-45.2096 50.8416L512 819.2a51.2 51.2 0 0 1-51.2-51.2v-226.048l-57.3952 57.4464a51.2 51.2 0 0 1-67.584 4.2496l-4.864-4.2496a51.2 51.2 0 0 1 0-72.3968zM512 0c138.6496 0 253.4912 102.144 277.1456 236.288l10.752 0.3072C924.928 242.688 1024 348.0576 1024 476.5696 1024 608.9728 918.8352 716.8 788.48 716.8a51.2 51.2 0 1 1 0-102.4l8.3968-0.256C866.2016 609.6384 921.6 550.0416 921.6 476.5696c0-76.4416-59.904-137.8816-133.12-137.8816h-97.28v-51.2C691.2 184.9856 610.6624 102.4 512 102.4S332.8 184.9856 332.8 287.488v51.2H235.52c-73.216 0-133.12 61.44-133.12 137.8816C102.4 552.96 162.304 614.4 235.52 614.4l5.9904 0.3584A51.2 51.2 0 0 1 235.52 716.8C105.1648 716.8 0 608.9728 0 476.5696c0-132.1984 104.8064-239.872 234.8544-240.2816C258.5088 102.144 373.3504 0 512 0z" />
    </svg>
  ),
  children: (props: any) => <SubChildren {...props} />,
  execute: (state: any, api: any)  => {
    // Custom execute logic
  },
  buttonProps: { 'aria-label': 'Insert title'}
}

export default function ScratchpadCard() {
  const [isOpen, setIsOpen] = useState(true);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isViewerMode, setIsViewerMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { darkMode } = useAppStore();

  const {
    currentNote,
    format,
    processedContent,
    isProcessing,
    isLoading,
    error,
    isAutoSaving,
    lastAutoSaved,
    autoSaveError,
    setFormat,
    setProcessedContent,
    setIsProcessing,
    processContent,
    getFormatTemplate,
    createNote,
    updateNote,
    deleteNote,
    autoSaveNote,
    immediateSave,
    setAutoSaveError
  } = useScratchpadStore();

  // Autosave timeout ref
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced autosave function
  const debouncedAutoSave = useCallback((title: string, content: string) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for autosave (2 seconds delay)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveNote(title, content);
    }, 2000);
  }, [autoSaveNote]);

  // Handle content changes with autosave
  const handleContentChange = useCallback((value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    debouncedAutoSave(title, newContent);
  }, [title, debouncedAutoSave]);

  // Handle title changes with autosave
  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    debouncedAutoSave(value, content);
  }, [content, debouncedAutoSave]);

  // Save on window close and tab switch
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If there's content but no current note, warn user
      if (content.trim() && !currentNote) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handleVisibilityChange = () => {
      // When tab becomes hidden or page is about to unload, save immediately
      if (document.hidden && content.trim()) {
        // Clear any pending autosave and save immediately
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        // Use immediate save for critical moments
        immediateSave(title, content);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Clear timeout on cleanup
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, currentNote, immediateSave]);

  // Save on component unmount
  useEffect(() => {
    return () => {
      // Save when component unmounts
      if (content.trim()) {
        immediateSave(title, content);
      }
    };
  }, [title, content, immediateSave]);

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

  const handleNewNote = () => {
    setTitle('');
    setContent('');
    // Optionally, clear currentNote in the store if needed
    // setCurrentNote(null);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 flex flex-col">
        {/* Search bar */}
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Search notes..."
          className="m-4 mb-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-base focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex-1 overflow-y-auto">
          <ScratchpadList searchText={searchText} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="glass rounded-xl shadow-xl overflow-hidden transition-all duration-300 flex-1 flex flex-col"
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

          <CollapsibleContent className="flex-1 flex flex-col">
            <CardContent className="bg-white/80 dark:bg-slate-800/80 p-6 flex-1 flex flex-col">
              {error && (
                <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
                  {error}
                </div>
              )}

              {/* Autosave status indicators */}
              {autoSaveError && (
                <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm">
                  Autosave failed: {autoSaveError}
                  <button
                    onClick={() => setAutoSaveError(null)}
                    className="ml-2 text-red-800 dark:text-red-300 hover:underline"
                  >
                    ✕
                  </button>
                </div>
              )}

              {isAutoSaving && (
                <div className="mb-4 p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-sm flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </div>
              )}

              {lastAutoSaved && !isAutoSaving && !autoSaveError && (
                <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded text-sm">
                  Saved at {lastAutoSaved.toLocaleTimeString()}
                </div>
              )}

              <div className="flex flex-wrap gap-1 items-center mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
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

                {/* Button group: Save, New, View, Process */}
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNewNote}
                >
                  New
                </Button>
                <Button
                  size="sm"
                  variant={isViewerMode ? "default" : "outline"}
                  onClick={() => setIsViewerMode(!isViewerMode)}
                >
                  {isViewerMode ? "Edit" : "View"}
                </Button>
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
              </div>

              <div className={`flex-1 min-h-0 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 ${styles.mdEditorToolbar}`}>
                {isViewerMode ? (
                  <div
                    className="bg-white dark:bg-slate-700 p-4 h-full overflow-auto prose dark:prose-invert"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full">
                    <MDEditor
                      value={content}
                      onChange={handleContentChange}
                      preview="edit"
                      height="100%"
                      visibleDragbar={false}
                      className="bg-white dark:bg-slate-700 h-full"
                      style={{ height: '100%' }}
                      data-color-mode={darkMode ? 'dark' : 'light'}
                      commands={[
                        commands.group([
                          commands.title1,
                          commands.title2,
                          commands.title3,
                          commands.title4,
                          commands.title5,
                          commands.title6,
                        ], {
                          name: 'title',
                          groupName: 'title',
                          buttonProps: { 'aria-label': 'Insert title'}
                        }),
                        commands.divider,
                        commands.unorderedListCommand,
                        commands.orderedListCommand,
                        commands.checkedListCommand,
                        commands.divider,
                        commands.code,
                        commands.codeBlock,
                        commands.hr,
                        commands.divider,
                        commands.table,
                        commands.link,
                        commands.strikethrough,
                        commands.fullscreen,
                      ]}
                      extraCommands={[]}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
