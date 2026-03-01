const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Submit contact form (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, eventType, date, message } = req.body;
        
        // Validation
        if (!name || !email || !phone || !message) {
            return res.status(400).json({ error: 'Required fields missing' });
        }
        
        const contact = new Contact({
            name,
            email,
            phone,
            eventType,
            date: date ? new Date(date) : null,
            message
        });
        
        await contact.save();
        res.json({ 
            success: true, 
            message: 'Message sent successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all contacts (admin)
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete contact (admin)
router.delete('/:id', async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;