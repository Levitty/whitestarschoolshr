import { useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';

const DynamicFavicon = () => {
  const { tenant } = useTenant();

  useEffect(() => {
    const updateFavicon = (url: string | null) => {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach(link => link.remove());

      // Create new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      
      if (url) {
        link.href = url;
      } else {
        // Default favicon
        link.href = '/favicon.ico';
      }
      
      document.head.appendChild(link);
    };

    // Update favicon when tenant changes
    if (tenant?.favicon_url) {
      updateFavicon(tenant.favicon_url);
    } else {
      updateFavicon(null);
    }

    // Cleanup: restore default favicon when component unmounts
    return () => {
      // Don't reset on unmount to keep favicon persistent
    };
  }, [tenant?.favicon_url]);

  return null; // This component doesn't render anything
};

export default DynamicFavicon;
