import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2,
  Tag,
  X
} from 'lucide-react';

interface LetterCategory {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

const COLORS = [
  { value: 'red', label: 'Red', class: 'bg-red-100 text-red-800' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-100 text-blue-800' },
  { value: 'green', label: 'Green', class: 'bg-green-100 text-green-800' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-100 text-yellow-800' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-100 text-purple-800' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-100 text-pink-800' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-100 text-orange-800' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-100 text-gray-800' },
];

const LetterCategoryManager = () => {
  const [categories, setCategories] = useState<LetterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LetterCategory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'gray'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('letter_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('letter_categories')
          .update({
            name: formData.name,
            description: formData.description || null,
            color: formData.color,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('letter_categories')
          .insert({
            name: formData.name,
            description: formData.description || null,
            color: formData.color
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category created successfully"
        });
      }
      
      handleCloseForm();
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (category: LetterCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || 'gray'
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    
    try {
      const { error } = await supabase
        .from('letter_categories')
        .update({ is_active: false })
        .eq('id', deleteConfirmId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive"
      });
    }
    setDeleteConfirmId(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: 'gray'
    });
  };

  const getColorClass = (color: string | null) => {
    const found = COLORS.find(c => c.value === color);
    return found?.class || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Letter Categories</h2>
          <p className="text-muted-foreground">Manage categories for letter templates</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCloseForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Disciplinary"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${color.class.split(' ')[0]}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingCategory ? 'Update Category' : 'Create Category'}</Button>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{category.name}</span>
                </div>
                <Badge className={getColorClass(category.color)}>
                  {category.color}
                </Badge>
              </div>
              
              {category.description && (
                <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteConfirmId(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Categories Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first letter category to get started</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Existing templates using this category will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LetterCategoryManager;
