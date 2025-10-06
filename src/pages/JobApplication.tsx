
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, File, X, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
}

const JobApplication = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    candidate_name: '',
    candidate_email: '',
    phone_number: '',
    note: ''
  });

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      try {
        const { data, error } = await supabase
          .from('job_listings')
          .select('id, title, department, location')
          .eq('id', jobId)
          .eq('status', 'Open')
          .single();

        if (error) throw error;
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: "Error",
          description: "Could not load job details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      setCvFile(file);
    }
  };

  const uploadCV = async (file: File, applicationId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${applicationId}/cv.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('cv-uploads')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('cv-uploads')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== JOB APPLICATION SUBMISSION ===');
    console.log('Device info:', {
      userAgent: navigator.userAgent,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    });
    console.log('Form data:', formData);
    console.log('CV file:', cvFile?.name);
    
    if (!formData.candidate_name || !formData.candidate_email || !formData.phone_number || !cvFile || !formData.note || !jobId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including CV and cover letter",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create application
      const { data: application, error: appError } = await supabase
        .from('job_applications')
        .insert([{
          job_id: jobId,
          candidate_name: formData.candidate_name,
          candidate_email: formData.candidate_email,
          phone_number: formData.phone_number,
          note: formData.note
        }])
        .select()
        .single();

      if (appError) throw appError;

      // Upload CV if provided
      let cvUrl = null;
      if (cvFile) {
        cvUrl = await uploadCV(cvFile, application.id);
        
        // Update application with CV URL
        const { error: updateError } = await supabase
          .from('job_applications')
          .update({ cv_url: cvUrl })
          .eq('id', application.id);

        if (updateError) throw updateError;
      }

      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll be in touch soon.",
      });
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">Loading application form...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">
            Job Not Found
          </h1>
          <p className="text-gray-500 mb-6">
            This position may have been filled or is no longer available.
          </p>
          <Button onClick={() => navigate('/jobs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-6" />
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                Application Submitted Successfully!
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for applying to the <strong>{job.title}</strong> position. 
                We have received your application and will review it shortly.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                You should receive a confirmation email at {formData.candidate_email} within the next few minutes.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/jobs')} variant="outline">
                  View More Jobs
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Submit Another Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/jobs')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Apply for Position</CardTitle>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{job.title}</p>
              <p>{job.department} • {job.location}</p>
            </div>
          </CardHeader>
          <CardContent>
            <form noValidate onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.candidate_name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      candidate_name: e.target.value 
                    }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.candidate_email}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      candidate_email: e.target.value 
                    }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    phone_number: e.target.value 
                  }))}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              {/* CV Upload */}
              <div>
                <Label htmlFor="cv">Resume/CV *</Label>
                <div className="mt-2">
                  {!cvFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        id="cv"
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx"
                      />
                      <Label htmlFor="cv" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload your resume/CV
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX up to 5MB
                        </p>
                      </Label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <File className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">{cvFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCvFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="note">Cover Letter *</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    note: e.target.value 
                  }))}
                  placeholder="Tell us why you're interested in this position..."
                  rows={4}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full touch-action-manipulation" 
                disabled={submitting}
                size="lg"
                onClick={(e) => {
                  console.log('Submit button clicked - mobile debug');
                }}
              >
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobApplication;
