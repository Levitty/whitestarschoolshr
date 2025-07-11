
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, FileText, Users, Shield, Bell } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

const Settings = () => {
  const { profile } = useProfile();

  // Only allow admin users to access settings
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-700 mb-2">Access Denied</h2>
              <p className="text-red-600">You don't have permission to access system settings.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-slate-600 mt-2">
            Configure system preferences, templates, and permissions
          </p>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <FileText className="h-6 w-6 text-blue-600" />
                Letter Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm">
                Manage document templates for letters, certificates, and other official documents
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <Users className="h-6 w-6 text-green-600" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm">
                Configure user roles, permissions, and access levels for different departments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <Bell className="h-6 w-6 text-orange-600" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm">
                Set up email notifications, reminders, and system alerts for various events
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <SettingsIcon className="h-6 w-6 text-purple-600" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm">
                Configure general system settings, backup schedules, and maintenance options
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <Shield className="h-6 w-6 text-red-600" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm">
                Manage security policies, password requirements, and access controls
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Settings Summary */}
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-700">System Status</h4>
                <p className="text-sm text-slate-600">All systems operational</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-700">Last Backup</h4>
                <p className="text-sm text-slate-600">Today at 03:00 AM</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-700">Active Users</h4>
                <p className="text-sm text-slate-600">24 users online</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-700">Storage Usage</h4>
                <p className="text-sm text-slate-600">2.3 GB of 10 GB used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
