/**
 * Search Types for Smart Restaurant Admin App
 * Task 2.1: Create Search Type Definitions
 *
 * Type definitions for fuzzy search functionality
 * Adapted from smart-restaurant-customer for admin context
 *
 * @module types/search.types
 */

import type { MenuItem } from '../services/menuItemService';

// ===========================================
// Fuzzy Search Configuration Types
// ===========================================

/**
 * Configuration for fuzzy search behavior
 * Used to customize Fuse.js settings
 */
export interface FuzzySearchConfig {
  /**
   * Fuzzy matching threshold
   * 0.0 = exact match only
   * 1.0 = match anything
   * Recommended: 0.3-0.4 for typo tolerance
   */
  threshold: number;

  /**
   * Maximum edit distance for matches
   * Higher values allow more character insertions/deletions
   */
  distance: number;

  /**
   * Whether to ignore location in string
   * If true, matches at end of string are not penalized
   * Useful for long descriptions
   */
  ignoreLocation: boolean;

  /** Include match score in results for ranking */
  includeScore: boolean;

  /** Include match indices for UI highlighting */
  includeMatches: boolean;

  /** Minimum characters that must match */
  minMatchCharLength: number;

  /**
   * Use extended search operators
   * Enables: ^prefix, suffix$, 'exact, !negation
   */
  useExtendedSearch: boolean;
}

/**
 * Search key configuration with weight for prioritization
 */
export interface SearchKey {
  /** Field name in the item object (e.g., 'name', 'description') */
  name: keyof MenuItem | string;
  /**
   * Weight for ranking (higher = more important)
   * Range: 0.0 - 2.0+ typically
   */
  weight: number;
}

// ===========================================
// Search Result Types
// ===========================================

/**
 * Result from fuzzy search with metadata
 * @template T The type of item being searched
 */
export interface FuzzySearchResult<T> {
  /** The matched item */
  item: T;

  /**
   * Match score from Fuse.js
   * 0 = perfect match
   * 1 = no match
   * Lower is better
   */
  score: number;

  /** Index of item in original array */
  refIndex: number;

  /** Details about where matches occurred */
  matches?: FuzzyMatch[];
}

/**
 * Convenience type for menu item search results
 */
export type MenuSearchResult = FuzzySearchResult<MenuItem>;

/**
 * Details about a single match occurrence
 */
export interface FuzzyMatch {
  /** Field name where match was found (e.g., 'name') */
  key: string;

  /** Original value that was matched against */
  value: string;

  /**
   * Array of [start, end] index pairs for matched characters
   * End index is inclusive (Fuse.js convention)
   */
  indices: ReadonlyArray<[number, number]>;
}

// ===========================================
// Highlight Types (for UI rendering)
// ===========================================

/**
 * A segment of text with match information
 * Used for rendering highlights in the UI
 */
export interface HighlightSegment {
  /** The text content of this segment */
  text: string;

  /** Whether this segment is part of a match */
  isMatch: boolean;
}

/**
 * Highlighted text for a specific field
 */
export interface FieldHighlight {
  /** Field name (e.g., 'name', 'description') */
  field: string;

  /** Segments with match indicators for rendering */
  segments: HighlightSegment[];
}

/**
 * Complete highlight data for a search result
 */
export interface SearchResultHighlights {
  /** Item ID for associating with results */
  itemId: string;

  /** Highlights per field */
  highlights: FieldHighlight[];
}

// ===========================================
// Search Options & State Types
// ===========================================

/**
 * Options for performing a search
 */
export interface FuzzySearchOptions {
  /** Maximum number of results to return */
  limit?: number;

  /** Custom threshold override */
  threshold?: number;

  /** Whether to include match highlights */
  includeHighlights?: boolean;

  /** Minimum relevance score (0-100) to include */
  minRelevance?: number;
}

/**
 * State for fuzzy search in React components/hooks
 */
export interface FuzzySearchState {
  /** Current search query */
  query: string;

  /** Whether fuzzy matching is enabled */
  isEnabled: boolean;

  /** Whether a search is in progress */
  isSearching: boolean;

  /** Search results */
  results: MenuSearchResult[];

  /** Total items before filtering */
  totalItems: number;

  /** Number of results after filtering */
  resultCount: number;
}

/**
 * Actions for managing search state
 */
export interface FuzzySearchActions {
  /** Update the search query */
  setQuery: (query: string) => void;

  /** Toggle fuzzy search on/off */
  toggleFuzzy: () => void;

  /** Enable fuzzy search */
  enableFuzzy: () => void;

  /** Disable fuzzy search */
  disableFuzzy: () => void;

  /** Clear search and reset to default state */
  clearSearch: () => void;
}

/**
 * Combined state and actions for hooks
 */
export type FuzzySearchHook = FuzzySearchState & FuzzySearchActions;

// ===========================================
// Utility Types
// ===========================================

/**
 * Map of item ID to match score
 * Used for quick score lookups
 */
export type ScoreMap = Map<string, number>;

/**
 * Map of item ID to highlights
 * Used for quick highlight lookups
 */
export type HighlightsMap = Map<string, FieldHighlight[]>;

/**
 * Search mode for UI indicators
 */
export type SearchMode = 'fuzzy' | 'exact' | 'none';

/**
 * Search status for loading states
 */
export type SearchStatus = 'idle' | 'searching' | 'success' | 'error';

// ===========================================
// Constants
// ===========================================

/**
 * Default fuzzy search configuration values
 */
export const DEFAULT_FUZZY_THRESHOLD = 0.35;
export const DEFAULT_SEARCH_LIMIT = 50;
export const DEFAULT_MIN_MATCH_LENGTH = 2;
export const DEFAULT_MIN_RELEVANCE = 30;

/**
 * Local storage key for fuzzy search preference
 */
export const FUZZY_ENABLED_STORAGE_KEY = 'admin-menu-fuzzy-search-enabled';
