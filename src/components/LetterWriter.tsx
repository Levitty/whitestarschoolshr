
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/hooks/useEmployees';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useDocuments } from '@/hooks/useDocuments';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { 
  PenTool, 
  Sparkles, 
  Send, 
  Download, 
  Loader,
  FileText,
  AlertCircle,
  Mail,
  FileImage
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LetterWriter = () => {
  const { employees } = useEmployees();
  const { templates } = useDocumentTemplates();
  const { createLetter } = useDocuments();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [letterType, setLetterType] = useState('');
  const [situationDescription, setSituationDescription] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [letterTitle, setLetterTitle] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const employee = employees?.find(emp => emp.id === selectedEmployee);
  const template = templates?.find(temp => temp.id === selectedTemplate);

  // Helper function to get signatory text
  const getSignatoryText = () => {
    if (profile?.first_name && profile?.last_name) {
      return `\n\nYours sincerely,\n\n\n${profile.first_name} ${profile.last_name}\n${profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'HR Department'}\n${profile.department || ''}\n${new Date().toLocaleDateString()}`;
    }
    return `\n\nYours sincerely,\n\n\n[Your Name]\n[Your Title]\n[Department]\n${new Date().toLocaleDateString()}`;
  };

  useEffect(() => {
    let content = '';
    let title = '';
    
    if (template) {
      // Use template content and auto-fill placeholders
      content = template.content;
      title = template.name;
      setLetterType(template.template_type);
    } else if (employee && !template) {
      // Create basic letter structure when employee is selected but no template
      const currentDate = new Date().toLocaleDateString();
      content = `Date: ${currentDate}\n\nDear ${employee.first_name} ${employee.last_name},\n\nRe: [Letter Subject]\n\n[Letter Content]\n\n${getSignatoryText()}`;
      title = `Letter - ${employee.first_name} ${employee.last_name}`;
    }
    
    if (employee && content) {
      // Replace placeholders with employee information
      content = content.replace(/{{employee_name}}/g, `${employee.first_name} ${employee.last_name}`);
      content = content.replace(/{{employee_email}}/g, employee.email);
      content = content.replace(/{{employee_position}}/g, employee.position);
      content = content.replace(/{{employee_department}}/g, employee.department);
      content = content.replace(/{{date}}/g, new Date().toLocaleDateString());
      
      // Add signatory if not already present
      if (!content.includes('Yours sincerely') && !content.includes('[Your Name]')) {
        content += getSignatoryText();
      }
    }
    
    if (content) {
      setLetterContent(content);
    }
    if (title) {
      setLetterTitle(title);
    }
  }, [template, employee, profile]);

  const generateWithAI = async () => {
    if (!employee || !letterType || !situationDescription) {
      toast({
        title: "Missing Information",
        description: "Please select an employee, letter type, and describe the situation.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError('');
    
    try {
      console.log('Starting AI generation with:', {
        letterType,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        situationDescription
      });

      // Get company name from letterhead settings
      const { data: letterheadData } = await supabase
        .from('letterhead_settings')
        .select('company_name')
        .eq('is_active', true)
        .single();

      const response = await supabase.functions.invoke('generate-letter', {
        body: {
          letterType,
          employeeName: `${employee.first_name} ${employee.last_name}`,
          situationDescription,
          companyName: letterheadData?.company_name || 'Our Organization'
        }
      });

      console.log('Supabase function response:', response);

      if (response.error) {
        console.error('Supabase function error:', response.error);
        // Try to surface the real error coming from the Edge Function
        const ctx: any = (response.error as any).context || {};
        const body = ctx.body || {};
        const rawMsg = body.error || body.message || (response.error as any).message || 'Failed to generate letter';
        let friendly = String(rawMsg);
        const lower = friendly.toLowerCase();
        if (lower.includes('insufficient_quota') || lower.includes('quota')) {
          friendly = 'AI service quota exceeded. The OpenAI account has no credits left.';
        } else if (lower.includes('rate limit')) {
          friendly = 'Too many requests. Please wait a moment before trying again.';
        } else if (lower.includes('authentication')) {
          friendly = 'AI service authentication issue. Please contact your administrator.';
        }
        throw new Error(friendly);
      }

      if (!response.data || !response.data.generatedLetter) {
        console.error('Invalid response data:', response.data);
        throw new Error('No letter content received from AI');
      }

      setLetterContent(response.data.generatedLetter);
      setLetterTitle(`${letterType} - ${employee.first_name} ${employee.last_name}`);
      
      toast({
        title: "Letter Generated Successfully",
        description: "AI has generated your letter. You can now review and edit it as needed."
      });
    } catch (error) {
      console.error('AI generation error:', error);
      const errorMessage = (error as any)?.message || 'Failed to generate letter with AI. Please try again.';

      // Graceful fallback: generate a structured template if AI is unavailable/quota exceeded
      const lower = String(errorMessage).toLowerCase();
      if (
        lower.includes('quota') ||
        lower.includes('rate limit') ||
        lower.includes('authentication') ||
        lower.includes('ai service')
      ) {
        const fullName = `${employee?.first_name ?? ''} ${employee?.last_name ?? ''}`.trim();
        const today = new Date().toLocaleDateString();
        const signatoryName = profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : '[Authorized Signatory]';
        const signatoryTitle = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : '[Title]';
        const signatoryDept = profile?.department || '[Department]';
        const fallbackLetter = `Subject: ${letterType || 'Official Letter'} - ${fullName}\n\n${today}\n\nDear ${fullName},\n\nRe: ${letterType || 'Official Communication'}\n\nThis letter addresses the following matter:\n${situationDescription}\n\nExpectations and Next Steps:\n- Please provide a written response within 48 hours.\n- Adhere to company policies and guidelines at all times.\n- Further actions may follow per HR procedures.\n\nYours sincerely,\n\n\n${signatoryName}\n${signatoryTitle}\n${signatoryDept}\n${today}`;

        setLetterContent(fallbackLetter);
        setLetterTitle(`${letterType || 'Letter'} - ${fullName}`);
        setGenerationError(errorMessage);
        toast({
          title: 'AI temporarily unavailable',
          description: 'Generated a professional template as a fallback. You can edit it before saving.',
        });
      } else {
        // Also fallback when we only get a generic non-2xx error from Supabase Functions
        if (lower.includes('non-2xx')) {
          const fullName = `${employee?.first_name ?? ''} ${employee?.last_name ?? ''}`.trim();
          const today = new Date().toLocaleDateString();
          const signatoryName = profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : '[Authorized Signatory]';
          const signatoryTitle = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : '[Title]';
          const signatoryDept = profile?.department || '[Department]';
          const fallbackLetter = `Subject: ${letterType || 'Official Letter'} - ${fullName}\n\n${today}\n\nDear ${fullName},\n\nRe: ${letterType || 'Official Communication'}\n\nThis letter addresses the following matter:\n${situationDescription}\n\nExpectations and Next Steps:\n- Please provide a written response within 48 hours.\n- Adhere to company policies and guidelines at all times.\n- Further actions may follow per HR procedures.\n\nYours sincerely,\n\n\n${signatoryName}\n${signatoryTitle}\n${signatoryDept}\n${today}`;

          setLetterContent(fallbackLetter);
          setLetterTitle(`${letterType || 'Letter'} - ${fullName}`);
          setGenerationError(errorMessage);
          toast({
            title: 'AI temporarily unavailable',
            description: 'Generated a professional template as a fallback. You can edit it before saving.',
          });
        } else {
          setGenerationError(errorMessage);
          toast({
            title: 'Generation Failed',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const saveLetter = async () => {
    if (!selectedEmployee || !letterContent || !letterTitle) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const source = selectedTemplate ? 'template' : (situationDescription ? 'ai_generated' : 'manual');
      const category = template?.template_type || letterType || 'administrative';
      
      // Use the employee's profile_id if available, otherwise use the selectedEmployee ID
      let finalEmployeeId = selectedEmployee;
      if (employee?.profile_id) {
        finalEmployeeId = employee.profile_id;
      }
      
      console.log('Saving letter with employee ID:', finalEmployeeId);
      
      const result = await createLetter(
        letterTitle,
        letterContent,
        finalEmployeeId,
        letterType || 'General Letter',
        category as any,
        source as any,
        selectedTemplate || undefined
      );

      if (result?.error) {
        console.error('Save letter error:', result.error);
        throw new Error(result.error.message);
      }

      toast({
        title: "Letter Saved",
        description: "The letter has been saved to the employee's documents."
      });

      // Reset form
      setSelectedEmployee('');
      setSelectedTemplate('');
      setLetterType('');
      setSituationDescription('');
      setLetterContent('');
      setLetterTitle('');
      setGenerationError('');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: `Failed to save the letter: ${(error as any)?.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const downloadLetter = () => {
    if (!letterContent) {
      toast({
        title: "No Content",
        description: "Please write or generate a letter first.",
        variant: "destructive"
      });
      return;
    }

    const blob = new Blob([letterContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${letterTitle || 'Letter'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = async () => {
    if (!letterContent) {
      toast({
        title: "No Content",
        description: "Please write or generate a letter first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Set font and split text to fit PDF width
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const textWidth = pageWidth - 2 * margin;
      
      const lines = doc.splitTextToSize(letterContent, textWidth);
      
      doc.text(lines, margin, 30);
      doc.save(`${letterTitle || 'Letter'}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Letter has been downloaded as PDF."
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const downloadAsWord = async () => {
    if (!letterContent) {
      toast({
        title: "No Content",
        description: "Please write or generate a letter first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { Document, Packer, Paragraph, TextRun } = await import('docx');
      
      // Split content into paragraphs
      const paragraphs = letterContent.split('\n\n').map(text => 
        new Paragraph({
          children: [new TextRun(text.trim())],
          spacing: { after: 200 }
        })
      );

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${letterTitle || 'Letter'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Word Document Downloaded",
        description: "Letter has been downloaded as Word document."
      });
    } catch (error) {
      console.error('Word generation error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate Word document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sendEmailToEmployee = async () => {
    if (!selectedEmployee || !letterContent || !letterTitle) {
      toast({
        title: "Missing Information",
        description: "Please select an employee and have letter content ready.",
        variant: "destructive"
      });
      return;
    }

    if (!employee?.email) {
      toast({
        title: "No Email Found",
        description: "The selected employee doesn't have an email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      // Get company name from letterhead settings
      const { data: letterheadData } = await supabase
        .from('letterhead_settings')
        .select('company_name')
        .eq('is_active', true)
        .single();

      const response = await supabase.functions.invoke('send-letter-email', {
        body: {
          recipientEmail: employee.email,
          recipientName: `${employee.first_name} ${employee.last_name}`,
          letterTitle,
          letterContent,
          senderName: 'HR Department',
          companyName: letterheadData?.company_name || 'Our Organization'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send email');
      }

      toast({
        title: "Email Sent Successfully",
        description: `Letter has been sent to ${employee.email}`
      });
    } catch (error) {
      console.error('Email sending error:', error);
      toast({
        title: "Email Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Write Letter</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Letter Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Letter Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="employee">Select Employee *</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} - {emp.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="template">Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.template_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="letterType">Letter Type</Label>
              <Input
                id="letterType"
                value={letterType}
                onChange={(e) => setLetterType(e.target.value)}
                placeholder="e.g., Show Cause, Promotion, Warning"
              />
            </div>

            <div>
              <Label htmlFor="title">Letter Title *</Label>
              <Input
                id="title"
                value={letterTitle}
                onChange={(e) => setLetterTitle(e.target.value)}
                placeholder="Enter letter title"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="situation">Describe the Situation</Label>
              <Textarea
                id="situation"
                value={situationDescription}
                onChange={(e) => setSituationDescription(e.target.value)}
                placeholder="Describe the situation that requires this letter..."
                rows={4}
              />
            </div>

            {generationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generationError}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={generateWithAI}
              disabled={isGenerating || !selectedEmployee}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={saveLetter}
              disabled={isSaving || !letterContent || !selectedEmployee}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Save Letter
                </>
              )}
            </Button>

            <Button 
              onClick={downloadLetter}
              disabled={!letterContent}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download TXT
            </Button>

            <Button 
              onClick={downloadAsPDF}
              disabled={!letterContent}
              variant="outline"
              className="w-full"
            >
              <FileImage className="h-4 w-4 mr-2" />
              Download PDF
            </Button>

            <Button 
              onClick={downloadAsWord}
              disabled={!letterContent}
              variant="outline"
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Word
            </Button>

            <Button 
              onClick={sendEmailToEmployee}
              disabled={isSendingEmail || !letterContent || !selectedEmployee || !employee?.email}
              variant="outline"
              className="w-full"
            >
              {isSendingEmail ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Email to {employee?.first_name || 'Employee'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Letter Content */}
      <Card>
        <CardHeader>
          <CardTitle>Letter Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={letterContent}
            onChange={(e) => setLetterContent(e.target.value)}
            placeholder="Write your letter here or use AI generation..."
            rows={20}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LetterWriter;
