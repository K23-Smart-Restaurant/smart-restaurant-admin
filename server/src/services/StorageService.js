import supabase from "../lib/supabase.js";
import crypto from "crypto";
import path from "path";

const BUCKET_NAME = "smart-restaurant-admin";
const MENU_ITEMS_FOLDER = "menu-items";
const QR_CODES_FOLDER = "qr-codes";

/**
 * StorageService - Handles file uploads to Supabase Storage
 */
class StorageService {
  /**
   * Check if Supabase storage is configured
   */
  isConfigured() {
    return supabase !== null;
  }

  /**
   * Upload a file to Supabase Storage
   * @param {Buffer} fileBuffer - File content as buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - File MIME type
   * @param {string} folder - Folder path within the bucket
   * @returns {Promise<{url: string, path: string}>} Public URL and storage path
   */
  async uploadFile(
    fileBuffer,
    originalName,
    mimeType,
    folder = MENU_ITEMS_FOLDER
  ) {
    if (!supabase) {
      throw new Error(
        "Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
      );
    }

    // Generate unique filename to prevent collisions
    const ext = path.extname(originalName).toLowerCase();
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    const storagePath = `${folder}/${uniqueName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    return {
      url: urlData.publicUrl,
      path: storagePath,
    };
  }

  /**
   * Upload a menu item photo
   * @param {Object} file - Multer file object (with buffer)
   * @returns {Promise<{url: string, path: string}>}
   */
  async uploadMenuItemPhoto(file) {
    return this.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      MENU_ITEMS_FOLDER
    );
  }

  /**
   * Upload multiple menu item photos
   * @param {Array} files - Array of multer file objects
   * @returns {Promise<Array<{url: string, path: string, isPrimary: boolean}>>}
   */
  async uploadMenuItemPhotos(files, primaryIndex = 0) {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map(async (file, index) => {
      const result = await this.uploadMenuItemPhoto(file);
      return {
        ...result,
        isPrimary: index === primaryIndex,
      };
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Supabase Storage
   * @param {string} storagePath - Path within the bucket
   */
  async deleteFile(storagePath) {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.error("Supabase delete error:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Delete a file by its public URL
   * @param {string} publicUrl - The public URL of the file
   */
  async deleteFileByUrl(publicUrl) {
    // Extract storage path from public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const urlParts = publicUrl.split(
      `/storage/v1/object/public/${BUCKET_NAME}/`
    );
    if (urlParts.length < 2) {
      console.warn("Could not extract storage path from URL:", publicUrl);
      return;
    }

    const storagePath = urlParts[1];
    return this.deleteFile(storagePath);
  }

  /**
   * Check if a file exists in storage
   * @param {string} storagePath - Path within the bucket
   * @returns {Promise<boolean>}
   */
  async fileExists(storagePath) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(path.dirname(storagePath), {
        search: path.basename(storagePath),
      });

    if (error) return false;
    return data && data.length > 0;
  }

  /**
   * Upload a QR code image to Supabase Storage
   * @param {Buffer} qrBuffer - PNG buffer of the QR code
   * @param {string} tableId - Table ID for naming the file
   * @returns {Promise<{url: string, path: string}>} Public URL and storage path
   */
  async uploadQRCode(qrBuffer, tableId) {
    const filename = `table-${tableId}-${Date.now()}.png`;
    return this.uploadFile(qrBuffer, filename, "image/png", QR_CODES_FOLDER);
  }

  /**
   * Delete old QR code image from storage if it exists
   * @param {string} qrCodeUrl - Current QR code URL (may be base64 or Supabase URL)
   */
  async deleteOldQRCode(qrCodeUrl) {
    if (!qrCodeUrl) return;

    // Skip if it's a base64 data URL (old format)
    if (qrCodeUrl.startsWith("data:")) {
      return;
    }

    // Delete from Supabase if it's a Supabase URL
    try {
      await this.deleteFileByUrl(qrCodeUrl);
    } catch (error) {
      console.warn("Could not delete old QR code:", error.message);
      // Don't throw - it's okay if deletion fails
    }
  }
}

export default new StorageService();
