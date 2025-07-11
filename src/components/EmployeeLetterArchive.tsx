
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { 
  FileText, 
  Search,
  Calendar,
  Download,
  Eye
} from 'lucide-react';

interface EmployeeLetterArchiveProps {
  employeeId?: string;
}

const EmployeeLetterArchive = ({ employeeId }: EmployeeLetterArchiveProps) => {
  const { user } = useAuth();
  const { canAccessAdmin } = useProfile();
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchLetters();
    }
  }, [user, employeeId]);

  const fetchLetters = async () => {
    try {
      let query = supabase
        .from('documents')
        .select(`
          *,
          employee:employee_profiles(first_name, last_name),
          uploaded_by_profile:profiles!documents_uploaded_by_fkey(first_name, last_name)
        `)
        .not('letter_content', 'is', null)
        .order('created_at', { ascending: false });

      // If employeeId is provided, filter by that employee
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      // If not admin and no specific employee, show only user's letters
      else if (!canAccessAdmin()) {
        query = query.eq('employee_id', user?.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching letters:', error);
      } else {
        setLetters(data || []);
      }
    } catch (error) {
      console.error('Error fetching letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      disciplinary: 'bg-red-100 text-red-800',
      contractual: 'bg-blue-100 text-blue-800',
      recognition: 'bg-green-100 text-green-800',
      administrative: 'bg-yellow-100 text-yellow-800',
      performance: 'bg-purple-100 text-purple-800'
    };
    
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      manual: 'bg-blue-100 text-blue-800',
      ai_generated: 'bg-purple-100 text-purple-800',
      template: 'bg-green-100 text-green-800'
    };
    
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const viewLetter = (letter: any) => {
    // Create a new window/tab to view the letter
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${letter.title}</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .letterhead { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
              .content { white-space: pre-wrap; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="letterhead">
              <h1>Letter Document</h1>
              <p><strong>Title:</strong> ${letter.title}</p>
              <p><strong>Date:</strong> ${new Date(letter.created_at).toLocaleDateString()}</p>
            </div>
            <div class="content">${letter.letter_content}</div>
          </body>
        </html>
      `);
    }
  };

  const downloadLetter = (letter: any) => {
    const content = `${letter.title}\n\nDate: ${new Date(letter.created_at).toLocaleDateString()}\n\n${letter.letter_content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${letter.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLetters = letters.filter(letter =>
    letter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.letter_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-slate-600">Loading letters...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Letter Archive
          {filteredLetters.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {filteredLetters.length} letter{filteredLetters.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search letters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredLetters.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="font-medium">No letters found</p>
            <p className="text-sm mt-2">
              {letters.length === 0 ? "No letters have been created yet" : "Try adjusting your search terms"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLetters.map((letter) => (
              <div key={letter.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{letter.title}</h4>
                    {letter.letter_type && (
                      <p className="text-sm text-gray-600 mt-1">Type: {letter.letter_type}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(letter.created_at).toLocaleDateString()}
                      </span>
                      {letter.uploaded_by_profile && (
                        <span>
                          Created by: {letter.uploaded_by_profile.first_name} {letter.uploaded_by_profile.last_name}
                        </span>
                      )}
                      {!employeeId && letter.employee && (
                        <span>
                          For: {letter.employee.first_name} {letter.employee.last_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getCategoryBadge(letter.category)}>
                      {letter.category}
                    </Badge>
                    {letter.source && (
                      <Badge className={getSourceBadge(letter.source)}>
                        {letter.source.replace('_', ' ')}
                      </Badge>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewLetter(letter)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadLetter(letter)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeLetterArchive;
