import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { useMenuItems } from '../hooks/useMenuItems';
import type { MenuItem } from '../hooks/useMenuItems';
import { MenuItemList } from '../components/menuItem/MenuItemList';
import { MenuItemForm } from '../components/menuItem/MenuItemForm';
import { ModifierGroupForm } from '../components/menuItem/ModifierGroupForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';

const MenuManagementPage: React.FC = () => {
  // Local filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | any>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'createdAt' | 'popularity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const {
    menuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    toggleSoldOut,
    isLoading,
    isError
  } = useMenuItems({
    searchQuery,
    selectedCategory,
    sortBy,
    sortOrder
  });

  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [currentModifiers, setCurrentModifiers] = useState<MenuItem['modifiers']>([]);

  const handleAddMenuItem = async (menuItemData: any, imageUrls: string[]) => {
    const completeData = {
      ...menuItemData,
      imageUrls,
      modifiers: currentModifiers,
    };

    try {
      if (editingMenuItem) {
        // Update existing menu item
        await updateMenuItem(editingMenuItem.id, completeData);
        alert('Menu item updated successfully!');
      } else {
        // Add new menu item
        await createMenuItem(completeData);
        alert('Menu item created successfully!');
      }

      setCurrentModifiers([]);
      closeMenuItemModal();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item. Please try again.');
    }
  };

  const handleEditMenuItem = (menuItem: MenuItem) => {
    setEditingMenuItem(menuItem);
    setCurrentModifiers(menuItem.modifiers || []);
    setIsMenuItemModalOpen(true);
  };

  const handleDeleteMenuItem = async (menuItem: MenuItem) => {
    if (confirm(`Are you sure you want to delete "${menuItem.name}"?`)) {
      try {
        await deleteMenuItem(menuItem.id);
        alert('Menu item deleted successfully!');
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Failed to delete menu item. Please try again.');
      }
    }
  };

  const closeMenuItemModal = () => {
    setIsMenuItemModalOpen(false);
    setEditingMenuItem(null);
    setCurrentModifiers([]);
  };

  const openAddMenuItemModal = () => {
    setEditingMenuItem(null);
    setCurrentModifiers([]);
    setIsMenuItemModalOpen(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Menu Items</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant menu</p>
        </div>

        {/* Add Menu Item button */}
        <Button onClick={openAddMenuItemModal} icon={PlusIcon}>
          Add Menu Item
        </Button>
      </div>

      {/* Menu Item List with Filters */}
      <MenuItemList
        menuItems={menuItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderToggle={toggleSortOrder}
        onEdit={handleEditMenuItem}
        onDelete={handleDeleteMenuItem}
        onToggleAvailability={toggleAvailability}
        onToggleSoldOut={toggleSoldOut}
      />

      {/* Create/Edit Menu Item Modal */}
      <Modal
        isOpen={isMenuItemModalOpen}
        onClose={closeMenuItemModal}
        title={editingMenuItem ? 'Edit Menu Item' : 'Create Menu Item'}
        size="lg"
      >
        <div className="space-y-6">
          {/* Menu Item Form */}
          <div>
            <MenuItemForm
              menuItem={editingMenuItem || undefined}
              onSubmit={handleAddMenuItem}
              onCancel={closeMenuItemModal}
            />
          </div>

          {/* Modifiers Form */}
          <div className="pt-6 border-t border-antiflash">
            <h3 className="text-lg font-semibold text-charcoal mb-4">
              Modifiers & Options
            </h3>
            <ModifierGroupForm
              modifiers={currentModifiers || []}
              onChange={setCurrentModifiers}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MenuManagementPage;
