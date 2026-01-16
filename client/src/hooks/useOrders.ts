import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  orderService,
  type Order,
  type OrderStatus,
  type OrderItemStatus,
  type OrderFilters,
  type PaginatedOrders,
} from '../services/orderService';

// Re-export types
export type { Order, OrderStatus, OrderItemStatus, OrderFilters, PaginatedOrders };

export const useOrders = (filters?: OrderFilters) => {
  const queryClient = useQueryClient();

  // Fetch all orders
  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => orderService.getAll(filters),
  });

  const orders = paginatedData?.data || [];
  const total = paginatedData?.total || 0;
  const page = paginatedData?.page || 1;
  const pageSize = paginatedData?.pageSize || 10;
  const totalPages = paginatedData?.totalPages || 0;

  // Fetch single order by ID
  const useOrderById = (id: string) => {
    return useQuery({
      queryKey: ['orders', id],
      queryFn: () => orderService.getById(id),
      enabled: !!id,
    });
  };

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Helper functions
  const updateStatus = (id: string, status: OrderStatus) => {
    return updateStatusMutation.mutateAsync({ id, status });
  };

  const getOrderById = (id: string) => {
    return orderService.getById(id);
  };

  return {
    orders,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    updateStatus,
    getOrderById,
    useOrderById,
    // Mutation states
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};
