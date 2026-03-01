const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'media-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos allowed'), false);
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for videos
});

// Get all media
router.get('/', async (req, res) => {
    try {
        const media = await Gallery.find().sort({ uploadedAt: -1 });
        res.json(media);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get media by category
router.get('/category/:category', async (req, res) => {
    try {
        const media = await Gallery.find({ 
            category: req.params.category 
        }).sort({ uploadedAt: -1 });
        res.json(media);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload multiple media files
router.post('/upload', auth, upload.array('media', 20), async (req, res) => {
    try {
        const { category, mediaType } = req.body;
        const files = req.files;
        
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const savedMedia = [];
        
        for (const file of files) {
            const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
            const media = new Gallery({
                mediaUrl,
                category,
                mediaType: mediaType || (file.mimetype.startsWith('video/') ? 'video' : 'image')
            });
            await media.save();
            savedMedia.push(media);
        }
        
        res.json({ 
            success: true, 
            count: savedMedia.length,
            media: savedMedia 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete media
router.delete('/:id', auth, async (req, res) => {
    try {
        const media = await Gallery.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }
        
        // Delete file from uploads
        const filename = media.mediaUrl.split('/').pop();
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        await media.deleteOne();
        res.json({ success: true, message: 'Media deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all unique categories (for frontend)
router.get('/categories', async (req, res) => {
    try {
        const categories = await Gallery.distinct('category');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this to your gallery.js backend route file

// ✨ NEW: Update gallery item
router.put('/:id', auth, async (req, res) => {
    try {
        const { category, mediaType } = req.body;
        
        // Validate input
        if (!category && !mediaType) {
            return res.status(400).json({ 
                error: 'No update data provided' 
            });
        }

        // Find and update the item
        const updatedItem = await Gallery.findByIdAndUpdate(
            req.params.id,
            { 
                ...(category && { category }),
                ...(mediaType && { mediaType })
            },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ 
            success: true, 
            message: 'Item updated successfully',
            item: updatedItem 
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;