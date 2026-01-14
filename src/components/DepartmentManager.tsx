import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

const DepartmentManager = () => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { tenant } = useTenant();
  const { departments, loading, createDepartment, deleteDepartment } = useDepartments(tenant?.id);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Department name is required.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    const { error } = await createDepartment(formData.name.trim(), formData.description.trim() || undefined);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to create department. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Department created successfully!"
      });
      setFormData({ name: '', description: '' });
      setOpen(false);
    }
    
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const { error } = await deleteDepartment(id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete department. It may be in use by employees.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Department "${name}" deleted successfully!`
      });
    }
  };

  if (loading) {
    return <div>Loading departments...</div>;
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-3 text-blue-900">
            <Building2 className="h-6 w-6 text-blue-600" />
            Department Management
          </span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Department Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Information Technology"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the department"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Department'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 text-sm mb-6">
          Manage organizational departments. Add new departments or remove existing ones.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((department) => (
            <Card key={department.id} className="border border-slate-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 mb-1">{department.name}</h4>
                    {department.description && (
                      <p className="text-sm text-slate-600 mb-2">{department.description}</p>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Department</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the "{department.name}" department? 
                          This action cannot be undone and may affect employees assigned to this department.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(department.id, department.name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {departments.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p>No departments found. Create your first department above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentManager;