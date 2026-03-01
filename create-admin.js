// server/create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Admin model
const Admin = require('./models/Admin');

// MongoDB Connection - REMOVED deprecated options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devam-events')
.then(async () => {
    console.log('✅ MongoDB Connected');
    
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        
        if (existingAdmin) {
            console.log('❌ Admin already exists!');
            console.log('📝 Username: admin');
            console.log('🔑 Password: Use existing password');
            process.exit(0);
        }
        
        // Create new admin
        const hashedPassword = await bcrypt.hash('admin@123', 10);
        const admin = new Admin({
            username: 'admin',
            password: hashedPassword
        });
        
        await admin.save();
        console.log('✅ Admin created successfully!');
        console.log('📝 Username: admin');
        console.log('🔑 Password: admin@123');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
    }
})
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});