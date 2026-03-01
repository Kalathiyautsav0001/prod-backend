const express = require('express');
const router = express.Router();
const PricingPlan = require('../models/PricingPlan');
const auth = require('../middleware/auth');

// Get all pricing plans (public)
router.get('/', async (req, res) => {
    try {
        const plans = await PricingPlan.find({ isActive: true }).sort({ price: 1 });
        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get plans by category (public)
router.get('/category/:category', async (req, res) => {
    try {
        const plans = await PricingPlan.find({ 
            category: req.params.category,
            isActive: true 
        }).sort({ price: 1 });
        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans by category:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all plans for admin (protected)
router.get('/admin', auth, async (req, res) => {
    try {
        const plans = await PricingPlan.find().sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        console.error('Error fetching admin plans:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create new pricing plan (protected)
router.post('/', auth, async (req, res) => {
    try {
        console.log('📥 Received plan data:', JSON.stringify(req.body, null, 2));
        
        const { name, category, price, duration, guests, features, isActive, popular, image } = req.body;
        
        // Validate required fields
        const requiredFields = { name, category, price, duration, guests };
        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value && value !== 0) {
                return res.status(400).json({ error: `${field} is required` });
            }
        }

        // Validate features
        if (!features || !Array.isArray(features) || features.length === 0) {
            return res.status(400).json({ error: 'At least one feature is required' });
        }

        // Clean features - remove empty strings and trim
        const cleanFeatures = features
            .filter(f => f && typeof f === 'string' && f.trim() !== '')
            .map(f => f.trim());

        if (cleanFeatures.length === 0) {
            return res.status(400).json({ error: 'At least one valid feature is required' });
        }

        // Create plan object
        const planData = {
            name: String(name),
            category: String(category),
            price: Number(price),
            duration: String(duration),
            guests: String(guests),
            features: cleanFeatures,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
            popular: Boolean(popular),
            image: image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop'
        };

        console.log('📦 Processed plan data:', JSON.stringify(planData, null, 2));

        // Create and save the plan
        const plan = new PricingPlan(planData);
        const savedPlan = await plan.save();
        
        console.log('✅ Plan saved successfully:', savedPlan._id);
        res.status(201).json({ 
            success: true, 
            plan: savedPlan,
            message: 'Plan created successfully'
        });
        
    } catch (error) {
        console.error('❌ Error creating plan:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Duplicate plan name' });
        }
        
        // Send error response
        res.status(500).json({ 
            error: error.message || 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update pricing plan (protected)
router.put('/:id', auth, async (req, res) => {
    try {
        console.log('📝 Updating plan:', req.params.id, req.body);
        
        const { name, category, price, duration, guests, features, isActive, popular, image } = req.body;
        
        // Validate required fields
        if (!name || !category || !price || !duration || !guests || !features) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Clean features
        const cleanFeatures = Array.isArray(features) 
            ? features.filter(f => f && f.trim() !== '').map(f => f.trim())
            : [features].filter(f => f && f.trim() !== '').map(f => f.trim());

        const updatedPlan = await PricingPlan.findByIdAndUpdate(
            req.params.id,
            {
                name,
                category,
                price: Number(price),
                duration,
                guests,
                features: cleanFeatures,
                isActive,
                popular,
                image
            },
            { new: true, runValidators: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        console.log('✅ Plan updated:', updatedPlan._id);
        res.json({ success: true, plan: updatedPlan });
        
    } catch (error) {
        console.error('❌ Error updating plan:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        
        res.status(500).json({ error: error.message });
    }
});

// Delete pricing plan (protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const plan = await PricingPlan.findByIdAndDelete(req.params.id);
        
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        console.log('✅ Plan deleted:', req.params.id);
        res.json({ success: true, message: 'Plan deleted successfully' });
        
    } catch (error) {
        console.error('❌ Error deleting plan:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;