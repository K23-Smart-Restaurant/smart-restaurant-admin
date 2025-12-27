import React, { useState, Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { PlusIcon } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import type { Staff } from '../hooks/useStaff';
import { StaffList } from '../components/staff/StaffList';
import { CreateWaiterForm } from '../components/staff/CreateWaiterForm';
import { CreateKitchenStaffForm } from '../components/staff/CreateKitchenStaffForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { ConfirmDeleteDialog } from '../components/common/ConfirmDeleteDialog';
import { PageLoading } from '../components/common/LoadingSpinner';
import { useToastContext } from '../contexts/ToastContext';

const StaffManagementPage: React.FC = () => {
  const { showSuccess, showError } = useToastContext();

  const {
    staff,
    isLoading,
    isError,
    createWaiter,
    createKitchenStaff,
    updateStaff,
    deleteStaff
  } = useStaff();

  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isKitchenStaffModalOpen, setIsKitchenStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Toggle active confirmation state
  const [staffToToggle, setStaffToToggle] = useState<Staff | null>(null);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  const handleAddWaiter = async (staffData: any) => {
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, staffData);
        showSuccess(
          'Waiter Updated',
          `${staffData.username} has been successfully updated.`
        );
      } else {
        await createWaiter(staffData);
        showSuccess(
          'Waiter Created',
          `${staffData.username} has been successfully added to the team.`
        );
      }
      closeWaiterModal();
    } catch (error) {
      console.error('Error saving waiter:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError(
        'Failed to Save Waiter',
        errorMessage
      );
    }
  };

  const handleAddKitchenStaff = async (staffData: any) => {
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, staffData);
        showSuccess(
          'Kitchen Staff Updated',
          `${staffData.username} has been successfully updated.`
        );
      } else {
        await createKitchenStaff(staffData);
        showSuccess(
          'Kitchen Staff Created',
          `${staffData.username} has been successfully added to the team.`
        );
      }
      closeKitchenStaffModal();
    } catch (error) {
      console.error('Error saving kitchen staff:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError(
        'Failed to Save Kitchen Staff',
        errorMessage
      );
    }
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    // Open appropriate modal based on role
    if (staffMember.role === 'WAITER') {
      setIsWaiterModalOpen(true);
    } else {
      setIsKitchenStaffModalOpen(true);
    }
  };

  const handleToggleActive = async (id: string) => {
    const staffMember = staff.find(s => s.id === id);
    if (staffMember) {
      setStaffToToggle(staffMember);
    }
  };

  const confirmToggleActive = async () => {
    if (!staffToToggle) return;

    setIsTogglingActive(true);
    const action = staffToToggle.isActive ? 'deactivate' : 'activate';

    try {
      await deleteStaff(staffToToggle.id); // This actually toggles active status
      showSuccess(
        `Staff ${action === 'activate' ? 'Activated' : 'Deactivated'}`,
        `${staffToToggle.name || staffToToggle.email} has been successfully ${action}d.`
      );
      setStaffToToggle(null);
    } catch (error) {
      console.error('Error toggling staff status:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError(
        'Failed to Update Status',
        errorMessage
      );
    } finally {
      setIsTogglingActive(false);
    }
  };

  const cancelToggleActive = () => {
    setStaffToToggle(null);
  };

  const closeWaiterModal = () => {
    setIsWaiterModalOpen(false);
    setEditingStaff(null);
  };

  const closeKitchenStaffModal = () => {
    setIsKitchenStaffModalOpen(false);
    setEditingStaff(null);
  };

  // Loading state
  if (isLoading) {
    return <PageLoading message="Loading staff members..." />;
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load staff members</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal">Staff Management</h1>
        <p className="text-gray-600 mt-1">Manage your restaurant staff members</p>
      </div>

      {/* Tabs */}
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-lg bg-antiflash p-1 mb-6">
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 transition-all ${selected
                  ? 'bg-naples text-charcoal shadow'
                  : 'text-gray-600 hover:bg-antiflash/80 hover:text-charcoal'
                  }`}
              >
                Waiters
              </button>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 transition-all ${selected
                  ? 'bg-naples text-charcoal shadow'
                  : 'text-gray-600 hover:bg-antiflash/80 hover:text-charcoal'
                  }`}
              >
                Kitchen Staff
              </button>
            )}
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* Waiters Tab */}
          <Tab.Panel>
            <div className="space-y-4">
              {/* Add Waiter button */}
              <div className="flex justify-end">
                <Button onClick={() => setIsWaiterModalOpen(true)} icon={PlusIcon}>
                  Add Waiter
                </Button>
              </div>

              {/* Waiters list */}
              <StaffList
                role="WAITER"
                staff={staff}
                onEdit={handleEditStaff}
                onToggleActive={handleToggleActive}
              />
            </div>
          </Tab.Panel>

          {/* Kitchen Staff Tab */}
          <Tab.Panel>
            <div className="space-y-4">
              {/* Add Kitchen Staff button */}
              <div className="flex justify-end">
                <Button onClick={() => setIsKitchenStaffModalOpen(true)} icon={PlusIcon}>
                  Add Kitchen Staff
                </Button>
              </div>

              {/* Kitchen staff list */}
              <StaffList
                role="KITCHEN_STAFF"
                staff={staff}
                onEdit={handleEditStaff}
                onToggleActive={handleToggleActive}
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Create Waiter Modal */}
      <Modal
        isOpen={isWaiterModalOpen}
        onClose={closeWaiterModal}
        title={editingStaff ? 'Edit Waiter' : 'Create Waiter Account'}
      >
        <CreateWaiterForm
          staff={editingStaff || undefined}
          onSubmit={handleAddWaiter}
          onClose={closeWaiterModal}
        />
      </Modal>

      {/* Create Kitchen Staff Modal */}
      <Modal
        isOpen={isKitchenStaffModalOpen}
        onClose={closeKitchenStaffModal}
        title={editingStaff ? 'Edit Kitchen Staff' : 'Create Kitchen Staff Account'}
      >
        <CreateKitchenStaffForm
          staff={editingStaff || undefined}
          onSubmit={handleAddKitchenStaff}
          onClose={closeKitchenStaffModal}
        />
      </Modal>

      {/* Toggle Active Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={staffToToggle !== null}
        onClose={cancelToggleActive}
        onConfirm={confirmToggleActive}
        title={staffToToggle?.isActive ? 'Deactivate Staff Member' : 'Activate Staff Member'}
        itemName={staffToToggle?.name || staffToToggle?.email}
        message={
          staffToToggle?.isActive
            ? 'Are you sure you want to deactivate this staff member? They will no longer be able to access the system.'
            : 'Are you sure you want to activate this staff member? They will be able to access the system again.'
        }
        isLoading={isTogglingActive}
      />
    </div>
  );
};

export default StaffManagementPage;
