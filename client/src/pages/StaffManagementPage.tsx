import React, { useState, Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { PlusIcon } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import type { Staff } from '../hooks/useStaff';
import { StaffList } from '../components/staff/StaffList';
import { CreateWaiterForm } from '../components/staff/CreateWaiterForm';
import { CreateKitchenStaffForm } from '../components/staff/CreateKitchenStaffForm';
import { Modal } from '../components/common/Modal';

const StaffManagementPage: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff } = useStaff();
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isKitchenStaffModalOpen, setIsKitchenStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const handleAddStaff = (staffData: Omit<Staff, 'id' | 'createdAt'>) => {
    addStaff(staffData);
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

  const handleToggleActive = (id: string) => {
    const staffMember = staff.find(s => s.id === id);
    if (staffMember) {
      const action = staffMember.isActive ? 'deactivate' : 'activate';
      if (confirm(`Are you sure you want to ${action} this staff member?`)) {
        updateStaff(id, { isActive: !staffMember.isActive });
      }
    }
  };

  const closeWaiterModal = () => {
    setIsWaiterModalOpen(false);
    setEditingStaff(null);
  };

  const closeKitchenStaffModal = () => {
    setIsKitchenStaffModalOpen(false);
    setEditingStaff(null);
  };

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
                className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 transition-all ${
                  selected
                    ? 'bg-naples text-charcoal shadow'
                    : 'text-gray-600 hover:bg-white/50 hover:text-charcoal'
                }`}
              >
                Waiters
              </button>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 transition-all ${
                  selected
                    ? 'bg-naples text-charcoal shadow'
                    : 'text-gray-600 hover:bg-white/50 hover:text-charcoal'
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
                <button
                  onClick={() => setIsWaiterModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-naples hover:bg-arylide text-charcoal rounded-md font-medium transition-colors focus:ring-2 focus:ring-naples focus:ring-offset-2"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Waiter
                </button>
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
                <button
                  onClick={() => setIsKitchenStaffModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-naples hover:bg-arylide text-charcoal rounded-md font-medium transition-colors focus:ring-2 focus:ring-naples focus:ring-offset-2"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Kitchen Staff
                </button>
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
          onSubmit={handleAddStaff}
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
          onSubmit={handleAddStaff}
          onClose={closeKitchenStaffModal}
        />
      </Modal>
    </div>
  );
};

export default StaffManagementPage;
