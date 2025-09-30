import { useState, useEffect } from 'react';
import { useScratchpadStore, type NoteVersion } from '@/store/scratchpadStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History, RotateCcw, Trash2, Sparkles, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface VersionHistoryProps {
  noteId: string;
}

export function VersionHistory({ noteId }: VersionHistoryProps) {
  const {
    versions,
    isLoadingVersions,
    versionError,
    fetchVersions,
    restoreVersion,
    deleteVersion,
  } = useScratchpadStore();

  const [open, setOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (open && noteId) {
      fetchVersions(noteId);
    }
  }, [open, noteId, fetchVersions]);

  const handleRestore = async (version: NoteVersion) => {
    await restoreVersion(version);
    setOpen(false);
  };

  const handleDeleteClick = (versionId: string) => {
    setVersionToDelete(versionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (versionToDelete) {
      await deleteVersion(versionToDelete);
      setVersionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-1" />
            History
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Version History</SheetTitle>
            <SheetDescription>
              View and restore previous versions of this note
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {isLoadingVersions ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading versions...
              </div>
            ) : versionError ? (
              <div className="text-center py-8 text-destructive">
                {versionError}
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No version history yet
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-4">
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {version.isProcessed ? (
                              <Sparkles className="h-4 w-4 text-purple-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="font-medium text-sm">
                              Version {version.versionNumber}
                              {index === 0 && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (Current)
                                </span>
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(version.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                          {version.isProcessed && version.processingMetadata && (
                            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              AI Processed ({version.processingMetadata.model || 'gpt-4o-mini'})
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {index !== 0 && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedVersion(version)}
                                title="Preview version"
                              >
                                👁️
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRestore(version)}
                                title="Restore this version"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(version.id)}
                                title="Delete this version"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {selectedVersion?.id === version.id && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">
                            {version.title}
                          </div>
                          <div className="text-sm text-muted-foreground bg-muted p-3 rounded max-h-48 overflow-auto">
                            {version.content}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => setSelectedVersion(null)}
                          >
                            Hide Preview
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this version? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
