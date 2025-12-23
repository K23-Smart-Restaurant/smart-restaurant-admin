import prisma from "../lib/prisma.js";

/**
 * MenuItemPhoto Service
 * H2: Multiple-photos support for menu items
 * H3: Primary photo selection functionality
 */
class MenuItemPhotoService {
    /**
     * H2: Add a photo to a menu item
     */
    async addPhoto(menuItemId, photoData) {
        const { url, isPrimary = false } = photoData;

        // If setting as primary, unset other primary photos first
        if (isPrimary) {
            await prisma.menuItemPhoto.updateMany({
                where: {
                    menuItemId,
                    isPrimary: true,
                },
                data: {
                    isPrimary: false,
                },
            });
        }

        const photo = await prisma.menuItemPhoto.create({
            data: {
                menuItemId,
                url,
                isPrimary,
            },
        });

        return photo;
    }

    /**
     * H2: Add multiple photos to a menu item
     */
    async addMultiplePhotos(menuItemId, files) {
        // Check if menu item exists
        const menuItem = await prisma.menuItem.findUnique({
            where: { id: menuItemId },
        });

        if (!menuItem) {
            throw new Error("Menu item not found");
        }

        // Get existing photo count
        const existingPhotos = await prisma.menuItemPhoto.count({
            where: { menuItemId },
        });

        // Limit total photos to 10
        if (existingPhotos + files.length > 10) {
            throw new Error(
                `Cannot add ${files.length} photos. Maximum 10 photos per menu item. Current: ${existingPhotos}`
            );
        }

        // Determine if the first photo should be primary
        const shouldSetPrimary = existingPhotos === 0;

        // Create photo records
        const photoPromises = files.map((file, index) => {
            return prisma.menuItemPhoto.create({
                data: {
                    menuItemId,
                    url: `/uploads/menu-items/${file.filename}`,
                    isPrimary: shouldSetPrimary && index === 0,
                },
            });
        });

        const photos = await Promise.all(photoPromises);
        return photos;
    }

    /**
     * H3: Set a photo as primary
     */
    async setPrimaryPhoto(menuItemId, photoId) {
        // Verify the photo belongs to the menu item
        const photo = await prisma.menuItemPhoto.findFirst({
            where: {
                id: photoId,
                menuItemId,
            },
        });

        if (!photo) {
            throw new Error("Photo not found for this menu item");
        }

        // Use transaction to ensure atomicity
        await prisma.$transaction([
            // Unset all other primary photos for this menu item
            prisma.menuItemPhoto.updateMany({
                where: {
                    menuItemId,
                    isPrimary: true,
                },
                data: {
                    isPrimary: false,
                },
            }),
            // Set the specified photo as primary
            prisma.menuItemPhoto.update({
                where: { id: photoId },
                data: { isPrimary: true },
            }),
        ]);

        return await prisma.menuItemPhoto.findUnique({
            where: { id: photoId },
        });
    }

    /**
     * H2: Get all photos for a menu item
     */
    async getPhotos(menuItemId) {
        const photos = await prisma.menuItemPhoto.findMany({
            where: { menuItemId },
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        });

        return photos;
    }

    /**
     * H3: Delete a photo
     */
    async deletePhoto(menuItemId, photoId) {
        // Verify the photo belongs to the menu item
        const photo = await prisma.menuItemPhoto.findFirst({
            where: {
                id: photoId,
                menuItemId,
            },
        });

        if (!photo) {
            throw new Error("Photo not found for this menu item");
        }

        // Delete the photo record
        await prisma.menuItemPhoto.delete({
            where: { id: photoId },
        });

        // If it was primary, set another photo as primary
        if (photo.isPrimary) {
            const remainingPhotos = await prisma.menuItemPhoto.findFirst({
                where: { menuItemId },
                orderBy: { createdAt: "asc" },
            });

            if (remainingPhotos) {
                await prisma.menuItemPhoto.update({
                    where: { id: remainingPhotos.id },
                    data: { isPrimary: true },
                });
            }
        }

        return { message: "Photo deleted successfully" };
    }

    /**
     * Get primary photo for a menu item
     */
    async getPrimaryPhoto(menuItemId) {
        const photo = await prisma.menuItemPhoto.findFirst({
            where: {
                menuItemId,
                isPrimary: true,
            },
        });

        return photo;
    }
}

export default new MenuItemPhotoService();
