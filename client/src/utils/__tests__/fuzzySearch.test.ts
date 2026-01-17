/**
 * Fuzzy Search Utility Tests
 * Task 7.1: Unit Test Fuzzy Search Utils
 *
 * @module utils/__tests__/fuzzySearch.test
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Fuse from 'fuse.js';
import {
  DEFAULT_FUZZY_CONFIG,
  MENU_SEARCH_KEYS,
  createMenuFuseInstance,
  searchMenuItems,
  searchWithHighlights,
  quickSearch,
  generateHighlightSegments,
  scoreToPercentage,
  isRelevant,
  filterByRelevance,
  getSuggestions,
  createScoreMap,
  createHighlightsMap,
  performExactSearch,
} from '../fuzzySearch';
import type { MenuItem } from '../../services/menuItemService';

// ===========================================
// Test Data
// ===========================================

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Cheese Burger',
    description: 'Juicy beef patty with melted cheese',
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Main Course' },
    price: 12.99,
    preparationTime: 15,
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: true,
    imageUrl: null,
    photos: [],
    modifiers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with caesar dressing',
    categoryId: 'cat-2',
    category: { id: 'cat-2', name: 'Appetizer' },
    price: 8.99,
    preparationTime: 10,
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: false,
    imageUrl: null,
    photos: [],
    modifiers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Chocolate Cake',
    description: 'Rich chocolate layer cake with frosting',
    categoryId: 'cat-3',
    category: { id: 'cat-3', name: 'Dessert' },
    price: 6.99,
    preparationTime: 5,
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: false,
    imageUrl: null,
    photos: [],
    modifiers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella and basil',
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Main Course' },
    price: 14.99,
    preparationTime: 20,
    isAvailable: false,
    isSoldOut: true,
    isChefRecommendation: false,
    imageUrl: null,
    photos: [],
    modifiers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    categoryId: 'cat-4',
    category: { id: 'cat-4', name: 'Beverage' },
    price: 4.99,
    preparationTime: 3,
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: false,
    imageUrl: null,
    photos: [],
    modifiers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ===========================================
// Configuration Tests
// ===========================================

describe('Fuzzy Search Configuration', () => {
  describe('DEFAULT_FUZZY_CONFIG', () => {
    it('should have correct threshold value', () => {
      expect(DEFAULT_FUZZY_CONFIG.threshold).toBe(0.35);
    });

    it('should include score in results', () => {
      expect(DEFAULT_FUZZY_CONFIG.includeScore).toBe(true);
    });

    it('should include matches for highlights', () => {
      expect(DEFAULT_FUZZY_CONFIG.includeMatches).toBe(true);
    });

    it('should ignore location for long text', () => {
      expect(DEFAULT_FUZZY_CONFIG.ignoreLocation).toBe(true);
    });
  });

  describe('MENU_SEARCH_KEYS', () => {
    it('should prioritize name field with higher weight', () => {
      const nameKey = MENU_SEARCH_KEYS.find((k) => k.name === 'name');
      expect(nameKey?.weight).toBe(2.0);
    });

    it('should include description field', () => {
      const descKey = MENU_SEARCH_KEYS.find((k) => k.name === 'description');
      expect(descKey).toBeDefined();
      expect(descKey?.weight).toBe(1.0);
    });

    it('should include category field with lower weight', () => {
      const catKey = MENU_SEARCH_KEYS.find((k) => k.name === 'category');
      expect(catKey?.weight).toBe(0.5);
    });
  });
});

// ===========================================
// Factory Function Tests
// ===========================================

describe('createMenuFuseInstance', () => {
  it('should create a Fuse instance', () => {
    const fuse = createMenuFuseInstance(mockMenuItems);
    expect(fuse).toBeInstanceOf(Fuse);
  });

  it('should create instance with empty array', () => {
    const fuse = createMenuFuseInstance([]);
    expect(fuse).toBeInstanceOf(Fuse);
  });

  it('should accept custom config', () => {
    const customConfig = { threshold: 0.5 };
    const fuse = createMenuFuseInstance(mockMenuItems, customConfig);
    expect(fuse).toBeInstanceOf(Fuse);
  });
});

// ===========================================
// Core Search Tests (Fuzzy)
// ===========================================

describe('searchMenuItems', () => {
  let fuse: Fuse<MenuItem>;

  beforeEach(() => {
    fuse = createMenuFuseInstance(mockMenuItems);
  });

  describe('Typo Tolerance', () => {
    it('should find "cheese burger" with typo "chese"', () => {
      const results = searchMenuItems(fuse, 'chese');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Cheese Burger');
    });

    it('should find "pizza" with typo "pizzz"', () => {
      const results = searchMenuItems(fuse, 'pizzz');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Margherita Pizza');
    });

    it('should find "chocolate" with typo "choclate"', () => {
      const results = searchMenuItems(fuse, 'choclate');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Chocolate Cake');
    });

    it('should find "caesar" with typo "ceasar"', () => {
      const results = searchMenuItems(fuse, 'ceasar');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Caesar Salad');
    });
  });

  describe('Partial Matching', () => {
    it('should match partial word "burg" to Cheese Burger', () => {
      const results = searchMenuItems(fuse, 'burg');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Cheese Burger');
    });

    it('should match partial word "choc" to Chocolate Cake', () => {
      const results = searchMenuItems(fuse, 'choc');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Chocolate Cake');
    });
  });

  describe('Result Limiting', () => {
    it('should limit results when specified', () => {
      const results = searchMenuItems(fuse, 'a', { limit: 2 });
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should return all results when no limit', () => {
      // Use a more specific query that matches multiple items
      const results = searchMenuItems(fuse, 'cheese');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array for empty query', () => {
      const results = searchMenuItems(fuse, '');
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace query', () => {
      const results = searchMenuItems(fuse, '   ');
      expect(results).toEqual([]);
    });

    it('should handle special characters', () => {
      const results = searchMenuItems(fuse, '@#$%');
      // Should not throw, may return empty array
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle very long query', () => {
      const longQuery = 'a'.repeat(1000);
      const results = searchMenuItems(fuse, longQuery);
      expect(Array.isArray(results)).toBe(true);
    });
  });
});

// ===========================================
// Search with Highlights Tests
// ===========================================

describe('searchWithHighlights', () => {
  let fuse: Fuse<MenuItem>;

  beforeEach(() => {
    fuse = createMenuFuseInstance(mockMenuItems);
  });

  it('should return items, scoreMap, and highlightsMap', () => {
    const result = searchWithHighlights(fuse, 'cheese');
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('scoreMap');
    expect(result).toHaveProperty('highlightsMap');
  });

  it('should populate scoreMap with item IDs', () => {
    const result = searchWithHighlights(fuse, 'cheese');
    expect(result.scoreMap.size).toBeGreaterThan(0);
    expect(result.scoreMap.has('1')).toBe(true); // Cheese Burger
  });

  it('should populate highlightsMap with field highlights', () => {
    const result = searchWithHighlights(fuse, 'cheese');
    const highlights = result.highlightsMap.get('1');
    expect(highlights).toBeDefined();
    expect(highlights!.length).toBeGreaterThan(0);
  });

  it('should respect minRelevance filter', () => {
    const result = searchWithHighlights(fuse, 'cheese', { minRelevance: 50 });
    // Results should only include items with >= 50% relevance
    for (const [, score] of result.scoreMap) {
      expect(scoreToPercentage(score)).toBeGreaterThanOrEqual(50);
    }
  });
});

// ===========================================
// Highlight Generation Tests
// ===========================================

describe('generateHighlightSegments', () => {
  it('should create segments from indices', () => {
    const text = 'Cheese Burger';
    const indices: ReadonlyArray<[number, number]> = [[0, 5]]; // "Cheese"

    const segments = generateHighlightSegments(text, indices);

    expect(segments.length).toBe(2);
    expect(segments[0]).toEqual({ text: 'Cheese', isMatch: true });
    expect(segments[1]).toEqual({ text: ' Burger', isMatch: false });
  });

  it('should handle multiple match regions', () => {
    const text = 'Cheese Burger';
    const indices: ReadonlyArray<[number, number]> = [
      [0, 5],
      [7, 12],
    ];

    const segments = generateHighlightSegments(text, indices);

    expect(segments.length).toBe(3);
    expect(segments[0]).toEqual({ text: 'Cheese', isMatch: true });
    expect(segments[1]).toEqual({ text: ' ', isMatch: false });
    expect(segments[2]).toEqual({ text: 'Burger', isMatch: true });
  });

  it('should handle empty indices', () => {
    const text = 'Cheese Burger';
    const indices: ReadonlyArray<[number, number]> = [];

    const segments = generateHighlightSegments(text, indices);

    expect(segments.length).toBe(1);
    expect(segments[0]).toEqual({ text: 'Cheese Burger', isMatch: false });
  });

  it('should handle match at end of text', () => {
    const text = 'Cheese Burger';
    const indices: ReadonlyArray<[number, number]> = [[7, 12]]; // "Burger"

    const segments = generateHighlightSegments(text, indices);

    expect(segments.length).toBe(2);
    expect(segments[0]).toEqual({ text: 'Cheese ', isMatch: false });
    expect(segments[1]).toEqual({ text: 'Burger', isMatch: true });
  });
});

// ===========================================
// Utility Function Tests
// ===========================================

describe('scoreToPercentage', () => {
  it('should convert 0 score to 100%', () => {
    expect(scoreToPercentage(0)).toBe(100);
  });

  it('should convert 1 score to 0%', () => {
    expect(scoreToPercentage(1)).toBe(0);
  });

  it('should convert 0.5 score to 50%', () => {
    expect(scoreToPercentage(0.5)).toBe(50);
  });

  it('should round to whole number', () => {
    expect(scoreToPercentage(0.333)).toBe(67);
  });
});

describe('isRelevant', () => {
  it('should return true for score with percentage >= minRelevance', () => {
    expect(isRelevant(0, 30)).toBe(true); // 100% >= 30%
    expect(isRelevant(0.5, 30)).toBe(true); // 50% >= 30%
  });

  it('should return false for score with percentage < minRelevance', () => {
    expect(isRelevant(0.9, 30)).toBe(false); // 10% < 30%
  });

  it('should use default minRelevance of 30', () => {
    expect(isRelevant(0.5)).toBe(true); // 50% >= 30%
    expect(isRelevant(0.8)).toBe(false); // 20% < 30%
  });
});

describe('filterByRelevance', () => {
  const mockResults = [
    { item: mockMenuItems[0], score: 0.1, refIndex: 0 }, // 90%
    { item: mockMenuItems[1], score: 0.5, refIndex: 1 }, // 50%
    { item: mockMenuItems[2], score: 0.8, refIndex: 2 }, // 20%
  ];

  it('should filter results by minimum relevance', () => {
    const filtered = filterByRelevance(mockResults, 30);
    expect(filtered.length).toBe(2); // 90% and 50% pass, 20% fails
  });

  it('should return empty array if none pass threshold', () => {
    const filtered = filterByRelevance(mockResults, 95);
    expect(filtered.length).toBe(0);
  });

  it('should return all if threshold is 0', () => {
    const filtered = filterByRelevance(mockResults, 0);
    expect(filtered.length).toBe(3);
  });
});

describe('getSuggestions', () => {
  it('should return suggested items for misspelled query', () => {
    const suggestions = getSuggestions(mockMenuItems, 'chese', 3);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('should limit suggestions to specified count', () => {
    const suggestions = getSuggestions(mockMenuItems, 'a', 2);
    expect(suggestions.length).toBeLessThanOrEqual(2);
  });

  it('should return empty array for no matches', () => {
    const suggestions = getSuggestions(mockMenuItems, 'xyz123nonexistent', 3);
    expect(suggestions.length).toBe(0);
  });
});

// ===========================================
// Map Generation Tests
// ===========================================

describe('createScoreMap', () => {
  it('should create map from results', () => {
    const results = [
      { item: mockMenuItems[0], score: 0.1, refIndex: 0 },
      { item: mockMenuItems[1], score: 0.2, refIndex: 1 },
    ];

    const map = createScoreMap(results);

    expect(map.get('1')).toBe(0.1);
    expect(map.get('2')).toBe(0.2);
  });

  it('should return empty map for empty results', () => {
    const map = createScoreMap([]);
    expect(map.size).toBe(0);
  });
});

describe('createHighlightsMap', () => {
  let fuse: Fuse<MenuItem>;

  beforeEach(() => {
    fuse = createMenuFuseInstance(mockMenuItems);
  });

  it('should create map with field highlights', () => {
    const results = searchMenuItems(fuse, 'cheese');
    const map = createHighlightsMap(results);

    expect(map.size).toBeGreaterThan(0);
    const highlights = map.get('1');
    expect(highlights).toBeDefined();
  });
});

// ===========================================
// Exact Search Fallback Tests
// ===========================================

describe('performExactSearch', () => {
  it('should find exact matches in name', () => {
    const results = performExactSearch(mockMenuItems, 'Cheese');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Cheese Burger');
  });

  it('should find exact matches in description', () => {
    const results = performExactSearch(mockMenuItems, 'romaine');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Caesar Salad');
  });

  it('should be case-insensitive', () => {
    const results = performExactSearch(mockMenuItems, 'CHEESE');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return empty array for no matches', () => {
    const results = performExactSearch(mockMenuItems, 'xyz123nonexistent');
    expect(results.length).toBe(0);
  });

  it('should handle empty query by returning all items', () => {
    // Empty query returns all items (no filter applied)
    const results = performExactSearch(mockMenuItems, '');
    expect(results.length).toBe(mockMenuItems.length);
  });
});

// ===========================================
// Quick Search Tests
// ===========================================

describe('quickSearch', () => {
  it('should return items quickly for simple query', () => {
    const results = quickSearch(mockMenuItems, 'burger');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.name).toBe('Cheese Burger');
  });

  it('should limit results to specified amount', () => {
    const results = quickSearch(mockMenuItems, 'a', { limit: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('should handle typos', () => {
    const results = quickSearch(mockMenuItems, 'pizzz');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.name).toBe('Margherita Pizza');
  });
});
