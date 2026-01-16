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
import { useTranslation } from 'react-i18next';

// Type for staff data from forms (matches what forms actually send)
type StaffFormData = Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>;

const StaffManagementPage: React.FC = () => {
  const { t } = useTranslation('staff');
  const { showSuccess, showError } = useToastContext();

  const { staff, isLoading, isError, createWaiter, createKitchenStaff, updateStaff, deleteStaff } =
    useStaff();

  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isKitchenStaffModalOpen, setIsKitchenStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Toggle active confirmation state
  const [staffToToggle, setStaffToToggle] = useState<Staff | null>(null);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  const handleAddWaiter = async (staffData: StaffFormData) => {
    try {
      if (editingStaff) {
        // For updates, transform to UpdateStaffDto
        const updateData = {
          email: staffData.email,
          name: staffData.name || undefined,
          phoneNumber: staffData.phoneNumber || undefined,
        };
        await updateStaff(editingStaff.id, updateData);
        showSuccess(
          t('messages.waiterUpdated'),
          t('messages.waiterUpdatedDesc', { name: staffData.name || staffData.email })
        );
      } else {
        // For creation, extract only the fields needed for CreateWaiterDto
        const createData = {
          email: staffData.email,
          password: (staffData as StaffFormData & { password: string }).password,
          name: staffData.name || undefined,
          phoneNumber: staffData.phoneNumber || undefined,
        };
        await createWaiter(createData);
        showSuccess(
          t('messages.waiterCreated'),
          t('messages.waiterCreatedDesc', { name: staffData.name || staffData.email })
        );
      }
      closeWaiterModal();
    } catch (error) {
      console.error('Error saving waiter:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError(t('messages.failedToSaveWaiter'), errorMessage);
    }
  };

  const handleAddKitchenStaff = async (staffData: StaffFormData) => {
    try {
      if (editingStaff) {
        // For updates, transform to UpdateStaffDto
        const updateData = {
          email: staffData.email,
          name: staffData.name || undefined,
          phoneNumber: staffData.phoneNumber || undefined,
        };
        await updateStaff(editingStaff.id, updateData);
        showSuccess(
          t('messages.kitchenStaffUpdated'),
          t('messages.kitchenStaffUpdatedDesc', { name: staffData.name || staffData.email })
        );
      } else {
        // For creation, extract only the fields needed for CreateKitchenStaffDto
        const createData = {
          email: staffData.email,
          password: (staffData as StaffFormData & { password: string }).password,
          name: staffData.name || undefined,
          phoneNumber: staffData.phoneNumber || undefined,
        };
        await createKitchenStaff(createData);
        showSuccess(
          t('messages.kitchenStaffCreated'),
          t('messages.kitchenStaffCreatedDesc', { name: staffData.name || staffData.email })
        );
      }
      closeKitchenStaffModal();
    } catch (error) {
      console.error('Error saving kitchen staff:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError(t('messages.failedToSaveKitchenStaff'), errorMessage);
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
    const staffMember = staff.find((s) => s.id === id);
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
        action === 'activate' ? t('messages.staffActivated') : t('messages.staffDeactivated'),
        t(action === 'activate' ? 'messages.staffActivatedDesc' : 'messages.staffDeactivatedDesc', {
          name: staffToToggle.name || staffToToggle.email,
        })
      );
      setStaffToToggle(null);
    } catch (error) {
      console.error('Error toggling staff status:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError(t('messages.failedToUpdateStatus'), errorMessage);
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
    return <PageLoading message={t('messages.loadingStaff')} />;
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('messages.failedToLoadStaff')}</p>
          <Button onClick={() => window.location.reload()}>{t('messages.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('manageMessage')}</p>
      </div>

      {/* Tabs */}
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-lg bg-antiflash p-1 mb-6">
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 transition-all ${
                  selected
                    ? 'bg-naples text-charcoal shadow'
                    : 'text-gray-600 hover:bg-antiflash/80 hover:text-charcoal'
                }`}
              >
                {t('tabs.waiters')}
              </button>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 transition-all ${
                  selected
                    ? 'bg-naples text-charcoal shadow'
                    : 'text-gray-600 hover:bg-antiflash/80 hover:text-charcoal'
                }`}
              >
                {t('tabs.kitchenStaff')}
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
                  {t('actions.addWaiter')}
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
                  {t('actions.addKitchenStaff')}
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
        title={editingStaff ? t('modals.editWaiter') : t('modals.createWaiter')}
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
        title={editingStaff ? t('modals.editKitchenStaff') : t('modals.createKitchenStaff')}
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
        title={staffToToggle?.isActive ? t('modals.deactivateStaff') : t('modals.activateStaff')}
        itemName={staffToToggle?.name || staffToToggle?.email}
        message={
          staffToToggle?.isActive ? t('messages.deactivateConfirm') : t('messages.activateConfirm')
        }
        isLoading={isTogglingActive}
      />
    </div>
  );
};

export default StaffManagementPage;
