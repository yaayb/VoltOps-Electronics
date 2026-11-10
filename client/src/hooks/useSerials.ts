import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { CreateRmaPayload, RmaStatus } from '../types';

export function useSerials(
  filters: { search?: string; status?: string; productId?: string } = {},
  enabled = true
) {
  return useQuery({
    queryKey: ['serials', filters],
    queryFn: async () => {
      const response = await api.serials.list(filters);
      return response.serials;
    },
    enabled,
  });
}

export function useLookupSerial() {
  return useMutation({
    mutationFn: (serial: string) => api.serials.lookupPublic(serial),
  });
}

export function useRmaTickets(
  filters: { status?: string; search?: string } = {},
  enabled = true
) {
  return useQuery({
    queryKey: ['rma', filters],
    queryFn: async () => {
      const response = await api.rma.list(filters);
      return response.tickets;
    },
    enabled,
  });
}

export function useCreateRmaTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRmaPayload) => api.rma.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rma'] }),
        queryClient.invalidateQueries({ queryKey: ['serials'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
    },
  });
}

export function useUpdateRmaStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      technicianNotes,
    }: {
      id: string;
      status: RmaStatus;
      technicianNotes?: string;
    }) => api.rma.updateStatus(id, { status, technicianNotes }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rma'] }),
        queryClient.invalidateQueries({ queryKey: ['serials'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
    },
  });
}
