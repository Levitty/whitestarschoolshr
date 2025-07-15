
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, MessageSquare, FileText, User, Mail, Calendar } from 'lucide-react';
import { useJobApplications } from '@/hooks/useJobApplications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ApplicationsList = () => {
  const { applications, loading, updateApplicationStatus } = useJobApplications();
  const { toast } = useToast();
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
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Interview': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Hired': 'bg-green-100 text-green-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const downloadCV = async (cvUrl: string, candidateName: string) => {
    try {
      console.log('Downloading CV from:', cvUrl);
      
      // Check if the URL is a full URL or just a path
      if (cvUrl.startsWith('http')) {
        // If it's a full URL, try to download directly
        const response = await fetch(cvUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch CV');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${candidateName.replace(/\s+/g, '_')}_CV.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Extract the file path from the URL
        const urlParts = cvUrl.split('/');
        const bucketIndex = urlParts.findIndex(part => part === 'cv-uploads');
        
        if (bucketIndex === -1) {
          throw new Error('Invalid CV URL format');
        }
        
        const filePath = urlParts.slice(bucketIndex + 1).join('/');
        console.log('File path:', filePath);
        
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
        const blob = new Blob([data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${candidateName.replace(/\s+/g, '_')}_CV`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      console.log('CV downloaded successfully');
      toast({
        title: "Success",
        description: "CV downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast({
        title: "Download Error",
        description: "Failed to download CV. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading applications...</span>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Applications Yet</h3>
        <p className="text-gray-500">Applications will appear here once candidates start applying.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Job Applications</h2>
          <p className="text-gray-600">{applications.length} total applications</p>
        </div>
      </div>

      <div className="grid gap-4">
        {applications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <h3 className="text-lg font-semibold">{application.candidate_name}</h3>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {application.candidate_email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied {new Date(application.applied_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 font-medium">
                    Position: {application.job_listings?.title} • {application.job_listings?.department}
                  </p>
                </div>
              </div>

              {application.note && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 font-medium mb-1">Cover Letter:</p>
                  <p className="text-sm text-gray-700">{application.note}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
