import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Building2, LogOut, AlertTriangle } from 'lucide-react';
import TutagoraLogo from '@/components/TutagoraLogo';

interface SaasAdminHeaderProps {
  onSignOut: () => void;
}

const SaasAdminHeader = ({ onSignOut }: SaasAdminHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <TutagoraLogo size="sm" />
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-700">
              <Crown className="h-5 w-5 text-amber-400" />
              <span className="font-semibold text-lg text-white">SUPERADMIN MODE</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-amber-200">Platform Admin Mode</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Go to App
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSignOut}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SaasAdminHeader;
