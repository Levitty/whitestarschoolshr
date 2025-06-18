
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface DocumentUploadProps {
  onSuccess?: () => void;
}

const DocumentUpload = ({ onSuccess }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const { uploadDocument } = useDocuments();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category) return;

    setUploading(true);
    const { error } = await uploadDocument(file, title, description, category as any);

    if (error) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully."
      });
      setFile(null);
      setTitle('');
      setDescription('');
      setCategory('');
      onSuccess?.();
    }
    setUploading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employment_records">Employment Records</SelectItem>
                <SelectItem value="disciplinary_records">Disciplinary Records</SelectItem>
                <SelectItem value="performance_records">Performance Records</SelectItem>
                <SelectItem value="shared_documents">Shared Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Document description"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={uploading || !file || !title || !category}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
