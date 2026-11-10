import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { CreateOrderPayload, OrderStatus } from '../types';

export function useOrders(
  filters: { channel?: string; status?: string; search?: string } = {},
  enabled = true
) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const response = await api.orders.list(filters);
      return response.orders;
    },
    enabled,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => api.orders.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['serials'] }),
      ]);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.orders.updateStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useValidatePromo() {
  return useMutation({
    mutationFn: (payload: { code: string; subtotal: number }) =>
      api.orders.validatePromo(payload),
  });
}
