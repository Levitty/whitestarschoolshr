
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Building, 
  Upload, 
  Save,
  Image as ImageIcon
} from 'lucide-react';

const LetterheadSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({
    id: '',
    company_name: '',
    logo_url: '',
    header_image_url: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });

  useEffect(() => {
    fetchLetterheadSettings();
  }, []);

  const fetchLetterheadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('letterhead_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching letterhead settings:', error);
      } else if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching letterhead settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'header') => {
    if (!user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('letterhead-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('letterhead-images')
        .getPublicUrl(filePath);

      setSettings(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'header_image_url']: publicUrl
      }));

      toast({
        title: "Image Uploaded",
        description: `${type === 'logo' ? 'Logo' : 'Header image'} uploaded successfully.`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      if (settings.id) {
        // Update existing record
        const updateData = {
          company_name: settings.company_name,
          logo_url: settings.logo_url,
          header_image_url: settings.header_image_url,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          website: settings.website,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('letterhead_settings')
          .update(updateData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new record (exclude id field)
        const insertData = {
          company_name: settings.company_name,
          logo_url: settings.logo_url,
          header_image_url: settings.header_image_url,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          website: settings.website,
          created_by: user.id,
          is_active: true
        };

        const { data, error } = await supabase
          .from('letterhead_settings')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
      }

      toast({
        title: "Settings Saved",
        description: "Letterhead settings have been saved successfully."
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-slate-600">Loading letterhead settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Letterhead Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={settings.company_name}
              onChange={(e) => setSettings(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={settings.website}
              onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
              placeholder="www.yourcompany.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contact@yourcompany.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={settings.address}
            onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Company address for letterhead"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {settings.logo_url ? (
                <div className="space-y-2">
                  <img 
                    src={settings.logo_url} 
                    alt="Company Logo" 
                    className="max-h-20 mx-auto"
                  />
                  <p className="text-sm text-gray-600">Logo uploaded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">No logo uploaded</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'logo');
                }}
                className="hidden"
                id="logo-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={uploading}
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Header Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {settings.header_image_url ? (
                <div className="space-y-2">
                  <img 
                    src={settings.header_image_url} 
                    alt="Header Image" 
                    className="max-h-20 mx-auto"
                  />
                  <p className="text-sm text-gray-600">Header image uploaded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">No header image</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'header');
                }}
                className="hidden"
                id="header-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('header-upload')?.click()}
                disabled={uploading}
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Header'}
              </Button>
            </div>
          </div>
        </div>

        <Button onClick={saveSettings} disabled={saving} className="w-full">
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LetterheadSettings;
