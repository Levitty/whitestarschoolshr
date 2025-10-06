import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, File, X, CheckCircle } from 'lucide-react';
import { useJobApplications } from '@/hooks/useJobApplications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
}

const Apply = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { createApplication, uploadCV } = useJobApplications();
  const { toast } = useToast();
  
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [formData, setFormData] = useState({
    candidate_name: '',
    candidate_email: '',
    phone_number: '',
    note: ''
  });

  const searchParams = new URLSearchParams(location.search);
  const jobId = searchParams.get('id');

  useEffect(() => {
    console.log('Apply page loaded with jobId:', jobId);
    
    const fetchJob = async () => {
      if (!jobId) {
        console.error('No job ID provided in URL');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching job with ID:', jobId);
        const { data, error } = await supabase
          .from('job_listings')
          .select('id, title, department, location')
          .eq('id', jobId)
          .eq('status', 'Open')
          .single();

        if (error) {
          console.error('Error fetching job:', error);
          throw error;
        }
        
        console.log('Job fetched successfully:', data);
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
  }, [jobId, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', { name: file.name, size: file.size, type: file.type });
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF, DOC, or DOCX file",
          variant: "destructive"
        });
        return;
      }
      
      setCvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== STARTING APPLICATION SUBMISSION ===');
    console.log('Device info:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    });
    console.log('Form data:', formData);
    console.log('Job ID:', jobId);
    console.log('CV file:', cvFile?.name);
    
    if (!formData.candidate_name.trim() || !formData.candidate_email.trim() || !formData.phone_number.trim() || !cvFile || !formData.note.trim() || !jobId) {
      console.error('Validation failed - missing required fields');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including CV and cover letter",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.candidate_email)) {
      console.error('Email validation failed');
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      let cvUrl = null;
      
      // Upload CV if provided
      if (cvFile) {
        console.log('=== UPLOADING CV ===');
        try {
          cvUrl = await uploadCV(cvFile, jobId, formData.candidate_name);
          console.log('CV uploaded successfully, URL:', cvUrl);
        } catch (cvError) {
          console.error('CV upload failed:', cvError);
          toast({
            title: "CV Upload Failed",
            description: "Continuing without CV attachment",
            variant: "destructive"
          });
        }
      }

      // Create application
      console.log('=== CREATING APPLICATION ===');
      const applicationData = {
        job_id: jobId,
        candidate_name: formData.candidate_name.trim(),
        candidate_email: formData.candidate_email.trim(),
        phone_number: formData.phone_number.trim(),
        note: formData.note.trim(),
        cv_url: cvUrl || undefined
      };
      
      console.log('Application data to submit:', applicationData);
      
      const applicationResult = await createApplication(applicationData);
      console.log('Application created successfully:', applicationResult);
      
      toast({
        title: "Success",
        description: "Application submitted successfully!"
      });
      
      setSubmitted(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/jobs-board');
      }, 3000);
      
    } catch (error: any) {
      console.error('=== APPLICATION SUBMISSION FAILED ===');
      console.error('Error details:', error);
      
      let errorMessage = "Failed to submit application. Please try again.";
      
      if (error.message) {
        if (error.message.includes('CV upload failed')) {
          errorMessage = "Failed to upload CV. Please try again or submit without CV.";
        } else if (error.message.includes('Application submission failed')) {
          errorMessage = "Failed to submit application. Please check your details and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Submission Error",
        description: errorMessage,
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application form...</p>
          </div>
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
          <Button onClick={() => navigate('/jobs-board')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs Board
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-6" />
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                Application Submitted Successfully!
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for applying to the <strong>{job.title}</strong> position. 
                We have received your application and will review it shortly.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Redirecting to jobs board...
              </p>
              <Button onClick={() => navigate('/jobs-board')}>
                View More Jobs
              </Button>
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
          <Button variant="ghost" onClick={() => navigate('/jobs-board')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs Board
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Apply for Position</CardTitle>
            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">{job.title}</p>
              <p>{job.department} • {job.location}</p>
            </div>
          </CardHeader>
          <CardContent>
            <form noValidate ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="cv">Upload CV *</Label>
                <div className="mt-2">
                  {!cvFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        id="cv"
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx"
                        disabled={submitting}
                      />
                      <Label htmlFor="cv" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload your CV
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX up to 10MB
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
                        disabled={submitting}
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
                  disabled={submitting}
                />
              </div>

              <Button 
                type="button" 
                className="w-full touch-action-manipulation" 
                disabled={submitting}
                size="lg"
                onClick={() => formRef.current?.requestSubmit()}
                onTouchEnd={() => formRef.current?.requestSubmit()}
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

export default Apply;
