import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/hooks/useAuth';
import { TenantProvider } from '@/contexts/TenantContext';
import DynamicFavicon from '@/components/DynamicFavicon';
import { getSavedTheme, applySidebarTheme } from '@/components/SidebarThemeSelector';

// Import pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/AuthCallback';
import ResetPassword from '@/pages/ResetPassword';
import SuperAdminAuth from '@/pages/SuperAdminAuth';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import JobDetails from '@/pages/JobDetails';
import JobsBoard from '@/pages/JobsBoard';
import Apply from '@/pages/Apply';
import Dashboard from '@/pages/Dashboard';
import Employees from '@/pages/Employees';
import Leave from '@/pages/Leave';
import LeaveForm from '@/pages/LeaveForm';
import LeaveApproval from '@/pages/LeaveApproval';
import Recruitment from '@/pages/Recruitment';
import Applications from '@/pages/Applications';
import Tickets from '@/pages/Tickets';
import Records from '@/pages/Records';
import Performance from '@/pages/Performance';
import Upskilling from '@/pages/Upskilling';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Layout from '@/pages/Layout';
import LeaveCalendar from '@/pages/LeaveCalendar';
import Onboarding from '@/pages/Onboarding';
import SaasAdmin from '@/pages/SaasAdmin';
import TenantRegister from '@/pages/TenantRegister';
import Tasks from '@/pages/Tasks';
import Assets from '@/pages/Assets';
import Clearances from '@/pages/Clearances';
import MyProfile from '@/pages/MyProfile';

const queryClient = new QueryClient();

function App() {
  // Apply saved sidebar theme on mount
  useEffect(() => {
    const savedTheme = getSavedTheme();
    applySidebarTheme(savedTheme);
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <DynamicFavicon />
            <Router>
              <Routes>
              <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin-auth" element={<SuperAdminAuth />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs-board" element={<JobsBoard />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/job-details" element={<JobDetails />} />
                <Route path="/apply/:jobId" element={<Apply />} />
                <Route path="/apply" element={<Apply />} />
                <Route path="/onboarding" element={<Onboarding />} />
                
                {/* SaaS Admin Routes */}
                <Route path="/saas-admin" element={<SaasAdmin />} />
                <Route path="/register-institution" element={<TenantRegister />} />
            {/* Protected routes with Layout */}
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
            </Route>
            
            <Route path="/employees" element={<Layout />}>
              <Route index element={<Employees />} />
            </Route>
            
            <Route path="/leave" element={<Layout />}>
              <Route index element={<Leave />} />
            </Route>

            <Route path="/leave/request" element={<Layout />}>
              <Route index element={<LeaveForm />} />
            </Route>

            <Route path="/leave-approval" element={<Layout />}>
              <Route index element={<LeaveApproval />} />
            </Route>

            <Route path="/leave/calendar" element={<Layout />}>
              <Route index element={<LeaveCalendar />} />
            </Route>
            
            <Route path="/recruitment" element={<Layout />}>
              <Route index element={<Recruitment />} />
            </Route>
            
            <Route path="/applications" element={<Layout />}>
              <Route index element={<Applications />} />
            </Route>
            
            <Route path="/tickets" element={<Layout />}>
              <Route index element={<Tickets />} />
            </Route>
            
            <Route path="/records" element={<Layout />}>
              <Route index element={<Records />} />
            </Route>
            
            <Route path="/performance" element={<Layout />}>
              <Route index element={<Performance />} />
            </Route>
            
            <Route path="/upskilling" element={<Layout />}>
              <Route index element={<Upskilling />} />
            </Route>

            <Route path="/tasks" element={<Layout />}>
              <Route index element={<Tasks />} />
            </Route>

            <Route path="/assets" element={<Layout />}>
              <Route index element={<Assets />} />
            </Route>

            <Route path="/clearances" element={<Layout />}>
              <Route index element={<Clearances />} />
            </Route>

            <Route path="/profile" element={<Layout />}>
              <Route index element={<MyProfile />} />
            </Route>
            
              <Route path="/settings" element={<Layout />}>
                <Route index element={<Settings />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" />
          </Router>
        </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
