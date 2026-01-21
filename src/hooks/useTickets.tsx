import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';

type Ticket = Database['public']['Tables']['tickets']['Row'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { tenant } = useTenant();

  // Check if user is admin/superadmin/head - they can see all tickets
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'head';

  useEffect(() => {
    if (user && tenant?.id) {
      fetchTickets();
    }
  }, [user, tenant?.id, isAdmin]);

  const fetchTickets = async () => {
    if (!user || !tenant?.id) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('tickets')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      // Non-admin users only see their own tickets
      if (!isAdmin) {
        query = query.eq('employee_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tickets:', error);
      } else {
        setTickets(data || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (
    title: string,
    description: string,
    category: string,
    priority: string = 'medium'
  ) => {
    if (!user || !tenant?.id) {
      return { error: new Error('User or tenant not found') };
    }

    try {
      const ticketData: TicketInsert = {
        title,
        description,
        category,
        priority,
        employee_id: user.id,
        tenant_id: tenant.id
      };

      const { error } = await supabase
        .from('tickets')
        .insert(ticketData);

      if (error) {
        return { error };
      }

      await fetchTickets();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) {
        return { error };
      }

      await fetchTickets();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    tickets,
    loading,
    fetchTickets,
    createTicket,
    updateTicketStatus
  };
};
