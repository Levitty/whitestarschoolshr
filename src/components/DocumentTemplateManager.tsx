
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Calendar,
  Info,
  X
} from 'lucide-react';

const DocumentTemplateManager = () => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useDocumentTemplates();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    template_type: 'letter',
    content: '',
    variables: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTemplate) {
      const result = await updateTemplate(editingTemplate.id, formData);
      
      if (result?.error) {
        toast({
          title: "Error",
          description: "Failed to update template",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Template updated successfully"
        });
        handleCloseForm();
      }
    } else {
      const result = await createTemplate(formData);
      
      if (result?.error) {
        toast({
          title: "Error",
          description: "Failed to create template",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Template created successfully"
        });
        handleCloseForm();
      }
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      template_type: template.template_type,
      content: template.content,
      variables: template.variables || []
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    
    const result = await deleteTemplate(deleteConfirmId);
    
    if (result?.error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
    }
    setDeleteConfirmId(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      template_type: 'letter',
      content: '',
      variables: []
    });
  };

  const getCategoryBadge = (type: string) => {
    const colors: Record<string, string> = {
      disciplinary: 'bg-red-100 text-red-800',
      contractual: 'bg-blue-100 text-blue-800',
      recognition: 'bg-green-100 text-green-800',
      administrative: 'bg-yellow-100 text-yellow-800',
      performance: 'bg-purple-100 text-purple-800',
      letter: 'bg-gray-100 text-gray-800'
    };
    
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Letter Templates</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCloseForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Show Cause Notice"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disciplinary">Disciplinary</SelectItem>
                      <SelectItem value="contractual">Contractual</SelectItem>
                      <SelectItem value="recognition">Recognition</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your template content here. Use placeholders like {{employee_name}} for dynamic values..."
                  rows={10}
                  required
                />
                
                {/* Placeholder Explanation */}
                <div className="mt-3 p-3 bg-muted rounded-lg border">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-2">Available Placeholders:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-muted-foreground">
                        <div><code className="bg-background px-1 rounded">{'{{employee_name}}'}</code> - Full name of the employee</div>
                        <div><code className="bg-background px-1 rounded">{'{{employee_email}}'}</code> - Employee's email address</div>
                        <div><code className="bg-background px-1 rounded">{'{{employee_position}}'}</code> - Employee's job title</div>
                        <div><code className="bg-background px-1 rounded">{'{{employee_department}}'}</code> - Employee's department</div>
                        <div><code className="bg-background px-1 rounded">{'{{employee_id}}'}</code> - Employee number (e.g., EMP0001)</div>
                        <div><code className="bg-background px-1 rounded">{'{{date}}'}</code> - Current date when letter is generated</div>
                        <div><code className="bg-background px-1 rounded">{'{{subject}}'}</code> - The letter subject/title</div>
                        <div><code className="bg-background px-1 rounded">{'{{company_name}}'}</code> - Company/organization name</div>
                      </div>
                      <p className="mt-2 text-xs">Use these placeholders in your template and they will be replaced with actual values when generating letters.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingTemplate ? 'Update Template' : 'Create Template'}</Button>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <Badge className={getCategoryBadge(template.template_type)}>
                  {template.template_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {template.content.substring(0, 150)}...
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(template.created_at || '').toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteConfirmId(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Templates Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first letter template to get started</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentTemplateManager;
