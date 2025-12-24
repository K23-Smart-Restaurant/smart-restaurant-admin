import prisma from "../lib/prisma.js";

/**
 * PublicMenuService - H1: Public Guest Menu API
 * Provides menu data for guests browsing via QR code without authentication
 */
class PublicMenuService {
    /**
     * H1: Get public menu items for guest browsing
     * Supports search, filter, sort, and pagination
     * @param {Object} filters - Query filters
     * @param {string} filters.search - Search by item name
     * @param {string} filters.categoryId - Filter by category ID
     * @param {string} filters.category - Filter by category enum (APPETIZER, MAIN_COURSE, etc.)
     * @param {boolean} filters.isChefRecommendation - Filter chef recommendations
     * @param {string} filters.sortBy - Sort field (name, price, popularity)
     * @param {string} filters.sortOrder - Sort direction (asc, desc)
     * @param {number} filters.limit - Items per page
     * @param {number} filters.offset - Pagination offset
     * @param {string} filters.restaurantId - Optional restaurant ID for multi-tenant
     */
    async getPublicMenu(filters = {}) {
        const where = {
            isAvailable: true, // Only show available items
            isSoldOut: false, // Hide sold out items from public menu
        };

        // Search by name
        if (filters.search) {
            where.name = { contains: filters.search, mode: "insensitive" };
        }

        // Filter by category ID
        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }

        // Filter by category enum
        if (filters.category) {
            where.category = filters.category;
        }

        // Filter chef recommendations
        if (filters.isChefRecommendation !== undefined) {
            where.isChefRecommendation = filters.isChefRecommendation;
        }

        // Restaurant scope (for multi-tenant)
        if (filters.restaurantId) {
            where.restaurantId = filters.restaurantId;
        }

        // M2: Build orderBy with popularity support
        let orderBy = { createdAt: "desc" };
        if (filters.sortBy === "name") {
            orderBy = { name: filters.sortOrder || "asc" };
        } else if (filters.sortBy === "price") {
            orderBy = { price: filters.sortOrder || "asc" };
        } else if (filters.sortBy === "popularity") {
            // M2: For popularity sorting, we'll use a raw query approach
            // First get items with order counts, then sort
            return this.getMenuItemsByPopularity(where, filters);
        }

        const limit = filters.limit || 20;
        const offset = filters.offset || 0;

        const [items, total] = await Promise.all([
            prisma.menuItem.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    category: true,
                    price: true,
                    imageUrl: true,
                    isChefRecommendation: true,
                    preparationTime: true,
                    categoryId: true,
                    // Include photos with primary first
                    photos: {
                        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
                        select: {
                            id: true,
                            url: true,
                            isPrimary: true,
                        },
                    },
                    // Include category info
                    categoryModel: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    // Include modifier groups for customization
                    modifiers: {
                        where: { status: "active" },
                        orderBy: { displayOrder: "asc" },
                        select: {
                            id: true,
                            name: true,
                            selectionType: true,
                            isRequired: true,
                            minSelections: true,
                            maxSelections: true,
                            modifiers: {
                                where: { status: "active" },
                                orderBy: { displayOrder: "asc" },
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                },
                            },
                        },
                    },
                },
                orderBy,
                take: limit,
                skip: offset,
            }),
            prisma.menuItem.count({ where }),
        ]);

        return {
            items: this.formatMenuItems(items),
            total,
            limit,
            offset,
        };
    }

    /**
     * M2: Get menu items sorted by popularity (order count)
     * Uses aggregation to count orders per menu item
     */
    async getMenuItemsByPopularity(where, filters) {
        const limit = filters.limit || 20;
        const offset = filters.offset || 0;
        const sortOrder = filters.sortOrder || "desc";

        // Get all menu items with their order counts
        const itemsWithCounts = await prisma.menuItem.findMany({
            where,
            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                price: true,
                imageUrl: true,
                isChefRecommendation: true,
                preparationTime: true,
                categoryId: true,
                photos: {
                    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
                    select: {
                        id: true,
                        url: true,
                        isPrimary: true,
                    },
                },
                categoryModel: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                modifiers: {
                    where: { status: "active" },
                    orderBy: { displayOrder: "asc" },
                    select: {
                        id: true,
                        name: true,
                        selectionType: true,
                        isRequired: true,
                        minSelections: true,
                        maxSelections: true,
                        modifiers: {
                            where: { status: "active" },
                            orderBy: { displayOrder: "asc" },
                            select: {
                                id: true,
                                name: true,
                                price: true,
                            },
                        },
                    },
                },
                // Include order count for popularity
                _count: {
                    select: {
                        orderItems: true,
                    },
                },
            },
        });

        // Sort by order count (popularity)
        const sorted = itemsWithCounts.sort((a, b) => {
            const countA = a._count.orderItems;
            const countB = b._count.orderItems;
            return sortOrder === "desc" ? countB - countA : countA - countB;
        });

        // Apply pagination
        const paginated = sorted.slice(offset, offset + limit);

        return {
            items: this.formatMenuItems(paginated),
            total: sorted.length,
            limit,
            offset,
        };
    }

    /**
     * Format menu items for public API response
     * Adds primaryPhoto field and cleans up response
     */
    formatMenuItems(items) {
        return items.map((item) => {
            const primaryPhoto = item.photos?.find((p) => p.isPrimary) || item.photos?.[0];
            const orderCount = item._count?.orderItems || 0;

            return {
                id: item.id,
                name: item.name,
                description: item.description,
                category: item.category,
                price: parseFloat(item.price),
                imageUrl: primaryPhoto?.url || item.imageUrl,
                primaryPhoto: primaryPhoto || null,
                photos: item.photos || [],
                isChefRecommendation: item.isChefRecommendation,
                preparationTime: item.preparationTime,
                categoryId: item.categoryId,
                categoryName: item.categoryModel?.name || null,
                modifierGroups: item.modifiers?.map((group) => ({
                    id: group.id,
                    name: group.name,
                    selectionType: group.selectionType,
                    isRequired: group.isRequired,
                    minSelections: group.minSelections,
                    maxSelections: group.maxSelections,
                    options: group.modifiers?.map((mod) => ({
                        id: mod.id,
                        name: mod.name,
                        price: parseFloat(mod.price),
                    })) || [],
                })) || [],
                popularity: orderCount,
            };
        });
    }

    /**
     * Get public categories for menu filtering
     */
    async getPublicCategories(restaurantId = null) {
        const where = {
            isActive: true,
        };

        if (restaurantId) {
            where.restaurantId = restaurantId;
        }

        const categories = await prisma.category.findMany({
            where,
            select: {
                id: true,
                name: true,
                description: true,
                displayOrder: true,
                _count: {
                    select: {
                        menuItems: {
                            where: {
                                isAvailable: true,
                                isSoldOut: false,
                            },
                        },
                    },
                },
            },
            orderBy: { displayOrder: "asc" },
        });

        return categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            displayOrder: cat.displayOrder,
            itemCount: cat._count.menuItems,
        }));
    }

    /**
     * Validate QR token and get restaurant context
     * Returns null if token is invalid
     */
    async validateQrToken(token) {
        if (!token) return null;

        const table = await prisma.table.findFirst({
            where: {
                qrToken: token,
                isActive: true,
            },
            select: {
                id: true,
                tableNumber: true,
                restaurantId: true,
            },
        });

        return table;
    }
}

export default new PublicMenuService();
