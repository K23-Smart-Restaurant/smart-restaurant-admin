import { useState } from 'react';

export type StaffRole = 'WAITER' | 'KITCHEN_STAFF';

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  phoneNumber?: string;
  isActive: boolean; // UI-only field for filtering
  createdAt: string;
}

// Initial mock data
const initialMockStaff: Staff[] = [
  {
    id: "1",
    email: "john@restaurant.com",
    name: "John Doe",
    role: "WAITER",
    phoneNumber: "+1234567890",
    isActive: true,
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    email: "jane@restaurant.com",
    name: "Jane Smith",
    role: "WAITER",
    phoneNumber: "+1234567891",
    isActive: true,
    createdAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: "3",
    email: "mike@restaurant.com",
    name: "Mike Wilson",
    role: "WAITER",
    phoneNumber: "+1234567892",
    isActive: false, // Deactivated staff
    createdAt: "2024-03-10T00:00:00.000Z",
  },
  {
    id: "4",
    email: "sarah@restaurant.com",
    name: "Sarah Brown",
    role: "KITCHEN_STAFF",
    phoneNumber: "+1234567893",
    isActive: true,
    createdAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "5",
    email: "tom@restaurant.com",
    name: "Tom Lee",
    role: "KITCHEN_STAFF",
    phoneNumber: "+1234567894",
    isActive: true,
    createdAt: "2024-02-15T00:00:00.000Z",
  },
];

export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>(initialMockStaff);

  // Add new staff member
  const addStaff = (newStaff: Omit<Staff, 'id' | 'createdAt'>) => {
    const id = (Math.max(...staff.map(s => parseInt(s.id)), 0) + 1).toString();
    const createdAt = new Date().toISOString();
    
    const staffMember: Staff = {
      ...newStaff,
      id,
      createdAt,
    };

    setStaff(prevStaff => [...prevStaff, staffMember]);
    return staffMember;
  };

  // Update existing staff member
  const updateStaff = (id: string, data: Partial<Omit<Staff, 'id' | 'createdAt'>>) => {
    setStaff(prevStaff =>
      prevStaff.map(member =>
        member.id === id
          ? { ...member, ...data }
          : member
      )
    );
  };

  // Delete staff member (toggle isActive to false)
  const deleteStaff = (id: string) => {
    setStaff(prevStaff =>
      prevStaff.map(member =>
        member.id === id
          ? { ...member, isActive: false }
          : member
      )
    );
  };

  // Permanently remove from array (alternative to soft delete)
  const removeStaff = (id: string) => {
    setStaff(prevStaff => prevStaff.filter(member => member.id !== id));
  };

  // Filter staff by role
  const filterByRole = (role: StaffRole | 'ALL') => {
    if (role === 'ALL') {
      return staff;
    }
    return staff.filter(member => member.role === role);
  };

  // Get active staff only
  const getActiveStaff = () => {
    return staff.filter(member => member.isActive);
  };

  // Get staff by ID
  const getStaffById = (id: string) => {
    return staff.find(member => member.id === id);
  };

  return {
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    removeStaff,
    filterByRole,
    getActiveStaff,
    getStaffById,
  };
};
