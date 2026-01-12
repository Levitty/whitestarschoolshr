import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image, Trash2, Loader2 } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TenantBrandingUpload = () => {
  const { tenant, refreshTenant } = useTenant();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tenant) return;

    // Validate file type
    const allowedTypes = ['image/x-icon', 'image/png', 'image/jpeg', 'image/svg+xml', 'image/ico'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.ico')) {
      toast.error('Please upload an ICO, PNG, JPG, or SVG file');
      return;
    }

    // Validate file size (max 500KB for favicons)
    if (file.size > 500 * 1024) {
      toast.error('Favicon file must be less than 500KB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenant.id}/favicon.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(fileName);

      // Update tenant record
      const { error: updateError } = await supabase
        .from('tenants')
        .update({ favicon_url: urlData.publicUrl })
        .eq('id', tenant.id);

      if (updateError) throw updateError;

      await refreshTenant();
      toast.success('Favicon uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading favicon:', error);
      toast.error(error.message || 'Failed to upload favicon');
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tenant) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, SVG, or WebP file');
      return;
    }

    // Validate file size (max 2MB for logos)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo file must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenant.id}/logo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(fileName);

      // Update tenant record
      const { error: updateError } = await supabase
        .from('tenants')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', tenant.id);

      if (updateError) throw updateError;

      await refreshTenant();
      toast.success('Logo uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFavicon = async () => {
    if (!tenant?.favicon_url) return;

    setDeleting(true);
    try {
      // Extract file path from URL
      const urlParts = tenant.favicon_url.split('/tenant-assets/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('tenant-assets').remove([filePath]);
      }

      // Clear favicon_url in database
      const { error } = await supabase
        .from('tenants')
        .update({ favicon_url: null })
        .eq('id', tenant.id);

      if (error) throw error;

      await refreshTenant();
      toast.success('Favicon removed');
    } catch (error: any) {
      console.error('Error deleting favicon:', error);
      toast.error(error.message || 'Failed to remove favicon');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!tenant?.logo_url) return;

    setDeleting(true);
    try {
      // Extract file path from URL
      const urlParts = tenant.logo_url.split('/tenant-assets/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('tenant-assets').remove([filePath]);
      }

      // Clear logo_url in database
      const { error } = await supabase
        .from('tenants')
        .update({ logo_url: null })
        .eq('id', tenant.id);

      if (error) throw error;

      await refreshTenant();
      toast.success('Logo removed');
    } catch (error: any) {
      console.error('Error deleting logo:', error);
      toast.error(error.message || 'Failed to remove logo');
    } finally {
      setDeleting(false);
    }
  };

  if (!tenant) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No tenant selected
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-blue-900">
          <Image className="h-6 w-6 text-purple-600" />
          Institution Branding
        </CardTitle>
        <CardDescription>
          Upload your institution's favicon (browser tab icon) and logo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Favicon Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Favicon (Browser Tab Icon)</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden">
              {tenant.favicon_url ? (
                <img 
                  src={tenant.favicon_url} 
                  alt="Current favicon" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <Image className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Label htmlFor="favicon-upload" className="cursor-pointer">
                  <Input
                    id="favicon-upload"
                    type="file"
                    accept=".ico,.png,.jpg,.jpeg,.svg"
                    onChange={handleFaviconUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                    <span>
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Favicon
                    </span>
                  </Button>
                </Label>
                {tenant.favicon_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDeleteFavicon}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: 32x32 or 64x64 pixels. Supports ICO, PNG, JPG, SVG (max 500KB)
              </p>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Institution Logo</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-16 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden">
              {tenant.logo_url ? (
                <img 
                  src={tenant.logo_url} 
                  alt="Current logo" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Image className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.webp"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                    <span>
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Logo
                    </span>
                  </Button>
                </Label>
                {tenant.logo_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDeleteLogo}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: PNG or SVG with transparent background (max 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* Current Tenant Info */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Managing branding for: <span className="font-medium text-foreground">{tenant.name}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantBrandingUpload;
