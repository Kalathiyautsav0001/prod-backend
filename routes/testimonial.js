const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');

// Get all testimonials (admin)
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get only approved testimonials (public)
router.get('/approved', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ approved: true }).sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit testimonial (public)
router.post('/', async (req, res) => {
    try {
        const { name, contact, message, rating } = req.body;
        
        // Validation
        if (!name || !contact || !message || !rating) {
            return res.status(400).json({ error: 'All fields required' });
        }
        
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(contact)) {
            return res.status(400).json({ error: 'Invalid phone number' });
        }
        
        const testimonial = new Testimonial({
            name,
            contact,
            message,
            rating
        });
        
        await testimonial.save();
        res.json({ 
            success: true, 
            message: 'Testimonial submitted for approval' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve testimonial (admin)
router.put('/:id/approve', async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ error: 'Not found' });
        }
        
        testimonial.approved = true;
        await testimonial.save();
        res.json({ success: true, message: 'Testimonial approved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete testimonial (admin)
router.delete('/:id', async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Testimonial deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;