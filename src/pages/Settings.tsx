import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, FileText, Users, Shield, Bell, UserCheck, Tag, Palette, Activity } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';
import SuperAdminSetup from '@/components/SuperAdminSetup';
import RolePermissionsManager from '@/components/RolePermissionsManager';
import AccountApprovalManager from '@/components/AccountApprovalManager';
import DepartmentManager from '@/components/DepartmentManager';
import { EmployeeProfileLinker } from '@/components/EmployeeProfileLinker';
import LetterCategoryManager from '@/components/LetterCategoryManager';
import DocumentTemplateManager from '@/components/DocumentTemplateManager';
import TenantBrandingUpload from '@/components/TenantBrandingUpload';
import LoginAuditLog from '@/components/admin/LoginAuditLog';

const Settings = () => {
  return (
    <RoleGuard 
      allowedRoles={['superadmin', 'admin']} 
      fallbackMessage="System settings are only accessible to super administrators."
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-slate-600 mt-2">
              Configure system preferences, user permissions, and account approvals
            </p>
          </div>

          <Tabs defaultValue="approvals" className="space-y-6">
            <TabsList className="grid w-full grid-cols-11">
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="employee-linking">Linking</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="login-audit">Login Audit</TabsTrigger>
              <TabsTrigger value="notifications">Alerts</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="approvals">
              <AccountApprovalManager />
            </TabsContent>

            <TabsContent value="permissions">
              <RolePermissionsManager />
            </TabsContent>

            <TabsContent value="users">
              <SuperAdminSetup />
            </TabsContent>

            <TabsContent value="departments">
              <DepartmentManager />
            </TabsContent>

            <TabsContent value="branding">
              <TenantBrandingUpload />
            </TabsContent>

            <TabsContent value="employee-linking">
              <EmployeeProfileLinker />
            </TabsContent>

            <TabsContent value="templates">
              <DocumentTemplateManager />
            </TabsContent>

            <TabsContent value="categories">
              <LetterCategoryManager />
            </TabsContent>

            <TabsContent value="login-audit">
              <LoginAuditLog />
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-blue-900">
                    <Bell className="h-6 w-6 text-orange-600" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">
                    Configure email notifications, reminders, and system alerts for various events
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-blue-900">
                    <SettingsIcon className="h-6 w-6 text-purple-600" />
                    System Configuration
                  </CardTitle>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleGuard>
  );
};

export default Settings;
