const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

/**
 * Mock file upload service (replaces Cloudinary)
 * Stores files locally in uploads/ directory
 */

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure multer for local storage
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join(uploadsDir, getUploadSubfolder(file.fieldname));
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}_${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) and PDFs are allowed'));
    }
};

// Get subfolder based on field name
const getUploadSubfolder = (fieldname) => {
    if (fieldname === 'profileImage') return 'profiles';
    if (fieldname === 'mediaFiles') return 'incidents';
    if (fieldname === 'attachments') return 'messages';
    return 'misc';
};

// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_UPLOAD_SIZE_MB || 10) * 1024 * 1024, // MB to bytes
        files: parseInt(process.env.MAX_FILES_PER_INCIDENT || 5)
    }
});

/**
 * Middleware for incident photo uploads (up to 5 files)
 */
const uploadIncidentPhotos = upload.array('mediaFiles', 5);

/**
 * Middleware for profile image upload (single file)
 */
const uploadProfileImage = upload.single('profileImage');

/**
 * Middleware for message attachments (up to 3 files)
 */
const uploadMessageAttachments = upload.array('attachments', 3);

/**
 * Mock Cloudinary upload function
 * Returns a mock URL for the uploaded file
 */
const uploadToCloudinary = async (file) => {
    // In real implementation, this would upload to Cloudinary
    // For mock, we just return a local URL
    const relativePath = path.relative(
        path.join(__dirname, '../../'),
        file.path
    ).replace(/\\/g, '/');

    return {
        url: `/uploads/${relativePath}`,
        publicId: file.filename,
        format: path.extname(file.originalname).substring(1),
        bytes: file.size
    };
};

/**
 * Delete file from storage
 */
const deleteFile = async (filePath) => {
    try {
        const fullPath = path.join(__dirname, '../../', filePath);
        await fs.unlink(fullPath);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

/**
 * Process uploaded files and return URLs
 */
const processUploadedFiles = async (files) => {
    if (!files || files.length === 0) {
        return [];
    }

    const urls = [];
    for (const file of files) {
        const result = await uploadToCloudinary(file);
        urls.push(result.url);
    }

    return urls;
};

module.exports = {
    uploadIncidentPhotos,
    uploadProfileImage,
    uploadMessageAttachments,
    uploadToCloudinary,
    deleteFile,
    processUploadedFiles
};
