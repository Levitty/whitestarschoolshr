
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Ticket = Database['public']['Tables']['tickets']['Row'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

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
    try {
      const ticketData: TicketInsert = {
        title,
        description,
        category,
        priority
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
