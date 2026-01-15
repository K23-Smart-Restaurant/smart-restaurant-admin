import Fuse, { type IFuseOptions, type FuseResult } from 'fuse.js';
import type { MenuItem } from '../services/menuItemService';
import type {
    FuzzySearchConfig,
    SearchKey,
    FuzzySearchResult,
    FuzzyMatch,
    HighlightSegment,
    FieldHighlight,
    ScoreMap,
    HighlightsMap,
    FuzzySearchOptions,
} from '../types/search.types';

// Re-export types for convenience
export type {
    FuzzySearchConfig,
    SearchKey,
    FuzzySearchResult,
    FuzzyMatch,
    HighlightSegment,
    FieldHighlight,
    ScoreMap,
    HighlightsMap,
    FuzzySearchOptions,
};

/**
 * Fuzzy Search Utility for Smart Restaurant Admin App
 * Task 2.2: Create Fuzzy Search Configuration File
 * Task 2.3: Implement Fuzzy Search Core Logic
 * Task 2.4: Implement Highlight Utility Functions
 *
 * Uses Fuse.js for client-side fuzzy searching of menu items.
 * Supports typo tolerance, partial matching, and relevance ranking.
 *
 * Features:
 * - Configurable search keys with weights
 * - Multiple configuration presets (default, strict, loose)
 * - Match highlighting for UI
 * - Score-based relevance filtering
 * - Suggestion generation
 *
 * @module utils/fuzzySearch
 */

// ===========================================
// Configuration Constants
// ===========================================

/**
 * Default fuzzy search configuration optimized for restaurant menu
 *
 * - threshold: 0.35 - Allows ~2 typos in a 6-char word
 * - distance: 100 - Matches can be anywhere in string
 * - ignoreLocation: true - Don't penalize matches at end of description
 */
export const DEFAULT_FUZZY_CONFIG: FuzzySearchConfig = {
    threshold: 0.35,
    distance: 100,
    ignoreLocation: true,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    useExtendedSearch: false,
};

/**
 * Search keys for MenuItem with weights
 *
 * Priority:
 * 1. name (2.0) - Most important, admins usually search by dish name
 * 2. description (1.0) - Secondary, may contain ingredients/keywords
 * 3. category (0.5) - Helpful but less specific
 */
export const MENU_SEARCH_KEYS: SearchKey[] = [
    { name: 'name', weight: 2.0 },
    { name: 'description', weight: 1.0 },
    { name: 'category', weight: 0.5 },
];

/**
 * Stricter configuration for more precise matching
 */
export const STRICT_FUZZY_CONFIG: FuzzySearchConfig = {
    threshold: 0.2,
    distance: 50,
    ignoreLocation: false,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 3,
    useExtendedSearch: false,
};

/**
 * Looser configuration for more forgiving matching
 */
export const LOOSE_FUZZY_CONFIG: FuzzySearchConfig = {
    threshold: 0.5,
    distance: 200,
    ignoreLocation: true,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 1,
    useExtendedSearch: false,
};

// ===========================================
// Factory Functions
// ===========================================

/**
 * Create a Fuse instance for menu item searching
 *
 * @param items - Array of MenuItems to search through
 * @param config - Optional custom configuration
 * @param keys - Optional custom search keys with weights
 * @returns Configured Fuse instance
 *
 * @example
 * ```typescript
 * const fuse = createMenuFuseInstance(menuItems);
 * const results = fuse.search('pizza');
 * ```
 */
export function createMenuFuseInstance(
    items: MenuItem[],
    config: Partial<FuzzySearchConfig> = {},
    keys: SearchKey[] = MENU_SEARCH_KEYS
): Fuse<MenuItem> {
    const mergedConfig = { ...DEFAULT_FUZZY_CONFIG, ...config };

    const fuseOptions: IFuseOptions<MenuItem> = {
        keys: keys.map((k) => ({
            name: k.name as string,
            weight: k.weight,
        })),
        threshold: mergedConfig.threshold,
        distance: mergedConfig.distance,
        ignoreLocation: mergedConfig.ignoreLocation,
        includeScore: mergedConfig.includeScore,
        includeMatches: mergedConfig.includeMatches,
        minMatchCharLength: mergedConfig.minMatchCharLength,
        useExtendedSearch: mergedConfig.useExtendedSearch,
        // Additional optimizations
        shouldSort: true, // Sort by score
        findAllMatches: false, // Stop at first match per key for performance
        isCaseSensitive: false, // Case-insensitive search
    };

    return new Fuse(items, fuseOptions);
}

// ===========================================
// Search Functions
// ===========================================

/**
 * Perform fuzzy search on menu items
 *
 * @param fuseInstance - Pre-configured Fuse instance
 * @param query - Search query string
 * @param options - Optional search options
 * @returns Array of search results with scores and matches
 *
 * @example
 * ```typescript
 * const results = searchMenuItems(fuse, 'chese burgr', { limit: 10 });
 * // Returns Cheese Burger with typo tolerance
 * ```
 */
export function searchMenuItems(
    fuseInstance: Fuse<MenuItem>,
    query: string,
    options: { limit?: number } = {}
): FuzzySearchResult<MenuItem>[] {
    const { limit = 50 } = options;

    // Return empty for empty/whitespace queries
    if (!query || !query.trim()) {
        return [];
    }

    const trimmedQuery = query.trim();

    // Perform search
    const results = fuseInstance.search(trimmedQuery, { limit });

    // Transform to our result type
    return results.map((result: FuseResult<MenuItem>) => ({
        item: result.item,
        score: result.score ?? 1,
        refIndex: result.refIndex,
        matches: result.matches?.map((match) => ({
            key: match.key ?? '',
            value: match.value ?? '',
            indices: match.indices,
        })),
    }));
}

/**
 * Simple search without pre-created Fuse instance
 * Creates a new instance each time - use for one-off searches only
 *
 * @param items - Menu items to search
 * @param query - Search query
 * @param options - Search options
 * @returns Search results
 */
export function quickSearch(
    items: MenuItem[],
    query: string,
    options: { limit?: number; config?: Partial<FuzzySearchConfig> } = {}
): FuzzySearchResult<MenuItem>[] {
    const { limit, config } = options;
    const fuse = createMenuFuseInstance(items, config);
    return searchMenuItems(fuse, query, { limit });
}

// ===========================================
// Highlight Functions
// ===========================================

/**
 * Generate highlighted text segments from a fuzzy match
 *
 * @param text - Original text
 * @param indices - Match indices from Fuse result
 * @returns Array of text segments with match flags
 *
 * @example
 * ```typescript
 * const segments = generateHighlightSegments('Cheese Burger', [[0, 5]]);
 * // Returns: [
 * //   { text: 'Cheese', isMatch: true },
 * //   { text: ' Burger', isMatch: false }
 * // ]
 * ```
 */
export function generateHighlightSegments(
    text: string,
    indices: ReadonlyArray<[number, number]>
): HighlightSegment[] {
    if (!text || !indices || indices.length === 0) {
        return [{ text, isMatch: false }];
    }

    const segments: HighlightSegment[] = [];
    let lastIndex = 0;

    // Sort indices by start position
    const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);

    for (const [start, end] of sortedIndices) {
        // Add non-matching segment before this match
        if (start > lastIndex) {
            segments.push({
                text: text.slice(lastIndex, start),
                isMatch: false,
            });
        }

        // Add matching segment (end is inclusive in Fuse.js)
        segments.push({
            text: text.slice(start, end + 1),
            isMatch: true,
        });

        lastIndex = end + 1;
    }

    // Add remaining non-matching text
    if (lastIndex < text.length) {
        segments.push({
            text: text.slice(lastIndex),
            isMatch: false,
        });
    }

    return segments;
}

/**
 * Extract all field highlights from a search result
 *
 * @param result - Fuzzy search result
 * @returns Array of field highlights with segments
 *
 * @example
 * ```typescript
 * const highlights = getFieldHighlights(searchResult);
 * // Use in React: highlights.map(h => <HighlightedText key={h.field} segments={h.segments} />)
 * ```
 */
export function getFieldHighlights(result: FuzzySearchResult<MenuItem>): FieldHighlight[] {
    if (!result.matches || result.matches.length === 0) {
        return [];
    }

    return result.matches.map((match) => ({
        field: match.key,
        segments: generateHighlightSegments(match.value, match.indices),
    }));
}

/**
 * Get highlighted segments for a specific field
 *
 * @param result - Fuzzy search result
 * @param field - Field name to get highlights for
 * @returns Highlight segments or null if no match on this field
 */
export function getFieldHighlight(
    result: FuzzySearchResult<MenuItem>,
    field: string
): HighlightSegment[] | null {
    if (!result.matches) return null;

    const match = result.matches.find((m) => m.key === field);
    if (!match) return null;

    return generateHighlightSegments(match.value, match.indices);
}

// ===========================================
// Utility Functions
// ===========================================

/**
 * Calculate relevance percentage from Fuse score
 *
 * @param score - Fuse score (0 = perfect, 1 = no match)
 * @returns Percentage (0-100, higher is better)
 */
export function scoreToPercentage(score: number): number {
    return Math.round((1 - score) * 100);
}

/**
 * Check if a score meets the minimum relevance threshold
 *
 * @param score - Fuse score
 * @param minRelevance - Minimum relevance percentage (default: 30%)
 * @returns Whether the result is relevant enough
 */
export function isRelevant(score: number, minRelevance: number = 30): boolean {
    return scoreToPercentage(score) >= minRelevance;
}

/**
 * Filter results by minimum relevance
 *
 * @param results - Search results
 * @param minRelevance - Minimum relevance percentage
 * @returns Filtered results
 */
export function filterByRelevance<T>(
    results: FuzzySearchResult<T>[],
    minRelevance: number = 30
): FuzzySearchResult<T>[] {
    return results.filter((r) => isRelevant(r.score, minRelevance));
}

/**
 * Get search suggestions based on partial match
 * Returns top N items that partially match the query
 *
 * @param items - All menu items
 * @param query - Partial query
 * @param limit - Max suggestions
 * @returns Suggested menu items
 */
export function getSuggestions(items: MenuItem[], query: string, limit: number = 5): MenuItem[] {
    if (!query || query.length < 2) return [];

    const fuse = createMenuFuseInstance(items, LOOSE_FUZZY_CONFIG);
    const results = searchMenuItems(fuse, query, { limit });

    return results.map((r) => r.item);
}

// ===========================================
// Map Generator Functions
// ===========================================

/**
 * Create a map of item IDs to their match scores
 * Useful for quick score lookups in UI components
 *
 * @param results - Fuzzy search results
 * @returns Map of item ID to score
 *
 * @example
 * ```typescript
 * const scoreMap = createScoreMap(results);
 * const score = scoreMap.get(item.id); // 0.15
 * const relevance = scoreToPercentage(score); // 85%
 * ```
 */
export function createScoreMap(results: FuzzySearchResult<MenuItem>[]): ScoreMap {
    const map: ScoreMap = new Map();

    for (const result of results) {
        map.set(result.item.id, result.score);
    }

    return map;
}

/**
 * Create a map of item IDs to their field highlights
 * Useful for quick highlight lookups when rendering
 *
 * @param results - Fuzzy search results
 * @returns Map of item ID to field highlights
 *
 * @example
 * ```typescript
 * const highlightsMap = createHighlightsMap(results);
 * const highlights = highlightsMap.get(item.id);
 * // Render highlighted name, description, etc.
 * ```
 */
export function createHighlightsMap(results: FuzzySearchResult<MenuItem>[]): HighlightsMap {
    const map: HighlightsMap = new Map();

    for (const result of results) {
        const highlights = getFieldHighlights(result);
        if (highlights.length > 0) {
            map.set(result.item.id, highlights);
        }
    }

    return map;
}

/**
 * Perform search and return results with pre-computed maps
 * Combines search, score mapping, and highlight generation
 *
 * @param fuseInstance - Pre-configured Fuse instance
 * @param query - Search query
 * @param options - Search options
 * @returns Object with results, scoreMap, and highlightsMap
 *
 * @example
 * ```typescript
 * const { items, scoreMap, highlightsMap } = searchWithHighlights(fuse, 'pizza');
 * // Use items for list, scoreMap for badges, highlightsMap for rendering
 * ```
 */
export function searchWithHighlights(
    fuseInstance: Fuse<MenuItem>,
    query: string,
    options: { limit?: number; minRelevance?: number } = {}
): {
    items: MenuItem[];
    results: FuzzySearchResult<MenuItem>[];
    scoreMap: ScoreMap;
    highlightsMap: HighlightsMap;
} {
    const { limit = 50, minRelevance } = options;

    // Perform search
    let results = searchMenuItems(fuseInstance, query, { limit });

    // Filter by relevance if specified
    if (minRelevance !== undefined) {
        results = filterByRelevance(results, minRelevance);
    }

    // Create maps
    const scoreMap = createScoreMap(results);
    const highlightsMap = createHighlightsMap(results);

    return {
        items: results.map((r) => r.item),
        results,
        scoreMap,
        highlightsMap,
    };
}

/**
 * Perform exact (non-fuzzy) substring search
 * Used when fuzzy search is disabled
 *
 * @param items - Menu items to search
 * @param query - Search query
 * @param fields - Fields to search in
 * @returns Filtered items matching the query
 *
 * @example
 * ```typescript
 * const results = performExactSearch(items, 'pizza', ['name', 'description']);
 * ```
 */
export function performExactSearch(
    items: MenuItem[],
    query: string,
    fields: (keyof MenuItem)[] = ['name', 'description']
): MenuItem[] {
    if (!query || !query.trim()) {
        return items;
    }

    const lowerQuery = query.toLowerCase().trim();

    return items.filter((item) => {
        return fields.some((field) => {
            const value = item[field];
            if (typeof value === 'string') {
                return value.toLowerCase().includes(lowerQuery);
            }
            return false;
        });
    });
}

/**
 * Compare search performance between fuzzy and exact search
 * Useful for debugging and optimization
 *
 * @param items - Menu items
 * @param query - Search query
 * @returns Comparison object with counts and timing
 */
export function compareSearchMethods(
    items: MenuItem[],
    query: string
): {
    fuzzy: { count: number; timeMs: number };
    exact: { count: number; timeMs: number };
} {
    // Fuzzy search
    const fuzzyStart = performance.now();
    const fuzzyResults = quickSearch(items, query);
    const fuzzyTime = performance.now() - fuzzyStart;

    // Exact search
    const exactStart = performance.now();
    const exactResults = performExactSearch(items, query);
    const exactTime = performance.now() - exactStart;

    return {
        fuzzy: { count: fuzzyResults.length, timeMs: Math.round(fuzzyTime * 100) / 100 },
        exact: { count: exactResults.length, timeMs: Math.round(exactTime * 100) / 100 },
    };
}

// ===========================================
// Exports
// ===========================================

const fuzzySearch = {
    // Factory
    createMenuFuseInstance,

    // Search
    searchMenuItems,
    quickSearch,
    getSuggestions,
    searchWithHighlights,
    performExactSearch,
    compareSearchMethods,

    // Map Generators
    createScoreMap,
    createHighlightsMap,

    // Highlighting
    generateHighlightSegments,
    getFieldHighlights,
    getFieldHighlight,

    // Utilities
    scoreToPercentage,
    isRelevant,
    filterByRelevance,

    // Configs
    DEFAULT_FUZZY_CONFIG,
    STRICT_FUZZY_CONFIG,
    LOOSE_FUZZY_CONFIG,
    MENU_SEARCH_KEYS,
};

export default fuzzySearch;
