import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService, type Staff, type StaffRole, type CreateWaiterDto, type CreateKitchenStaffDto, type UpdateStaffDto } from '../services/staffService';

// Re-export types
export type { Staff, StaffRole };

export const useStaff = () => {
  const queryClient = useQueryClient();

  // Fetch all staff
  const {
    data: staff = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['staff'],
    queryFn: staffService.getAll,
  });

  // Create waiter mutation
  const createWaiterMutation = useMutation({
    mutationFn: staffService.createWaiter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  // Create kitchen staff mutation
  const createKitchenStaffMutation = useMutation({
    mutationFn: staffService.createKitchenStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  // Update staff mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffDto }) =>
      staffService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  // Delete staff mutation
  const deleteMutation = useMutation({
    mutationFn: staffService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  // Helper functions
  const createWaiter = (data: CreateWaiterDto) => {
    return createWaiterMutation.mutateAsync(data);
  };

  const createKitchenStaff = (data: CreateKitchenStaffDto) => {
    return createKitchenStaffMutation.mutateAsync(data);
  };

  const updateStaff = (id: string, data: UpdateStaffDto) => {
    return updateMutation.mutateAsync({ id, data });
  };

  const deleteStaff = (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    staff,
    isLoading,
    isError,
    error,
    refetch,
    createWaiter,
    createKitchenStaff,
    updateStaff,
    deleteStaff,
    // Mutation states
    isCreatingWaiter: createWaiterMutation.isPending,
    isCreatingKitchenStaff: createKitchenStaffMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
