
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, FileText, Check } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';

const CameraUpload = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('employment_records');
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadDocument } = useDocuments();
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf' || 
          file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        handleUpload(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload images, PDF, or Word documents only.",
          variant: "destructive"
        });
      }
    }
  };

  const handleCameraUpload = async () => {
    if (!capturedImage) return;

    // Convert data URL to blob
    const response = await fetch(capturedImage);
    const blob = await response.blob();
    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for the document.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const result = await uploadDocument(
        file,
        title,
        description,
        category as any
      );

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully!",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('employment_records');
      setCapturedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employment_records">Employment Records</SelectItem>
                <SelectItem value="disciplinary_records">Disciplinary Records</SelectItem>
                <SelectItem value="performance_records">Performance Records</SelectItem>
                <SelectItem value="leave_requests">Leave Requests</SelectItem>
                <SelectItem value="shared_documents">Shared Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          />
        </div>

        {/* Camera Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Take Photo</h3>
          
          {!isCapturing && !capturedImage && (
            <Button onClick={startCamera} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          )}

          {isCapturing && (
            <div className="space-y-2">
              <video ref={videoRef} autoPlay className="w-full rounded-lg" />
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-2">
              <img src={capturedImage} alt="Captured" className="w-full rounded-lg" />
              <div className="flex gap-2">
                <Button 
                  onClick={handleCameraUpload} 
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
                <Button 
                  onClick={() => setCapturedImage(null)} 
                  variant="outline"
                  className="flex-1"
                >
                  Retake
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Upload File</h3>
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Browse
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Supported formats: Images, PDF, Word documents
          </p>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};

export default CameraUpload;
