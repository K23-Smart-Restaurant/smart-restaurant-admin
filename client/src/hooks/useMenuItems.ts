import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  menuItemService,
  type MenuItem,
  type MenuCategory,
  type CreateMenuItemDto,
  type UpdateMenuItemDto,
  type ModifierGroupInput,
  type MenuItemListResponse,
  type CreateMenuItemPayload,
  type UpdateMenuItemPayload,
  type PhotoInput,
} from '../services/menuItemService';
import {
  createMenuFuseInstance,
  searchWithHighlights,
  performExactSearch,
  getSuggestions,
  scoreToPercentage,
  type ScoreMap,
  type HighlightsMap,
  type FieldHighlight,
} from '../utils/fuzzySearch';
import { FUZZY_ENABLED_STORAGE_KEY } from '../types/search.types';

// Re-export types
export type { MenuItem, MenuCategory };

type SortOption = 'name' | 'price' | 'category' | 'createdAt' | 'popularity';

interface UseMenuItemsOptions {
  searchQuery?: string;
  selectedCategory?: MenuCategory | 'ALL';
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ModifierOptionInput {
  id?: string;
  name: string;
  price: number;
  status?: string;
  displayOrder?: number;
}

export interface ModifierGroupFormState extends ModifierGroupInput {
  options: ModifierOptionInput[];
}

export interface SaveMenuItemFormPayload {
  data: CreateMenuItemDto | UpdateMenuItemDto;
  photos?: PhotoInput[];
  modifierGroups?: ModifierGroupFormState[];
  removedPhotoIds?: string[];
  id?: string;
}

// ===========================================
// Task 3.3: Local Storage Persistence Helpers
// ===========================================

/**
 * Get fuzzy search enabled state from localStorage
 * Defaults to true if not set
 */
const getFuzzyEnabledFromStorage = (): boolean => {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(FUZZY_ENABLED_STORAGE_KEY);
  return stored !== 'false'; // Default to true
};

/**
 * Save fuzzy search enabled state to localStorage
 */
const saveFuzzyEnabledToStorage = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FUZZY_ENABLED_STORAGE_KEY, String(enabled));
};

// ===========================================
// Constants
// ===========================================

const MAX_SEARCH_RESULTS = 50;
const MIN_RELEVANCE_THRESHOLD = 15;

// ===========================================
// Main Hook
// ===========================================

export const useMenuItems = (options: UseMenuItemsOptions = {}) => {
  const {
    searchQuery = '',
    selectedCategory = 'ALL',
    sortBy = 'name',
    sortOrder = 'asc',
    page = 1,
    pageSize = 9,
  } = options;

  const queryClient = useQueryClient();

  // ===========================================
  // Task 3.1 & 3.3: Fuzzy Search State
  // ===========================================

  const [fuzzyEnabled, setFuzzyEnabledState] = useState<boolean>(getFuzzyEnabledFromStorage);
  const [scoreMap, setScoreMap] = useState<ScoreMap>(new Map());
  const [highlightsMap, setHighlightsMap] = useState<HighlightsMap>(new Map());

  // Toggle fuzzy search with persistence
  const toggleFuzzySearch = useCallback(() => {
    setFuzzyEnabledState((prev) => {
      const newValue = !prev;
      saveFuzzyEnabledToStorage(newValue);
      return newValue;
    });
  }, []);

  const enableFuzzySearch = useCallback(() => {
    setFuzzyEnabledState(true);
    saveFuzzyEnabledToStorage(true);
  }, []);

  const disableFuzzySearch = useCallback(() => {
    setFuzzyEnabledState(false);
    saveFuzzyEnabledToStorage(false);
  }, []);

  // ===========================================
  // Data Fetching - Fetch ALL items for client-side fuzzy search
  // ===========================================

  // When fuzzy search is enabled and there's a search query,
  // we need ALL items for client-side filtering
  const shouldFetchAll = fuzzyEnabled && searchQuery.trim().length > 0;

  const { data, isLoading, isError, error, refetch } = useQuery<MenuItemListResponse>({
    queryKey: [
      'menuItems',
      shouldFetchAll ? '' : searchQuery, // Don't filter by name if fuzzy is enabled
      selectedCategory,
      sortBy,
      sortOrder,
      page,
      pageSize,
      fuzzyEnabled,
    ],
    queryFn: () =>
      menuItemService.getAll({
        // Don't send name filter when fuzzy is enabled - we filter client-side
        name: shouldFetchAll ? undefined : searchQuery || undefined,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        sortBy: shouldFetchAll ? undefined : sortBy, // Don't sort server-side when fuzzy
        sortOrder: shouldFetchAll ? undefined : sortOrder,
        limit: shouldFetchAll ? 200 : pageSize, // Fetch more for client-side search
        offset: shouldFetchAll ? 0 : (page - 1) * pageSize,
      }),
    placeholderData: (previousData) => previousData,
    // Task 6.2: Stale time optimization - cache results for 30 seconds
    staleTime: 30 * 1000,
  });

  const rawMenuItems = data?.items ?? [];
  const apiTotal = data?.total ?? rawMenuItems.length;

  // ===========================================
  // Task 6.1: Memoize Fuse Instance (Enhanced)
  // ===========================================

  /**
   * Create Fuse instance only when rawMenuItems changes
   * Using useMemo with proper dependency tracking
   * This prevents expensive re-indexing on every render
   */
  const fuseInstance = useMemo(() => {
    if (!rawMenuItems || rawMenuItems.length === 0) return null;

    // Performance: Only create Fuse when we have items
    // Fuse.js builds an index on construction which can be expensive for large datasets
    return createMenuFuseInstance(rawMenuItems);
  }, [rawMenuItems]);

  // ===========================================
  // Task 6.2: Optimized Client-Side Filtering
  // ===========================================

  /**
   * Perform search and filter items
   * Optimized to minimize re-renders and state updates
   */
  const { filteredItems, filteredTotal, newScoreMap, newHighlightsMap } = useMemo(() => {
    const trimmedQuery = searchQuery.trim();

    // No search query - return raw items with empty maps
    if (!trimmedQuery) {
      return {
        filteredItems: rawMenuItems,
        filteredTotal: apiTotal,
        newScoreMap: new Map() as ScoreMap,
        newHighlightsMap: new Map() as HighlightsMap,
      };
    }

    // Fuzzy search enabled
    if (fuzzyEnabled && fuseInstance) {
      const result = searchWithHighlights(
        fuseInstance,
        trimmedQuery,
        { limit: MAX_SEARCH_RESULTS, minRelevance: MIN_RELEVANCE_THRESHOLD }
      );

      return {
        filteredItems: result.items,
        filteredTotal: result.items.length,
        newScoreMap: result.scoreMap,
        newHighlightsMap: result.highlightsMap,
      };
    }

    // Exact search (fuzzy disabled)
    const exactResults = performExactSearch(rawMenuItems, trimmedQuery);

    return {
      filteredItems: exactResults,
      filteredTotal: exactResults.length,
      newScoreMap: new Map() as ScoreMap,
      newHighlightsMap: new Map() as HighlightsMap,
    };
  }, [searchQuery, fuzzyEnabled, fuseInstance, rawMenuItems, apiTotal]);

  // Task 6.2: Update maps in a separate effect to avoid state updates during render
  // This pattern prevents the React warning about state updates during render
  useMemo(() => {
    // Use requestAnimationFrame for smoother updates
    const frameId = requestAnimationFrame(() => {
      setScoreMap(newScoreMap);
      setHighlightsMap(newHighlightsMap);
    });

    return () => cancelAnimationFrame(frameId);
  }, [newScoreMap, newHighlightsMap]);

  // ===========================================
  // Helper Functions for UI
  // ===========================================

  /**
   * Get highlights for a specific menu item
   */
  const getItemHighlights = useCallback(
    (itemId: string): FieldHighlight[] => {
      return highlightsMap.get(itemId) ?? [];
    },
    [highlightsMap]
  );

  /**
   * Get relevance score (0-100) for a menu item
   */
  const getItemRelevance = useCallback(
    (itemId: string): number | undefined => {
      const score = scoreMap.get(itemId);
      if (score === undefined) return undefined;
      return scoreToPercentage(score);
    },
    [scoreMap]
  );

  /**
   * Get suggestions for "no results" state
   */
  const suggestions = useMemo(() => {
    if (filteredItems.length > 0 || !searchQuery.trim()) return [];
    return getSuggestions(rawMenuItems, searchQuery, 3);
  }, [filteredItems.length, searchQuery, rawMenuItems]);

  // Computed values
  const isSearchActive = searchQuery.trim().length > 0;
  const hasNoResults = isSearchActive && filteredItems.length === 0;

  // ===========================================
  // Mutations (unchanged)
  // ===========================================

  const createMutation = useMutation({
    mutationFn: (payload: CreateMenuItemPayload) => menuItemService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateMenuItemPayload) => menuItemService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: menuItemService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      menuItemService.toggleAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  const toggleSoldOutMutation = useMutation({
    mutationFn: ({ id, isSoldOut }: { id: string; isSoldOut: boolean }) =>
      menuItemService.toggleSoldOut(id, isSoldOut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  // ===========================================
  // CRUD Helper Functions
  // ===========================================

  const createMenuItem = (payload: SaveMenuItemFormPayload) => {
    return createMutation.mutateAsync({
      data: payload.data as CreateMenuItemDto,
      photos: payload.photos,
      modifierGroups: payload.modifierGroups,
      removedPhotoIds: payload.removedPhotoIds,
    });
  };

  const updateMenuItem = (id: string, payload: SaveMenuItemFormPayload) => {
    return updateMutation.mutateAsync({
      id,
      data: payload.data as UpdateMenuItemDto,
      photos: payload.photos,
      modifierGroups: payload.modifierGroups,
      removedPhotoIds: payload.removedPhotoIds,
    });
  };

  const deleteMenuItem = (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const toggleAvailability = (id: string) => {
    const item = filteredItems.find((i) => i.id === id) ?? rawMenuItems.find((i) => i.id === id);
    if (item) {
      return toggleAvailabilityMutation.mutateAsync({ id, isAvailable: !item.isAvailable });
    }
    return Promise.reject(new Error('Menu item not found'));
  };

  const toggleSoldOut = (id: string) => {
    const item = filteredItems.find((i) => i.id === id) ?? rawMenuItems.find((i) => i.id === id);
    if (item) {
      return toggleSoldOutMutation.mutateAsync({ id, isSoldOut: !item.isSoldOut });
    }
    return Promise.reject(new Error('Menu item not found'));
  };

  // ===========================================
  // Return Value
  // ===========================================

  return {
    // Menu items - use filtered items when searching
    menuItems: filteredItems,
    allMenuItems: rawMenuItems,
    total: isSearchActive && fuzzyEnabled ? filteredTotal : apiTotal,

    // Loading states
    isLoading,
    isError,
    error,
    refetch,

    // CRUD operations
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    toggleSoldOut,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingAvailability: toggleAvailabilityMutation.isPending,
    isTogglingSoldOut: toggleSoldOutMutation.isPending,

    // ===========================================
    // NEW: Fuzzy Search State & Actions (Task 3.1, 3.3)
    // ===========================================
    fuzzyEnabled,
    toggleFuzzySearch,
    enableFuzzySearch,
    disableFuzzySearch,

    // ===========================================
    // NEW: Search Result Helpers (Task 3.1)
    // ===========================================
    scoreMap,
    highlightsMap,
    getItemHighlights,
    getItemRelevance,
    suggestions,

    // ===========================================
    // NEW: Computed Values (Task 3.2)
    // ===========================================
    isSearchActive,
    hasNoResults,

    // Legacy properties for compatibility
    searchQuery,
    setSearchQuery: () => { }, // Deprecated - use options instead
    selectedCategory,
    setSelectedCategory: () => { }, // Deprecated - use options instead
    sortBy,
    setSortBy: () => { }, // Deprecated - use options instead
    sortOrder,
    setSortOrder: () => { }, // Deprecated - use options instead
  };
};
