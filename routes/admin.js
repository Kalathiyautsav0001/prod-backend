const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );
        
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create admin (run once)
router.post('/create', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({
            username,
            password: hashedPassword
        });
        
        await admin.save();
        res.json({ success: true, message: 'Admin created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;