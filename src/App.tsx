
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Import pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
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
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import LeaveCalendar from '@/pages/LeaveCalendar';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/apply/:jobId" element={<Apply />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/employees" element={
            <ProtectedRoute>
              <Layout>
                <Employees />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/leave" element={
            <ProtectedRoute>
              <Layout>
                <Leave />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/leave/request" element={
            <ProtectedRoute>
              <Layout>
                <LeaveForm />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/leave/approval" element={
            <ProtectedRoute>
              <Layout>
                <LeaveApproval />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/leave/calendar" element={
            <ProtectedRoute>
              <Layout>
                <LeaveCalendar />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/recruitment" element={
            <ProtectedRoute>
              <Layout>
                <Recruitment />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/applications" element={
            <ProtectedRoute>
              <Layout>
                <Applications />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/tickets" element={
            <ProtectedRoute>
              <Layout>
                <Tickets />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/records" element={
            <ProtectedRoute>
              <Layout>
                <Records />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/performance" element={
            <ProtectedRoute>
              <Layout>
                <Performance />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/upskilling" element={
            <ProtectedRoute>
              <Layout>
                <Upskilling />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
