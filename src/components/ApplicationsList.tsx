import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Eye, MessageSquare } from 'lucide-react';
import { useJobApplications } from '@/hooks/useJobApplications';
import { supabase } from '@/integrations/supabase/client';

export const ApplicationsList = () => {
  const { applications, loading, updateApplicationStatus } = useJobApplications();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [noteUpdate, setNoteUpdate] = useState('');

  const handleStatusUpdate = async (appId: string, newStatus: any) => {
    try {
      await updateApplicationStatus(appId, newStatus, noteUpdate);
      setSelectedApp(null);
      setNoteUpdate('');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'New': 'secondary',
      'Interview': 'default',
      'Rejected': 'destructive',
      'Hired': 'default'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  const downloadCV = async (cvUrl: string, candidateName: string) => {
    try {
      // Extract the file path from the full URL
      const urlParts = cvUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'cv-uploads');
      if (bucketIndex === -1) {
        throw new Error('Invalid CV URL format');
      }
      
      const filePath = urlParts.slice(bucketIndex + 1).join('/');
      
      // Get the file from Supabase Storage
      const { data, error } = await supabase.storage
        .from('cv-uploads')
        .download(filePath);

      if (error) {
        console.error('Storage download error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No file data received');
      }

      // Create blob URL and download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidateName}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading CV:', error);
      // Could add toast notification here if needed
    }
  };

  if (loading) {
    return <div>Loading applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Job Applications</h2>
      </div>

      <div className="grid gap-4">
        {applications?.map((application) => (
          <Card key={application.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{application.candidate_name}</h3>
                  <p className="text-gray-600">
                    Applied for: {application.job_listings?.title} • {application.job_listings?.department}
                  </p>
                  <p className="text-sm text-gray-500">{application.candidate_email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(application.status)}
                </div>
              </div>

              {application.note && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{application.note}</p>
                </div>
              )}

              <div className="flex gap-2">
                {application.cv_url && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadCV(application.cv_url!, application.candidate_name)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download CV
                  </Button>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedApp(application.id);
                        setStatusUpdate(application.status);
                        setNoteUpdate(application.note || '');
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Update Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Application Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Hired">Hired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Internal Notes</label>
                        <Textarea
                          value={noteUpdate}
                          onChange={(e) => setNoteUpdate(e.target.value)}
                          placeholder="Add internal notes..."
                          rows={3}
                        />
                      </div>
                      <Button 
                        onClick={() => selectedApp && handleStatusUpdate(selectedApp, statusUpdate)}
                        className="w-full"
                      >
                        Update Application
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Applied: {new Date(application.applied_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
