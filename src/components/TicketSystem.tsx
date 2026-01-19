import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTickets } from '@/hooks/useTickets';
import { useToast } from '@/hooks/use-toast';

interface TicketSystemProps {
  onClose?: () => void;
  isDialog?: boolean;
}

const TicketSystem = ({ onClose, isDialog = false }: TicketSystemProps) => {
  const { createTicket } = useTickets();
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.description || !newTicket.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    const { error } = await createTicket(
      newTicket.title,
      newTicket.description,
      newTicket.category,
      newTicket.priority
    );

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create ticket.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Ticket created successfully!"
      });
      setNewTicket({ title: '', description: '', category: '', priority: 'medium' });
      onClose?.();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleCreateTicket} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={newTicket.title}
          onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Brief description of the issue"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select value={newTicket.category} onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Technical Issue</SelectItem>
            <SelectItem value="hr">HR Related</SelectItem>
            <SelectItem value="payroll">Payroll</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="facilities">Facilities</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={newTicket.priority} onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={newTicket.description}
          onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed description of the issue"
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        {isDialog && onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Ticket'}
        </Button>
      </div>
    </form>
  );
};

export default TicketSystem;