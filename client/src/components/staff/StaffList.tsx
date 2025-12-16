import React, { useState } from 'react';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon, CheckCircleIcon } from 'lucide-react';
import type { Staff, StaffRole } from '../../hooks/useStaff';

type FilterType = 'ALL' | 'ACTIVE' | 'INACTIVE';

interface StaffListProps {
  role: StaffRole | 'ALL';
  staff: Staff[];
  onEdit: (staff: Staff) => void;
  onToggleActive: (id: string) => void;
}

export const StaffList: React.FC<StaffListProps> = ({ role, staff, onEdit, onToggleActive }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');

  // Filter staff by role
  const roleFilteredStaff = role === 'ALL' 
    ? staff 
    : staff.filter(member => member.role === role);

  // Apply active/inactive filter
  const filteredStaff = roleFilteredStaff.filter(member => {
    if (filter === 'ACTIVE') return member.isActive;
    if (filter === 'INACTIVE') return !member.isActive;
    return true;
  });

  // Get initials for avatar
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Filter dropdown */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <label htmlFor="filter" className="text-sm font-medium text-charcoal">
            Filter:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-3 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none text-sm"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          {filteredStaff.length} {filteredStaff.length === 1 ? 'member' : 'members'}
        </div>
      </div>

      {/* Staff table */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-antiflash p-12 text-center">
          <p className="text-gray-600">No staff members found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-antiflash overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-antiflash">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Avatar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-antiflash">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-antiflash transition-colors">
                    {/* Avatar */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-10 h-10 rounded-full bg-naples flex items-center justify-center">
                        <span className="text-charcoal font-semibold text-sm">
                          {getInitials(member.name)}
                        </span>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-charcoal">{member.name}</div>
                      <div className="text-xs text-gray-600">{member.role.replace('_', ' ')}</div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.email}
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.phoneNumber || '—'}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(member.createdAt), 'MMM dd, yyyy')}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        {/* Edit button */}
                        <button
                          onClick={() => onEdit(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        {/* Activate/Deactivate toggle button */}
                        {member.isActive ? (
                          <button
                            onClick={() => onToggleActive(member.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Deactivate"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggleActive(member.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Activate"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
