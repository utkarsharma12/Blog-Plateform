import express from 'express';
import { upload } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const router = express.Router();

// Configure Cloudinary if env vars are provided
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    // If Cloudinary configured, upload to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'blog_platform',
          use_filename: true,
        });

        // Clean up local temp file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back to local file URL:', cloudErr.message);
      }
    }

    // Default: Return local static URL
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ message: err.message || 'Image upload failed.' });
  }
});

export default router;
