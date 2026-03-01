const express = require('express');
const router = express.Router();
const DecorationItem = require('../models/DecorationItem');
const auth = require('../middleware/auth');

// Get all decoration items (public)
router.get('/', async (req, res) => {
    try {
        const items = await DecorationItem.find({ available: true }).sort({ price: 1 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get items by category (public)
router.get('/category/:category', async (req, res) => {
    try {
        const items = await DecorationItem.find({ 
            category: req.params.category,
            available: true 
        }).sort({ price: 1 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching items by category:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all items for admin (protected)
router.get('/admin', auth, async (req, res) => {
    try {
        const items = await DecorationItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching admin items:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create new decoration item (protected)
router.post('/', auth, async (req, res) => {
    try {
        console.log('Received item data:', req.body);
        
        const { name, category, price, priceType, description, image, available, stock, tags } = req.body;
        
        // Validation
        if (!name || !category || !price || !priceType || !description || !image) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                received: req.body 
            });
        }

        const item = new DecorationItem({
            name,
            category,
            price: Number(price),
            priceType,
            description,
            image,
            available: available !== undefined ? available : true,
            stock: stock || 0,
            tags: tags || []
        });

        const savedItem = await item.save();
        console.log('Saved item:', savedItem);
        
        res.status(201).json({ success: true, item: savedItem });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update decoration item (protected)
router.put('/:id', auth, async (req, res) => {
    try {
        console.log('Updating item:', req.params.id, req.body);
        
        const { name, category, price, priceType, description, image, available, stock, tags } = req.body;
        
        const updatedItem = await DecorationItem.findByIdAndUpdate(
            req.params.id,
            {
                name,
                category,
                price: Number(price),
                priceType,
                description,
                image,
                available,
                stock: stock || 0,
                tags: tags || []
            },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        console.log('Updated item:', updatedItem);
        res.json({ success: true, item: updatedItem });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete decoration item (protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const item = await DecorationItem.findByIdAndDelete(req.params.id);
        
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;