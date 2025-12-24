import multer from "multer";
import path from "path";

// Use memory storage for Supabase uploads (files stored as buffers)
// This allows us to upload directly to Supabase Storage without saving to disk
const storage = multer.memoryStorage();

// M8: MIME type and file validation with descriptive errors
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const fileExt = path.extname(file.originalname).toLowerCase();

  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        `Invalid MIME type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`
      ),
      false
    );
  }

  // Check file extension for additional security
  if (!allowedExtensions.includes(fileExt)) {
    return cb(
      new Error(
        `Invalid file extension: ${fileExt}. Only .jpg, .jpeg, .png, and .webp are allowed.`
      ),
      false
    );
  }

  cb(null, true);
};

// M8: Configure multer with validation limits
const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // M8: 5MB max file size
    files: 5, // Maximum 5 files per upload
  },
};

// Single file upload (backward compatibility - field name 'image')
const uploadSingle = multer(multerConfig).single("image");

// H2: Multiple file upload for menu item photos (up to 5 photos)
const uploadMultiple = multer(multerConfig).array("photos", 5);

// Combined upload for menu items - accepts both 'photos' (multiple) and 'image' (single)
// This provides backward compatibility while supporting multi-photo uploads
const uploadMenuItemPhotos = multer(multerConfig).fields([
  { name: "photos", maxCount: 5 },
  { name: "image", maxCount: 1 },
]);

// H3: Single photo upload for updating/adding individual photos
const uploadPhoto = multer(multerConfig).single("photo");

// M8: Error handler wrapper to provide descriptive error messages
const handleUploadError = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // M8: Handle multer-specific errors with descriptive messages
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File too large",
            message: "File size must not exceed 5MB",
            maxSize: "5MB",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            error: "Too many files",
            message: "Maximum 5 files allowed per upload",
            maxFiles: 5,
          });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            error: "Unexpected field",
            message: err.message,
          });
        }
        return res.status(400).json({
          error: "Upload error",
          message: err.message,
        });
      } else if (err) {
        // M8: Handle validation errors (MIME type, file extension)
        return res.status(400).json({
          error: "Invalid file",
          message: err.message,
        });
      }
      next();
    });
  };
};

export {
  uploadSingle,
  uploadMultiple,
  uploadMenuItemPhotos,
  uploadPhoto,
  handleUploadError
};
