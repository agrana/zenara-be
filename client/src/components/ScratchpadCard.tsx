import { useState, useEffect } from "react";
import { useScratchpadStore, type FormatType } from "@/store/scratchpadStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { ChevronDown, ChevronUp, AlignLeft, AlignCenter, FileText, CheckSquare, Code, Wand2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function ScratchpadCard() {
  const [isOpen, setIsOpen] = useState(true); // Start open by default
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  
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
  
  const insertMarkdownSyntax = (syntax: string, selection?: [number, number]) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    let result;
    switch (syntax) {
      case 'heading':
        result = text.substring(0, start) + '# ' + text.substring(start);
        break;
      case 'bullet':
        result = text.substring(0, start) + '- ' + text.substring(start);
        break;
      case 'checkbox':
        result = text.substring(0, start) + '- [ ] ' + text.substring(start);
        break;
      case 'code':
        result = text.substring(0, start) + '```\n' + text.substring(start, end) + '\n```' + text.substring(end);
        break;
      default:
        return;
    }
    
    setContent(result);
    
    // Re-focus the textarea
    setTimeout(() => {
      textarea.focus();
      if (syntax === 'code') {
        textarea.selectionStart = start + 4;
        textarea.selectionEnd = end + 4;
      } else {
        const offset = syntax === 'heading' ? 2 : (syntax === 'checkbox' ? 6 : 2);
        textarea.selectionStart = textarea.selectionEnd = start + offset;
      }
    }, 0);
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
                  pressed={activeTab === "write"} 
                  onPressedChange={() => setActiveTab("write")}
                  aria-label="Switch to write mode"
                  className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                >
                  <FileText className="h-5 w-5" />
                </Toggle>
                <Toggle 
                  pressed={activeTab === "preview"} 
                  onPressedChange={() => setActiveTab("preview")}
                  aria-label="Switch to preview mode"
                  className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                >
                  <AlignLeft className="h-5 w-5" />
                </Toggle>
                
                {activeTab === "write" && (
                  <>
                    <Toggle
                      pressed={false}
                      onPressedChange={() => insertMarkdownSyntax('heading')}
                      aria-label="Insert heading"
                      className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    >
                      <span className="font-bold">H</span>
                    </Toggle>
                    <Toggle
                      pressed={false}
                      onPressedChange={() => insertMarkdownSyntax('bullet')}
                      aria-label="Insert bullet point"
                      className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    >
                      <AlignCenter className="h-5 w-5" />
                    </Toggle>
                    <Toggle
                      pressed={false}
                      onPressedChange={() => insertMarkdownSyntax('checkbox')}
                      aria-label="Insert checkbox"
                      className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    >
                      <CheckSquare className="h-5 w-5" />
                    </Toggle>
                    <Toggle
                      pressed={false}
                      onPressedChange={() => insertMarkdownSyntax('code')}
                      aria-label="Insert code block"
                      className="p-2 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
                    >
                      <Code className="h-5 w-5" />
                    </Toggle>
                  </>
                )}
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
                
                {activeTab === "write" && (
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
                )}
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "preview")}>
              <TabsContent value="write" className="mt-0">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-grow bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-4 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none h-[400px]"
                  placeholder="Write your thoughts here...

You can use markdown:
# Heading
- Bullet points
- [ ] Tasks
- [x] Completed tasks

```code
console.log('Hello world');
```"
                />
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0">
                <div className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-4 h-[400px] overflow-y-auto prose dark:prose-invert max-w-none">
                  {processedContent ? (
                    <ReactMarkdown>{processedContent}</ReactMarkdown>
                  ) : (
                    <ReactMarkdown>{content}</ReactMarkdown>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
