import { useState, useEffect } from 'react';
import { usePromptStore, type Prompt, type CreatePromptData } from '@/store/promptStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PromptManagerProps {
  userId?: string;
}

export default function PromptManager({ userId }: PromptManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  const {
    prompts,
    templateTypes,
    isLoading,
    error,
    fetchPrompts,
    fetchTemplateTypes,
    createPrompt,
    updatePrompt,
    deletePrompt,
    setError
  } = usePromptStore();

  // Form state
  const [formData, setFormData] = useState<CreatePromptData>({
    name: '',
    templateType: '',
    promptText: '',
    isDefault: false
  });

  useEffect(() => {
    fetchPrompts(userId);
    fetchTemplateTypes();
  }, [userId, fetchPrompts, fetchTemplateTypes]);

  const handleCreatePrompt = async () => {
    try {
      await createPrompt({
        ...formData,
        userId
      });
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        templateType: '',
        promptText: '',
        isDefault: false
      });
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const handleUpdatePrompt = async (id: string, data: Partial<CreatePromptData>) => {
    try {
      await updatePrompt(id, data);
      setEditingPrompt(null);
    } catch (error) {
      console.error('Error updating prompt:', error);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await deletePrompt(id);
      } catch (error) {
        console.error('Error deleting prompt:', error);
      }
    }
  };

  const filteredPrompts = filterType === 'all'
    ? prompts
    : prompts.filter(prompt => prompt.templateType === filterType);

  const customPrompts = filteredPrompts.filter(prompt => !prompt.isDefault);
  const defaultPrompts = filteredPrompts.filter(prompt => prompt.isDefault);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Prompt Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter prompt name"
                />
              </div>
              <div>
                <Label htmlFor="templateType">Template Type</Label>
                <Select
                  value={formData.templateType}
                  onValueChange={(value) => setFormData({ ...formData, templateType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(templateTypes).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="promptText">Prompt Text</Label>
                <Textarea
                  id="promptText"
                  value={formData.promptText}
                  onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
                  placeholder="Enter your prompt template. Use {content} as placeholder for the note content."
                  rows={8}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use {'{content}'} as a placeholder for the note content.
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePrompt} disabled={!formData.name || !formData.templateType || !formData.promptText}>
                  Create Prompt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-4">
        <Label htmlFor="filter">Filter by type:</Label>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(templateTypes).map(([key, type]) => (
              <SelectItem key={key} value={key}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Custom Prompts */}
          {customPrompts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Custom Prompts</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {customPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    templateTypes={templateTypes}
                    onEdit={setEditingPrompt}
                    onDelete={handleDeletePrompt}
                    onUpdate={handleUpdatePrompt}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Default Prompts */}
          {defaultPrompts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Default Prompts</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {defaultPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    templateTypes={templateTypes}
                    isReadOnly={true}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredPrompts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No prompts found for the selected filter.
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {editingPrompt && (
        <EditPromptDialog
          prompt={editingPrompt}
          templateTypes={templateTypes}
          onClose={() => setEditingPrompt(null)}
          onSave={handleUpdatePrompt}
        />
      )}
    </div>
  );
}

interface PromptCardProps {
  prompt: Prompt;
  templateTypes: Record<string, { name: string; description: string }>;
  isReadOnly?: boolean;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: Partial<CreatePromptData>) => void;
}

function PromptCard({ prompt, templateTypes, isReadOnly = false, onEdit, onDelete, onUpdate }: PromptCardProps) {
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const templateType = templateTypes[prompt.templateType];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{prompt.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">{templateType?.name || prompt.templateType}</Badge>
              {prompt.isDefault && <Badge variant="outline">Default</Badge>}
            </div>
          </div>
          {!isReadOnly && (
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit?.(prompt)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete?.(prompt.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {templateType?.description && (
            <p className="text-sm text-muted-foreground">{templateType.description}</p>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Prompt Template</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFullPrompt(!showFullPrompt)}
              >
                {showFullPrompt ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="bg-muted p-3 rounded-md">
              {showFullPrompt ? (
                <pre className="text-sm whitespace-pre-wrap">{prompt.promptText}</pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {prompt.promptText.length > 100
                    ? `${prompt.promptText.substring(0, 100)}...`
                    : prompt.promptText
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EditPromptDialogProps {
  prompt: Prompt;
  templateTypes: Record<string, { name: string; description: string }>;
  onClose: () => void;
  onSave: (id: string, data: Partial<CreatePromptData>) => void;
}

function EditPromptDialog({ prompt, templateTypes, onClose, onSave }: EditPromptDialogProps) {
  const [formData, setFormData] = useState({
    name: prompt.name,
    promptText: prompt.promptText,
    isActive: prompt.isActive
  });

  const handleSave = () => {
    onSave(prompt.id, formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-promptText">Prompt Text</Label>
            <Textarea
              id="edit-promptText"
              value={formData.promptText}
              onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
              rows={8}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
