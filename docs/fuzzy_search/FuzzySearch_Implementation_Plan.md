# Fuzzy Search Implementation Plan - Smart Restaurant Admin App

## Overview

This document outlines the comprehensive implementation plan for adding **fuzzy search** functionality to the restaurant admin menu management. Fuzzy search will allow admin users to find menu items even with typos, partial words, or phonetically similar terms (e.g., searching "chese burgr" will match "Cheese Burger").

This implementation is based on the successful fuzzy search feature from the `smart-restaurant-customer` project, adapted for the admin context.

---

## Current State Analysis

### Existing Search Implementation
- **Backend**: API-based search using `name` query parameter sent to `/menu-items` endpoint
- **Frontend**: Direct search input with state-based filtering
- **Location**: 
  - Client: `hooks/useMenuItems.ts`, `components/menuItem/MenuItemList.tsx`, `pages/MenuManagementPage.tsx`
  - Server: `controllers/MenuItemController.js`, `services/menu.service.js`

### Current Architecture
```
MenuManagementPage.tsx
  → Local state: searchQuery, selectedCategory, sortBy, sortOrder, page, pageSize
  → useMenuItems(options) hook with TanStack Query
    → menuItemService.getAll(filters) API call
  → MenuItemList component (renders search UI + grid)
```

### Current Limitations
- Exact substring matching only (via API)
- No client-side fuzzy matching
- No typo tolerance
- No synonym support
- No match highlighting
- No relevance-based sorting

---

## Implementation Tasks

### Phase 1: Setup & Dependencies

#### ✅ Task 1.1: Choose Fuzzy Search Library
**Complexity: 2/10** | **Dependency: None** | **Status: COMPLETED 2026-01-14**

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Fuse.js** (Client) | Lightweight (~5KB), no backend changes, proven in customer app | Limited to loaded data | ✅ **RECOMMENDED** |
| **MiniSearch** (Client) | Full-text indexing, fast | Slightly larger | Alternative |
| **PostgreSQL `pg_trgm`** (Backend) | Database-native, handles large datasets | Requires DB extension | Production-scale |

**Decision**: ✅ **Fuse.js** selected (same as customer app - code reuse potential)

**Testing Checklist:**
- [x] Confirm Fuse.js documentation reviewed
- [x] Confirm Fuse.js works with React 19 + Vite
- [x] Check bundle size impact (~5KB gzipped)

---

#### ✅ Task 1.2: Install Fuse.js Package
**Complexity: 1/10** | **Dependency: Task 1.1** | **Status: COMPLETED 2026-01-14**

```bash
cd client
npm install fuse.js
```

**Technical Requirements:**
- Package: `fuse.js` ✅ v7.1.0 Installed
- No additional type packages needed (@types included)

**Testing Checklist:**
- [x] Run `npm install fuse.js`
- [x] Verify no peer dependency conflicts
- [x] Confirm TypeScript types are available

---

### Phase 2: Create Fuzzy Search Utility

#### ✅ Task 2.1: Create Search Type Definitions
**Complexity: 2/10** | **Dependency: Task 1.2** | **Status: COMPLETED 2026-01-14**

**File Created**: `client/src/types/search.types.ts` ✅

**Types to Define:**
```typescript
// Configuration Types
export interface FuzzySearchConfig {
  threshold: number;      // 0.0 = exact, 1.0 = anything (recommended: 0.3-0.4)
  distance: number;       // Max edit distance (recommended: 100)
  ignoreLocation: boolean;// Don't penalize matches at end of string
  includeScore: boolean;  // Return match scores for ranking
  includeMatches: boolean;// Return match indices for highlighting
  minMatchCharLength: number;
}

export interface SearchKey {
  name: string;
  weight: number;
}

// Result Types
export interface FuzzySearchResult<T> {
  item: T;
  score: number;
  refIndex: number;
  matches?: FuzzyMatch[];
}

export interface FuzzyMatch {
  key: string;
  value: string;
  indices: ReadonlyArray<[number, number]>;
}

// Highlight Types
export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

export interface FieldHighlight {
  field: string;
  segments: HighlightSegment[];
}

// Utility Types
export type ScoreMap = Map<string, number>;
export type HighlightsMap = Map<string, FieldHighlight[]>;
export type SearchMode = 'fuzzy' | 'exact' | 'none';
```

**Reference**: Can copy/adapt from `smart-restaurant-customer/client/src/types/search.types.ts`

**Testing Checklist:**
- [x] Create new types file
- [x] Types align with Fuse.js result structure
- [x] Types are compatible with admin's MenuItem type
- [x] TypeScript compilation passes

---

#### ✅ Task 2.2: Create Fuzzy Search Configuration File
**Complexity: 3/10** | **Dependency: Task 2.1** | **Status: COMPLETED 2026-01-14**

**File Created**: `client/src/utils/fuzzySearch.ts` ✅

**Technical Requirements:**
```typescript
// Search Keys for Admin Menu Items (by priority)
export const MENU_SEARCH_KEYS: SearchKey[] = [
  { name: 'name', weight: 2.0 },        // Most important
  { name: 'description', weight: 1.0 }, // Secondary
  { name: 'category', weight: 0.5 },    // Helpful for browsing
];

// Default Configuration
export const DEFAULT_FUZZY_CONFIG: FuzzySearchConfig = {
  threshold: 0.35,        // Allows ~2 typos in a 6-char word
  distance: 100,
  ignoreLocation: true,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};
```

**Testing Checklist:**
- [x] Create `fuzzySearch.ts` with type-safe config
- [x] Export `createMenuFuseInstance()` factory function
- [x] Export `searchMenuItems()` utility function
- [x] Verify TypeScript compilation passes

---

#### ✅ Task 2.3: Implement Fuzzy Search Core Logic
**Complexity: 5/10** | **Dependency: Task 2.2** | **Status: COMPLETED 2026-01-14**

**File**: `client/src/utils/fuzzySearch.ts` ✅ Extended

**Functions to Implement:**
```typescript
// Factory function
export function createMenuFuseInstance(
  items: MenuItem[],
  config?: Partial<FuzzySearchConfig>,
  keys?: SearchKey[]
): Fuse<MenuItem>

// Core search
export function searchMenuItems(
  fuseInstance: Fuse<MenuItem>,
  query: string,
  options?: { limit?: number }
): FuzzySearchResult<MenuItem>[]

// Quick search (one-off)
export function quickSearch(
  items: MenuItem[],
  query: string,
  options?: { limit?: number; config?: Partial<FuzzySearchConfig> }
): FuzzySearchResult<MenuItem>[]

// Search with highlights
export function searchWithHighlights(
  fuse: Fuse<MenuItem>,
  query: string,
  options?: { limit?: number }
): {
  items: MenuItem[];
  results: FuzzySearchResult<MenuItem>[];
  scoreMap: ScoreMap;
  highlightsMap: HighlightsMap;
}

// Exact search fallback
export function performExactSearch(
  items: MenuItem[],
  query: string,
  fields?: string[]
): MenuItem[]
```

**Reference**: Can copy/adapt functions from `smart-restaurant-customer/client/src/utils/fuzzySearch.ts`

**Testing Checklist:**
- [x] Test with exact matches → should score highest
- [x] Test with typos (1-2 chars) → should still match
- [x] Test with partial words → should match
- [x] Test empty query → returns empty array
- [x] Test special characters → doesn't break
- [x] Verify match scores are returned correctly

---

#### ✅ Task 2.4: Implement Highlight Utility Functions
**Complexity: 3/10** | **Dependency: Task 2.3** | **Status: COMPLETED 2026-01-14**

**File**: `client/src/utils/fuzzySearch.ts` ✅ Extended

**Functions to Implement:**
```typescript
// Generate highlighted segments
export function generateHighlightSegments(
  text: string,
  indices: ReadonlyArray<[number, number]>
): HighlightSegment[]

// Get all field highlights from result
export function getFieldHighlights(
  result: FuzzySearchResult<MenuItem>
): FieldHighlight[]

// Get highlight for specific field
export function getFieldHighlight(
  result: FuzzySearchResult<MenuItem>,
  field: string
): HighlightSegment[] | null

// Utility: score to percentage
export function scoreToPercentage(score: number): number

// Utility: check relevance
export function isRelevant(score: number, minRelevance?: number): boolean
```

**Testing Checklist:**
- [x] Highlight segments generated correctly
- [x] Multiple highlights per field work
- [x] Score conversion accurate
- [x] Edge cases handled (empty text, no indices)

---

### Phase 3: Integrate with useMenuItems Hook

#### ☐ Task 3.1: Add Fuzzy Search State to useMenuItems Hook
**Complexity: 4/10** | **Dependency: Task 2.3** | **Status: PENDING**

**File**: `client/src/hooks/useMenuItems.ts`

**Changes Required:**
1. Import Fuse.js and fuzzy search utilities
2. Create Fuse instance when items are loaded (via useMemo)
3. Add state for: `fuzzyEnabled`, `scoreMap`, `highlightsMap`
4. Memoize Fuse instance recreation on menuItems change

**New Hook Interface:**
```typescript
interface UseMenuItemsOptions {
  searchQuery?: string;
  selectedCategory?: MenuCategory | 'ALL';
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  fuzzyEnabled?: boolean; // NEW
}

// Return object additions:
{
  // Existing...
  
  // NEW: Fuzzy Search State & Actions
  fuzzyEnabled: boolean;
  toggleFuzzySearch: () => void;
  enableFuzzySearch: () => void;
  disableFuzzySearch: () => void;
  
  // NEW: Search result helpers
  scoreMap: ScoreMap;
  highlightsMap: HighlightsMap;
  getItemHighlights: (itemId: string) => FieldHighlight[];
  getItemRelevance: (itemId: string) => number | undefined;
  
  // NEW: Computed values
  isSearchActive: boolean;
  hasNoResults: boolean;
  filteredMenuItems: MenuItem[]; // Client-filtered items
}
```

**Implementation Strategy:**
```typescript
// Option A (Recommended): Client-Side Fuzzy Filter
// 1. Fetch ALL items (or paginated set) from API without search filter
// 2. Apply fuzzy search client-side
// 3. Benefits: Typo tolerance, highlighting, relevance ranking

// Option B: Hybrid Approach  
// 1. Short queries (<3 chars): Use API search
// 2. Longer queries: Fetch all, fuzzy search client-side
```

**Testing Checklist:**
- [ ] Fuse instance recreates when items change
- [ ] Fuzzy search toggles correctly
- [ ] Results update when query changes
- [ ] Scores are calculated correctly
- [ ] No memory leaks (useMemo handles cleanup)

---

#### ☐ Task 3.2: Implement Client-Side Filtering Logic
**Complexity: 5/10** | **Dependency: Task 3.1** | **Status: PENDING**

**File**: `client/src/hooks/useMenuItems.ts`

**Implementation Logic:**
```typescript
// In useMemo:
// 1. No query → return API items as-is
// 2. If fuzzyEnabled && fuseInstance exists:
//    - Use searchWithHighlights() for fuzzy search
//    - Update scoreMap and highlightsMap
//    - Return filtered items sorted by relevance
// 3. If fuzzy disabled:
//    - Use API search (current behavior)
//    - Return API results
```

**Key Considerations:**
- Admin might have more menu items than customer app
- Consider pagination interaction with fuzzy search
- May need to fetch more items for client-side search

**Testing Checklist:**
- [ ] Empty query shows all items
- [ ] Fuzzy search returns relevant items
- [ ] Typos are tolerated (e.g., "pizzz" → "Pizza")
- [ ] Results are ranked by relevance (score)
- [ ] Category filter works with fuzzy results
- [ ] Sort options work with fuzzy results
- [ ] Pagination works correctly with fuzzy results

---

#### ☐ Task 3.3: Handle Search Mode Toggle (Persistence)
**Complexity: 2/10** | **Dependency: Task 3.1** | **Status: PENDING**

**File**: `client/src/hooks/useMenuItems.ts`

**Local Storage Persistence:**
```typescript
const FUZZY_ENABLED_STORAGE_KEY = 'admin-menu-fuzzy-search-enabled';

// Helper functions
const getFuzzyEnabledFromStorage = (): boolean => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(FUZZY_ENABLED_STORAGE_KEY) !== 'false';
};

const saveFuzzyEnabledToStorage = (enabled: boolean): void => {
  localStorage.setItem(FUZZY_ENABLED_STORAGE_KEY, String(enabled));
};
```

**Testing Checklist:**
- [ ] Toggle persists across page reloads
- [ ] Default is enabled (true)
- [ ] Toggle updates search results immediately

---

### Phase 4: Update UI Components

#### ☐ Task 4.1: Create HighlightedText Component
**Complexity: 2/10** | **Dependency: Task 2.4** | **Status: PENDING**

**File to Create**: `client/src/components/common/HighlightedText.tsx`

**Component Interface:**
```typescript
interface HighlightedTextProps {
  segments: HighlightSegment[];
  highlightClassName?: string;
  textClassName?: string;
}
```

**Styling (matching admin theme):**
```css
.search-highlight {
  background: linear-gradient(
    to bottom,
    rgba(250, 200, 50, 0.15),  /* Naples Yellow */
    rgba(250, 200, 50, 0.25)
  );
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 500;
}
```

**Testing Checklist:**
- [ ] Component renders segments correctly
- [ ] Highlights styled with Naples yellow theme
- [ ] Non-match segments render normally
- [ ] Empty segments handled gracefully

---

#### ☐ Task 4.2: Add Fuzzy Toggle to MenuItemList Search
**Complexity: 3/10** | **Dependency: Task 3.3** | **Status: PENDING**

**File**: `client/src/components/menuItem/MenuItemList.tsx`

**UI Changes:**
1. Add sparkle/wand icon toggle button next to search input
2. Add tooltip explaining "Smart search: ON/OFF"
3. Visual indicator when active (Naples yellow accent)

**New Props:**
```typescript
interface MenuItemListProps {
  // Existing props...
  
  // NEW: Fuzzy search props
  fuzzyEnabled?: boolean;
  onToggleFuzzy?: () => void;
  showFuzzyToggle?: boolean;
}
```

**Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Search                                                    │
│ ┌─────────────────────────────────────────────────────┬───┐ │
│ │ Search by name or description...                    │✨ │ │
│ └─────────────────────────────────────────────────────┴───┘ │
│                                          ✨ = Smart search   │
└─────────────────────────────────────────────────────────────┘
```

**Testing Checklist:**
- [ ] Toggle button renders correctly
- [ ] Active state has Naples yellow accent
- [ ] Tooltip explains feature
- [ ] Toggle calls `onToggleFuzzy` callback
- [ ] Accessible (aria-label, aria-pressed, keyboard nav)

---

#### ☐ Task 4.3: Display Match Highlights in MenuItemCard
**Complexity: 4/10** | **Dependency: Task 4.1, Task 4.2** | **Status: PENDING**

**Files to Modify:**
- `client/src/components/menuItem/MenuItemCard.tsx`
- `client/src/components/menuItem/MenuItemList.tsx`

**Changes:**
1. MenuItemCard accepts `highlights` and `relevanceScore` props
2. Use HighlightedText for name and description when highlights present
3. Add optional relevance badge (e.g., "95% match")

**New Props for MenuItemCard:**
```typescript
interface MenuItemCardProps {
  menuItem: MenuItem;
  onEdit: (menuItem: MenuItem) => void;
  onDelete: (menuItem: MenuItem) => void;
  onToggleAvailability: (id: string) => void;
  onToggleSoldOut: (id: string) => void;
  
  // NEW: Fuzzy search props
  highlights?: FieldHighlight[];
  relevanceScore?: number;
}
```

**Testing Checklist:**
- [ ] Highlights appear on matching text
- [ ] Multiple highlights per field work
- [ ] Highlights use Naples yellow color
- [ ] No highlights when search is empty
- [ ] Performance is acceptable (no flickering)

---

#### ☐ Task 4.4: Add "No Results" State with Suggestions
**Complexity: 3/10** | **Dependency: Task 4.3** | **Status: PENDING**

**File**: `client/src/components/menuItem/MenuItemList.tsx`

**Features:**
1. Enhanced no results message showing search query
2. Display up to 3 suggested items (if fuzzy search finds partial matches)
3. "Clear Search" action button

**UI Design:**
```
┌───────────────────────────────────────────────┐
│                                               │
│       🍽️ No menu items match "cheze brgr"     │
│                                               │
│   Did you mean:                               │
│   • Cheese Burger                             │  
│   • Cheeseburger Deluxe                       │
│                                               │
│   [Clear Search]  [Browse All]                │
│                                               │
└───────────────────────────────────────────────┘
```

**Testing Checklist:**
- [ ] Empty state shows when no results
- [ ] Suggestions are relevant (from fuzzy search)
- [ ] Clear search button works
- [ ] Matches admin design system

---

### Phase 5: MenuManagementPage Integration

#### ☐ Task 5.1: Connect MenuManagementPage to Updated Hook
**Complexity: 3/10** | **Dependency: Task 3.2, Task 4.2** | **Status: PENDING**

**File**: `client/src/pages/MenuManagementPage.tsx`

**Changes:**
1. Destructure fuzzy search properties from `useMenuItems()`
2. Pass fuzzy props to `MenuItemList` component
3. Pass highlights functions to child components

**Updated Usage:**
```typescript
const {
  // Existing...
  menuItems,
  total,
  isLoading,
  
  // NEW: Fuzzy search
  fuzzyEnabled,
  toggleFuzzySearch,
  isSearchActive,
  getItemHighlights,
  getItemRelevance,
  filteredMenuItems,
} = useMenuItems({
  searchQuery,
  selectedCategory,
  sortBy,
  sortOrder,
  page,
  pageSize,
});
```

**Testing Checklist:**
- [ ] MenuManagementPage receives fuzzy state from hook
- [ ] Props forwarded to MenuItemList correctly
- [ ] Highlights passed to MenuItemCard
- [ ] No console errors

---

#### ☐ Task 5.2: Update Results Count Display
**Complexity: 2/10** | **Dependency: Task 5.1** | **Status: PENDING**

**File**: `client/src/components/menuItem/MenuItemList.tsx`

**Enhancement:**
- Add "sorted by relevance" indicator when fuzzy search is active
- Show search mode in active filters section

**Updated UI:**
```
Active filters: Search: "cheese" | [✨ Smart Search] | Category: Main Courses

Showing 5 of 24 menu items • sorted by relevance
```

**Testing Checklist:**
- [ ] Count shows "sorted by relevance" when fuzzy active
- [ ] Styling matches design system
- [ ] Toggle state visible in active filters

---

### Phase 6: Performance Optimization

#### ☐ Task 6.1: Memoize Fuse Instance
**Complexity: 3/10** | **Dependency: Task 3.1** | **Status: PENDING**

**File**: `client/src/hooks/useMenuItems.ts`

**Implementation:**
```typescript
// Use useMemo to prevent recreation on every render
const fuseInstance = useMemo(() => {
  if (!menuItems || menuItems.length === 0) return null;
  return createMenuFuseInstance(menuItems);
}, [menuItems]);
```

**Testing Checklist:**
- [ ] Fuse instance doesn't recreate on every render
- [ ] New instance created when items change
- [ ] Performance improved (check React DevTools)

---

#### ☐ Task 6.2: Optimize Search for Large Menus
**Complexity: 4/10** | **Dependency: Task 6.1** | **Status: PENDING**

**File**: `client/src/hooks/useMenuItems.ts`

**Optimizations:**
1. Use `useTransition` for non-blocking UI updates
2. Limit search results (MAX_SEARCH_RESULTS = 50)
3. Filter by minimum relevance threshold
4. Debounce expensive operations

```typescript
const MAX_SEARCH_RESULTS = 50;
const MIN_RELEVANCE_THRESHOLD = 15;

// Non-blocking state updates
const [isSearchPending, startSearchTransition] = useTransition();
```

**Testing Checklist:**
- [ ] Search remains responsive with 100+ items
- [ ] UI doesn't freeze during search
- [ ] Loading state exposed for UI feedback

---

### Phase 7: Testing & QA

#### ☐ Task 7.1: Unit Test Fuzzy Search Utils
**Complexity: 4/10** | **Dependency: Task 2.3** | **Status: PENDING**

**File to Create**: `client/src/utils/__tests__/fuzzySearch.test.ts`

**Test Suites:**
- `createMenuFuseInstance` - Factory function tests
- `searchMenuItems` - Core search tests (exact, typo, partial, edge cases)
- `searchWithHighlights` - Highlight generation tests
- `performExactSearch` - Fallback search tests
- `generateHighlights` - Segment generation tests

**Testing Checklist:**
- [ ] All test cases written
- [ ] Edge cases covered (empty, special chars, long strings)
- [ ] Tests pass with Vitest

---

#### ☐ Task 7.2: Create Integration Testing Checklist
**Complexity: 3/10** | **Dependency: Task 5.1** | **Status: PENDING**

**File to Create**: `docs/fuzzy_search/FuzzySearch_Testing_Checklist.md`

**Test Categories:**
1. Basic Search (3 tests)
2. Fuzzy Search (5 tests)
3. Toggle Functionality (5 tests)
4. Results Display (4 tests)
5. Highlights (3 tests)
6. No Results State (4 tests)
7. Performance (3 tests)
8. Edge Cases (5 tests)
9. Accessibility (11 tests)
10. Console Errors (4 tests)

**Reference**: Copy and adapt from `smart-restaurant-customer/docs/fuzzy_search/FuzzySearch_Testing_Checklist.md`

**Testing Checklist:**
- [ ] All scenarios documented
- [ ] Checklist format for easy tracking
- [ ] Performance criteria included (<200ms response)

---

#### ☐ Task 7.3: Accessibility Testing
**Complexity: 2/10** | **Dependency: Task 4.2** | **Status: PENDING**

**Requirements:**
- [ ] Fuzzy toggle has `aria-label="Enable/Disable smart search"`
- [ ] Toggle has `role="switch"`
- [ ] Toggle has `aria-pressed={fuzzyEnabled}`
- [ ] Keyboard navigation works (Enter/Space to toggle)
- [ ] Focus states visible on all interactive elements
- [ ] Highlights meet color contrast requirements

---

### Phase 8: Documentation & Cleanup

#### ☐ Task 8.1: Add JSDoc Comments
**Complexity: 2/10** | **Dependency: All coding tasks** | **Status: PENDING**

**Files to Document:**
- `fuzzySearch.ts` - All exported functions
- `useMenuItems.ts` - New properties and functions
- `MenuItemList.tsx` - New props

**Testing Checklist:**
- [ ] All public functions have JSDoc
- [ ] Parameter types documented
- [ ] Return types documented
- [ ] Usage examples in comments

---

#### ☐ Task 8.2: Update README
**Complexity: 1/10** | **Dependency: Task 8.1** | **Status: PENDING**

**Add to README:**
- Fuzzy search feature explanation
- Configuration options (if any)
- How admin search differs from customer search

---

## Summary Statistics

| Phase | Tasks | Total Complexity |
|-------|-------|------------------|
| Phase 1: Setup | 2 | 3/20 |
| Phase 2: Utility | 4 | 13/40 |
| Phase 3: Hook | 3 | 11/30 |
| Phase 4: UI | 4 | 12/40 |
| Phase 5: Page | 2 | 5/20 |
| Phase 6: Performance | 2 | 7/20 |
| Phase 7: Testing | 3 | 9/30 |
| Phase 8: Documentation | 2 | 3/20 |

**Total: 22 tasks | ~63/220 complexity points**

---

## Dependency Graph

```
Task 1.1 → Task 1.2 → Task 2.1 → Task 2.2 → Task 2.3 → Task 3.1 → Task 3.2 → Task 5.1
                         ↓         ↓           ↓           ↓           ↓
                     (types)    Task 2.4   Task 3.3    Task 4.2 → Task 4.3 → Task 4.4
                                   ↓                       ↓
                               Task 4.1               Task 5.2
                                                          ↓
                               Task 6.1 → Task 6.2    Task 7.1 → Task 7.2 → Task 7.3
                                                                                ↓
                                                                           Task 8.1 → Task 8.2
```

---

## Implementation Order (Recommended)

1. **Task 1.1** - Choose library (decision) ✓ Fuse.js
2. **Task 1.2** - Install package
3. **Task 2.1** - Create types first
4. **Task 2.2** - Create config file
5. **Task 2.3** - Implement core logic
6. **Task 2.4** - Implement highlight utils
7. **Task 4.1** - Create HighlightedText component
8. **Task 3.1** - Add hook state
9. **Task 3.2** - Implement filtering
10. **Task 3.3** - Add toggle persistence
11. **Task 4.2** - Add toggle UI
12. **Task 4.3** - Add highlights to cards
13. **Task 4.4** - Add no results state
14. **Task 5.1** - Connect MenuManagementPage
15. **Task 5.2** - Update results display
16. **Task 6.1** - Memoize instance
17. **Task 6.2** - Optimize performance
18. **Task 7.1** - Unit tests
19. **Task 7.2** - Integration testing checklist
20. **Task 7.3** - A11y testing
21. **Task 8.1** - Documentation
22. **Task 8.2** - README update

---

## Key Differences from Customer App

| Aspect | Customer App | Admin App |
|--------|--------------|-----------|
| **Context** | Public-facing menu browsing | Staff menu management |
| **Data Volume** | All active items | All items (incl. inactive) |
| **Pagination** | Scrollable/infinite | Traditional pagination |
| **Actions** | View, add to cart | CRUD operations |
| **UI Theme** | Luxury gold/dark | Admin Naples yellow |
| **Toggle Default** | Always ON | User preference |

---

## Quick Start Command

When ready to implement, prompt:
> "Implement Task 1.2: Install Fuse.js package"

The AI will execute the specific task with full context from this plan.

---

## Files to Create/Modify Summary

### New Files:
- `client/src/types/search.types.ts`
- `client/src/utils/fuzzySearch.ts`
- `client/src/components/common/HighlightedText.tsx`
- `client/src/utils/__tests__/fuzzySearch.test.ts`
- `docs/fuzzy_search/FuzzySearch_Testing_Checklist.md`

### Modified Files:
- `client/src/hooks/useMenuItems.ts`
- `client/src/components/menuItem/MenuItemList.tsx`
- `client/src/components/menuItem/MenuItemCard.tsx`
- `client/src/pages/MenuManagementPage.tsx`
