
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Send } from 'lucide-react';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useProfile } from '@/hooks/useProfile';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

const DocumentTemplateManager = () => {
  const { templates, loading, createTemplate, generateDocument } = useDocumentTemplates();
  const { profile } = useProfile();
  const { createNotification } = useNotifications();
  const { toast } = useToast();
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    template_type: 'general',
    content: '',
    variables: [] as string[]
  });
  
  const [generationForm, setGenerationForm] = useState({
    templateId: '',
    recipientEmail: '',
    title: '',
    variables: {} as Record<string, string>
  });

  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const result = await createTemplate({
      name: newTemplate.name,
      template_type: newTemplate.template_type as any,
      content: newTemplate.content,
      variables: newTemplate.variables
    });

    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to create template.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Template created successfully!",
      });
      setNewTemplate({
        name: '',
        template_type: 'general',
        content: '',
        variables: []
      });
    }
  };

  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await generateDocument(
      generationForm.templateId,
      generationForm.variables,
      generationForm.recipientEmail, // This should be user ID in practice
      generationForm.title
    );

    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to generate document.",
        variant: "destructive"
      });
    } else {
      // Create notification
      await createNotification({
        user_id: generationForm.recipientEmail, // Should be user ID
        title: 'New Document Shared',
        message: `You have received a new document: ${generationForm.title}`,
        type: 'document'
      });

      toast({
        title: "Success",
        description: "Document generated and shared successfully!",
      });
      
      setGenerationForm({
        templateId: '',
        recipientEmail: '',
        title: '',
        variables: {}
      });
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const selectedTemplate = templates.find(t => t.id === generationForm.templateId);
  const templateVariables = selectedTemplate ? extractVariables(selectedTemplate.content) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Templates
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTemplate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Disciplinary Warning Letter"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-type">Type</Label>
                      <Select
                        value={newTemplate.template_type}
                        onValueChange={(value) => setNewTemplate(prev => ({ ...prev, template_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disciplinary">Disciplinary</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="termination">Termination</SelectItem>
                          <SelectItem value="promotion">Promotion</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="template-content">Template Content</Label>
                    <Textarea
                      id="template-content"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Use {variable_name} for dynamic content. e.g., Dear {employee_name}, this is to inform you that..."
                      rows={8}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Use curly braces for variables: {'{employee_name}'}, {'{date}'}, {'{reason}'}
                    </p>
                  </div>
                  <Button type="submit" className="w-full">
                    Create Template
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No templates found. Create your first template to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge variant="outline">
                      {template.template_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {template.content.substring(0, 100)}...
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setGenerationForm(prev => ({ ...prev, templateId: template.id }))}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Generate & Send
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Generate Document: {template.name}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleGenerateDocument} className="space-y-4">
                        <div>
                          <Label htmlFor="recipient">Recipient Email</Label>
                          <Input
                            id="recipient"
                            type="email"
                            value={generationForm.recipientEmail}
                            onChange={(e) => setGenerationForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                            placeholder="employee@company.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="doc-title">Document Title</Label>
                          <Input
                            id="doc-title"
                            value={generationForm.title}
                            onChange={(e) => setGenerationForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter document title"
                            required
                          />
                        </div>
                        {templateVariables.map((variable) => (
                          <div key={variable}>
                            <Label htmlFor={variable}>{variable.replace('_', ' ').toUpperCase()}</Label>
                            <Input
                              id={variable}
                              value={generationForm.variables[variable] || ''}
                              onChange={(e) => setGenerationForm(prev => ({
                                ...prev,
                                variables: { ...prev.variables, [variable]: e.target.value }
                              }))}
                              placeholder={`Enter ${variable.replace('_', ' ')}`}
                              required
                            />
                          </div>
                        ))}
                        <Button type="submit" className="w-full">
                          Generate & Send Document
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentTemplateManager;
