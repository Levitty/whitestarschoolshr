
import { useState } from 'react';
import { Search, Download, Plus, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Records = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('documents');

  const documents = [
    {
      id: 1,
      name: 'Employee Handbook 2024',
      type: 'PDF',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      category: 'Policy',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Performance Review Template',
      type: 'DOC',
      size: '156 KB',
      uploadDate: '2024-02-10',
      category: 'Template',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Training Certificate - Sarah Johnson',
      type: 'PDF',
      size: '89 KB',
      uploadDate: '2024-06-10',
      category: 'Certificate',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Salary Structure 2024',
      type: 'XLS',
      size: '445 KB',
      uploadDate: '2024-01-05',
      category: 'Compensation',
      status: 'Confidential'
    }
  ];

  const performanceRecords = [
    {
      id: 1,
      employee: 'Sarah Johnson',
      reviewPeriod: 'Q1 2024',
      score: 4.5,
      status: 'Completed',
      reviewDate: '2024-04-15'
    },
    {
      id: 2,
      employee: 'Mike Chen',
      reviewPeriod: 'Q1 2024',
      score: 4.2,
      status: 'Completed',
      reviewDate: '2024-04-12'
    },
    {
      id: 3,
      employee: 'Emily Davis',
      reviewPeriod: 'Q1 2024',
      score: 4.8,
      status: 'Completed',
      reviewDate: '2024-04-20'
    },
    {
      id: 4,
      employee: 'Alex Rodriguez',
      reviewPeriod: 'Q1 2024',
      score: null,
      status: 'Pending',
      reviewDate: 'TBD'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Confidential': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPerformance = performanceRecords.filter(record =>
    record.employee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Records Management</h1>
          <p className="text-slate-600 mt-1">Organize and manage employee documents and performance records</p>
        </div>
        <Button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'documents' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'performance' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Performance Reviews
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">{doc.name}</h3>
                      <p className="text-sm text-slate-600">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Category:</span>
                    <span className="font-medium">{doc.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Uploaded:</span>
                    <span className="font-medium">{doc.uploadDate}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'performance' && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Review Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Review Period</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Review Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPerformance.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">{record.employee}</td>
                      <td className="py-3 px-4">{record.reviewPeriod}</td>
                      <td className="py-3 px-4">
                        {record.score ? (
                          <span className="font-medium">{record.score}/5.0</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{record.reviewDate}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          {record.status === 'Pending' && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Complete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Records;
