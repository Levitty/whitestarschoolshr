import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Recruitment from "./pages/Recruitment";
import Performance from "./pages/Performance";
import Upskilling from "./pages/Upskilling";
import Records from "./pages/Records";
import Leave from "./pages/Leave";
import Tickets from "./pages/Tickets";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import JobApplication from "./pages/JobApplication";
import NotFound from "./pages/NotFound";

// New recruitment system pages
import JobsBoard from "./pages/JobsBoard";
import JobDetails from "./pages/JobDetails";
import Apply from "./pages/Apply";
import Applications from "./pages/Applications";
import LeaveForm from "./pages/LeaveForm";
import LeaveApproval from "./pages/LeaveApproval";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Public recruitment system routes */}
            <Route path="/jobs-board" element={<JobsBoard />} />
            <Route path="/job-details" element={<JobDetails />} />
            <Route path="/apply" element={<Apply />} />
            
            {/* Legacy public job routes */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/apply/:jobId" element={<JobApplication />} />
            
            {/* Protected admin routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="recruitment" element={<Recruitment />} />
              <Route path="applications" element={<Applications />} />
              <Route path="performance" element={<Performance />} />
              <Route path="upskilling" element={<Upskilling />} />
              <Route path="records" element={<Records />} />
              <Route path="leave" element={<Leave />} />
              <Route path="leave-form" element={<LeaveForm />} />
              <Route path="leave-approval" element={<LeaveApproval />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="settings" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
