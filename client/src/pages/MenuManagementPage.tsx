import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMenuItems, type ModifierGroupFormState } from '../hooks/useMenuItems';
import type { MenuItem } from '../hooks/useMenuItems';
import { MenuItemList } from '../components/menuItem/MenuItemList';
import { MenuItemForm, type MenuItemFormSubmitPayload } from '../components/menuItem/MenuItemForm';
import { ModifierGroupForm } from '../components/menuItem/ModifierGroupForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { ConfirmDeleteDialog } from '../components/common/ConfirmDeleteDialog';
import { PageLoading } from '../components/common/LoadingSpinner';
import { useToastContext } from '../contexts/ToastContext';
import { useCategories } from '../hooks/useCategories';

const MenuManagementPage: React.FC = () => {
  const { t } = useTranslation(['menu', 'common']);
  const { showSuccess, showError } = useToastContext();
  const { getActiveCategories } = useCategories();

  // Local filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'createdAt' | 'popularity'>(
    'name'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);

  const {
    menuItems,
    total,
    isLoading,
    isError,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    toggleSoldOut,

    // Fuzzy Search helpers (always enabled)
    getItemHighlights,
    getItemRelevance,
    suggestions,
    isSearchActive,
  } = useMenuItems({
    searchQuery,
    selectedCategoryId,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [currentModifiers, setCurrentModifiers] = useState<ModifierGroupFormState[]>([]);

  // Delete confirmation state
  const [menuItemToDelete, setMenuItemToDelete] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        showSuccess(
          t('menu:messages.updated'),
          t('menu:messages.updatedDesc', { name: data.name })
        );
      } else {
        await createMenuItem({
          data,
          photos,
          modifierGroups: currentModifiers,
          removedPhotoIds,
        });
        showSuccess(
          t('menu:messages.created'),
          t('menu:messages.createdDesc', { name: data.name })
        );
      }

      setCurrentModifiers([]);
      closeMenuItemModal();
    } catch (error) {
      console.error('Error saving menu item:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError(t('menu:messages.saveFailed'), errorMessage);
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

  const handleDeleteMenuItem = (menuItem: MenuItem) => {
    // Open confirmation dialog
    setMenuItemToDelete(menuItem);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!menuItemToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteMenuItem(menuItemToDelete.id);
      showSuccess(
        t('menu:messages.deleted'),
        t('menu:messages.deletedDesc', { name: menuItemToDelete.name })
      );
      setMenuItemToDelete(null);
    } catch (error: unknown) {
      console.error('Failed to delete menu item:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('menu:messages.deleteFailedDesc');
      showError(t('menu:messages.deleteFailed'), errorMessage);
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setMenuItemToDelete(null);
    setDeleteError(null);
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

  const handleCategoryChange = (value: string | 'ALL') => {
    setSelectedCategoryId(value);
    setPage(1);
  };

  const handleSortChange = (value: typeof sortBy) => {
    setSortBy(value);
    setPage(1);
  };

  // Loading state
  if (isLoading) {
    return <PageLoading message={t('menu:messages.loading')} />;
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('menu:messages.loadFailed')}</p>
          <Button onClick={() => window.location.reload()}>{t('menu:messages.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">{t('menu:title')}</h1>
          <p className="text-gray-600 mt-1">{t('menu:description')}</p>
        </div>

        {/* Add Menu Item button */}
        <Button onClick={openAddMenuItemModal} icon={PlusIcon}>
          {t('menu:actions.add')}
        </Button>
      </div>

      {/* Menu Item List with Filters */}
      <MenuItemList
        menuItems={menuItems}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={handleCategoryChange}
        categories={getActiveCategories()}
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
        // Fuzzy search props (always enabled)
        getItemHighlights={getItemHighlights}
        getItemRelevance={getItemRelevance}
        suggestions={suggestions}
        isSearchActive={isSearchActive}
      />

      {/* Create/Edit Menu Item Modal */}
      <Modal
        isOpen={isMenuItemModalOpen}
        onClose={closeMenuItemModal}
        title={editingMenuItem ? t('menu:modals.edit') : t('menu:modals.create')}
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
              {t('menu:modifiers.title')}
            </h3>
            <ModifierGroupForm modifiers={currentModifiers || []} onChange={setCurrentModifiers} />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={menuItemToDelete !== null}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={t('menu:modals.delete')}
        itemName={menuItemToDelete?.name}
        message={deleteError ? deleteError : t('menu:modals.deleteConfirm')}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MenuManagementPage;
