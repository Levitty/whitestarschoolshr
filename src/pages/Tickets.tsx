import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTickets } from '@/hooks/useTickets';
import TicketSystem from '@/components/TicketSystem';
import { AlertCircle, Clock, CheckCircle, Users, Search, Plus } from 'lucide-react';

const Tickets = () => {
  const { tickets, updateTicketStatus } = useTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const getTicketStats = () => {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
    const inProgressTickets = tickets.filter(ticket => ticket.status === 'in_progress').length;
    const closedTickets = tickets.filter(ticket => ticket.status === 'closed').length;

    return { totalTickets, openTickets, inProgressTickets, closedTickets };
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || !statusFilter || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || !priorityFilter || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = getTicketStats();

  const getStatusBadge = (status: string) => {
    const variants = {
      open: { variant: 'destructive' as const, label: 'Open' },
      in_progress: { variant: 'default' as const, label: 'In Progress' },
      closed: { variant: 'secondary' as const, label: 'Closed' },
      resolved: { variant: 'default' as const, label: 'Resolved' }
    };

    const config = variants[status as keyof typeof variants] || { variant: 'secondary' as const, label: status };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: { variant: 'secondary' as const, label: 'Low' },
      medium: { variant: 'default' as const, label: 'Medium' },
      high: { variant: 'destructive' as const, label: 'High' },
      urgent: { variant: 'destructive' as const, label: 'Urgent' }
    };

    const config = variants[priority as keyof typeof variants] || { variant: 'secondary' as const, label: priority };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    await updateTicketStatus(ticketId, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage employee complaints and support requests</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTickets}</p>
                <p className="text-xs text-muted-foreground">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.openTickets}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgressTickets}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.closedTickets}</p>
                <p className="text-xs text-muted-foreground">Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>All Tickets</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground">{ticket.title}</h3>
                      {getStatusBadge(ticket.status || 'open')}
                      {getPriorityBadge(ticket.priority || 'medium')}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{ticket.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Category: {ticket.category}</span>
                      <span>Created: {formatDate(ticket.created_at || '')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      View
                    </Button>
                    {ticket.status === 'open' && (
                      <Button 
                        size="sm"
                        onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="font-medium">No tickets found</p>
              <p className="text-sm mt-1">No tickets match your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Ticket Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedTicket?.title}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(selectedTicket.status || 'open')}
                {getPriorityBadge(selectedTicket.priority || 'medium')}
                <Badge variant="outline">{selectedTicket.category}</Badge>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-sm">{selectedTicket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-muted-foreground mb-1">Created</h4>
                  <p>{formatDate(selectedTicket.created_at || '')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground mb-1">Updated</h4>
                  <p>{formatDate(selectedTicket.updated_at || selectedTicket.created_at || '')}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Update Status</h4>
                <Select 
                  value={selectedTicket.status || 'open'} 
                  onValueChange={(value) => {
                    handleStatusChange(selectedTicket.id, value);
                    setSelectedTicket({ ...selectedTicket, status: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>
          <TicketSystem onClose={() => setShowCreateDialog(false)} isDialog />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tickets;