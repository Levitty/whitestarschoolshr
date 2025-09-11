import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DocumentRow = Database['public']['Tables']['documents']['Row'];

interface DocumentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentRow | null;
}

const isImage = (mime?: string | null) => !!mime && mime.startsWith('image/');
const isPdf = (mime?: string | null) => mime === 'application/pdf' || (mime?.includes('pdf') ?? false);

export default function DocumentViewerDialog({ open, onOpenChange, document }: DocumentViewerDialogProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supportsInlinePreview = useMemo(() => {
    if (!document) return false;
    if (document.letter_content && !document.file_path) return true; // inline text letter
    return isPdf(document.file_type) || isImage(document.file_type);
  }, [document]);

  useEffect(() => {
    let active = true;
    const getUrl = async () => {
      if (!document?.file_path) {
        console.log('No file_path for document:', document);
        setSignedUrl(null);
        return;
      }
      try {
        setLoading(true);
        console.log('Creating signed URL for file:', document.file_path);
        console.log('Document file type:', document.file_type);
        
        const { data, error } = await supabase.storage
          .from('employee-documents')
          .createSignedUrl(document.file_path, 60);
        if (!active) return;
        if (error) {
          console.error('Failed to create signed URL', error);
          setSignedUrl(null);
        } else {
          console.log('Signed URL created successfully:', data?.signedUrl);
          setSignedUrl(data?.signedUrl ?? null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (open && document) {
      console.log('Document viewer opened with document:', {
        title: document.title,
        file_type: document.file_type,
        file_path: document.file_path,
        supportsPreview: supportsInlinePreview
      });
      getUrl();
    } else {
      setSignedUrl(null);
    }

    return () => {
      active = false;
    };
  }, [open, document?.file_path, document]);

  const handleDownload = async () => {
    if (!document?.file_path) return;
    const { data } = await supabase.storage
      .from('employee-documents')
      .createSignedUrl(document.file_path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{document?.title ?? 'Document Preview'}</span>
            {document?.file_path && (
              <Button size="sm" variant="outline" onClick={handleDownload}>
                Download
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="w-full h-full border rounded-md overflow-hidden">
          {loading && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && document && (
            <>
              {/* Inline letter content */}
              {document.letter_content && !document.file_path && (
                <div className="w-full h-full overflow-auto p-6 space-y-4">
                  <article className="prose max-w-none">
                    <h1 className="text-xl font-semibold">{document.title}</h1>
                    <p className="whitespace-pre-wrap leading-7">{document.letter_content}</p>
                  </article>
                </div>
              )}

              {/* PDF preview */}
              {document.file_path && isPdf(document.file_type) && signedUrl && (
                <iframe src={signedUrl} title={`${document.title} preview`} className="w-full h-full" />
              )}

              {/* Image preview */}
              {document.file_path && isImage(document.file_type) && signedUrl && (
                <div className="w-full h-full bg-background flex items-center justify-center">
                  <img src={signedUrl} alt={`${document.title} preview image`} className="max-h-full max-w-full object-contain" />
                </div>
              )}

              {/* Fallback */}
              {document.file_path && !supportsInlinePreview && (
                <div className="w-full h-full flex items-center justify-center text-sm">
                  <div className="text-center space-y-2">
                    <p>Preview not supported for this file type.</p>
                    <Button onClick={handleDownload}>Open / Download</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
