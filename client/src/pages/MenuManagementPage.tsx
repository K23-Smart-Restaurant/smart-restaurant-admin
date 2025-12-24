import React, { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useMenuItems, type ModifierGroupFormState } from "../hooks/useMenuItems";
import type { MenuItem, MenuCategory } from "../hooks/useMenuItems";
import { MenuItemList } from "../components/menuItem/MenuItemList";
import { MenuItemForm, type MenuItemFormSubmitPayload } from "../components/menuItem/MenuItemForm";
import { ModifierGroupForm } from "../components/menuItem/ModifierGroupForm";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";

const MenuManagementPage: React.FC = () => {
  // Local filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'createdAt' | 'popularity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);

  const {
    menuItems,
    total,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    toggleSoldOut
  } = useMenuItems({
    searchQuery,
    selectedCategory,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [currentModifiers, setCurrentModifiers] = useState<ModifierGroupFormState[]>([]);

  const handleAddMenuItem = async (payload: MenuItemFormSubmitPayload) => {
    const { data, photos, removedPhotoIds } = payload;

    try {
      if (editingMenuItem) {
        await updateMenuItem(editingMenuItem.id, {
          data,
          photos,
          modifierGroups: currentModifiers,
          removedPhotoIds,
        });
        alert("Menu item updated successfully!");
      } else {
        await createMenuItem({
          data,
          photos,
          modifierGroups: currentModifiers,
          removedPhotoIds,
        });
        alert("Menu item created successfully!");
      }

      setCurrentModifiers([]);
      closeMenuItemModal();
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Failed to save menu item. Please try again.");
    }
  };

  const handleEditMenuItem = (menuItem: MenuItem) => {
    setEditingMenuItem(menuItem);
    const normalizedModifiers = (menuItem.modifiers as ModifierGroupFormState[] | undefined)?.map(
      (group) => ({ ...group, options: group.options || [] })
    );
    setCurrentModifiers(normalizedModifiers || []);
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleCategoryChange = (value: MenuCategory | 'ALL') => {
    setSelectedCategory(value);
    setPage(1);
  };

  const handleSortChange = (value: typeof sortBy) => {
    setSortBy(value);
    setPage(1);
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
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortOrder={sortOrder}
        onSortOrderToggle={toggleSortOrder}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
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
