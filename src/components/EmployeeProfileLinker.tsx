import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertCircle, Link2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UnlinkedEmployee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export const EmployeeProfileLinker = () => {
  const [unlinkedEmployees, setUnlinkedEmployees] = useState<UnlinkedEmployee[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch employee_profiles with NULL profile_id
      const { data: employeesData, error: employeesError } = await supabase
        .from('employee_profiles')
        .select('id, employee_number, first_name, last_name, email')
        .is('profile_id', null);

      if (employeesError) throw employeesError;

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('email');

      if (profilesError) throw profilesError;

      setUnlinkedEmployees(employeesData || []);
      setProfiles(profilesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (employeeId: string, profileId: string) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('employee_profiles')
        .update({ profile_id: profileId })
        .eq('id', employeeId);

      if (error) throw error;

      toast.success('Employee linked successfully');
      
      // Remove from unlinked list
      setUnlinkedEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setSelectedLinks(prev => {
        const newLinks = { ...prev };
        delete newLinks[employeeId];
        return newLinks;
      });
    } catch (error) {
      console.error('Error linking employee:', error);
      toast.error('Failed to link employee');
    } finally {
      setSaving(false);
    }
  };

  const autoMatchByEmail = () => {
    const newLinks: Record<string, string> = {};
    unlinkedEmployees.forEach(emp => {
      const matchingProfile = profiles.find(p => p.email === emp.email);
      if (matchingProfile) {
        newLinks[emp.id] = matchingProfile.id;
      }
    });
    setSelectedLinks(newLinks);
    if (Object.keys(newLinks).length > 0) {
      toast.success(`Auto-matched ${Object.keys(newLinks).length} employee(s) by email`);
    } else {
      toast.info('No automatic matches found');
    }
  };

  if (loading) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>;
  }

  if (unlinkedEmployees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            All Employees Linked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">All employee profiles are properly linked to user accounts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Link Employee Profiles to User Accounts
        </CardTitle>
        <CardDescription>
          {unlinkedEmployees.length} employee(s) need to be linked to their user accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Employee profiles must be linked to user accounts for documents and other features to work correctly.
          </AlertDescription>
        </Alert>

        <Button onClick={autoMatchByEmail} variant="outline" className="w-full">
          <Link2 className="h-4 w-4 mr-2" />
          Auto-Match by Email
        </Button>

        <div className="space-y-4">
          {unlinkedEmployees.map(employee => (
            <div key={employee.id} className="border rounded-lg p-4 space-y-3">
              <div>
                <p className="font-medium">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{employee.email}</p>
                <p className="text-xs text-muted-foreground">Employee #{employee.employee_number}</p>
              </div>

              <div className="flex gap-2">
                <Select
                  value={selectedLinks[employee.id] || ''}
                  onValueChange={(value) => setSelectedLinks(prev => ({ ...prev, [employee.id]: value }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select user account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.email} {profile.first_name && `(${profile.first_name} ${profile.last_name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => handleLink(employee.id, selectedLinks[employee.id])}
                  disabled={!selectedLinks[employee.id] || saving}
                >
                  Link
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
