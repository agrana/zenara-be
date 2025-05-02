import { useState, useEffect } from "react";
import { useScratchpadStore, type FormatType } from "@/store/scratchpadStore";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { ChevronDown, ChevronUp, FileText, CheckSquare, Code, Wand2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

export default function ScratchpadCard() {
  const [isOpen, setIsOpen] = useState(true); // Start open by default
  const { darkMode } = useAppStore();
  
  const {
    content,
    format,
    processedContent,
    isProcessing,
    setContent,
    setFormat,
    processContent,
    getFormatTemplate
  } = useScratchpadStore();
  
  const applyFormatTemplate = (formatType: FormatType) => {
    // Only apply template if there's no content or user confirms
    if (!content || window.confirm("This will replace your current content with a template. Continue?")) {
      const template = getFormatTemplate(formatType);
      setContent(template);
      setFormat(formatType);
    } else {
      // Just change the format without altering the content
      setFormat(formatType);
    }
  };
  
  return (
    <>
      <Collapsible 
        open={isOpen} 
        onOpenChange={setIsOpen}
        className="glass rounded-xl shadow-xl overflow-hidden transition-all duration-300"
      >
        <CollapsibleTrigger className="w-full">
          <CardHeader className="p-4 bg-white/20 dark:bg-slate-800/20 cursor-pointer">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Scratchpad</h2>
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
            {/* Responsive toolbar with flex-wrap to ensure visibility on all screen sizes */}
            <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
              {/* Left side - editing tools */}
              <div className="flex flex-wrap gap-1">
                <Toggle 
                  pressed={false}
                  onPressedChange={() => {
                    const newContent = content + '\n# ';
                    setContent(newContent);
                  }}
                  aria-label="Insert heading"
                  className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                >
                  <span className="font-bold">H</span>
                </Toggle>
                <Toggle
                  pressed={false}
                  onPressedChange={() => {
                    const newContent = content + '\n- ';
                    setContent(newContent);
                  }}
                  aria-label="Insert bullet point"
                  className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                >
                  <FileText className="h-5 w-5" />
                </Toggle>
                <Toggle
                  pressed={false}
                  onPressedChange={() => {
                    const newContent = content + '\n- [ ] ';
                    setContent(newContent);
                  }}
                  aria-label="Insert checkbox"
                  className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                >
                  <CheckSquare className="h-5 w-5" />
                </Toggle>
                <Toggle
                  pressed={false}
                  onPressedChange={() => {
                    const newContent = content + '\n```\n\n```';
                    setContent(newContent);
                  }}
                  aria-label="Insert code block"
                  className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                >
                  <Code className="h-5 w-5" />
                </Toggle>
              </div>
              
              {/* Right side - format and actions */}
              <div className="flex flex-wrap gap-1 items-center">
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
                  onClick={() => {
                    // Auto-save is already implemented via Zustand persist
                    // This provides visual feedback that content is saved
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
                    toast.textContent = 'Saved!';
                    document.body.appendChild(toast);
                    setTimeout(() => {
                      document.body.removeChild(toast);
                    }, 2000);
                  }}
                >
                  Save
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
              </div>
            </div>
            
            <div className="h-[400px] overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
              <MDEditor
                value={content}
                onChange={(value) => setContent(value || '')}
                preview={processedContent ? 'preview' : 'live'}
                height={400}
                visibleDragbar={false}
                className="bg-white dark:bg-slate-700"
                data-color-mode={darkMode ? 'dark' : 'light'}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
