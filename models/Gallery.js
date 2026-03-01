const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    mediaUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
            'Weddings', 'Engagement', 'Sangeet', 'Haldi',
            'Corporate', 'Corporate Gala', 'Team Building', 'Product Launch', 'Award Ceremony',
            'Birthday', 'Sweet 16', 'First Birthday',
            'Baby Shower', 'Gender Reveal', 'Naming Ceremony',
            'Anniversary',
            'Festival', 'Diwali', 'Holi', 'Christmas', 'New Year', 'Eid',
            'Navratri', 'Ganesh Chaturthi', 'Durga Puja', 'Ramadan',
            'Raksha Bandhan', 'Lohri', 'Pongal', 'Onam', 'Baisakhi',
            'Gudi Padwa', 'Ugadi', 'Makar Sankranti', 'Rath Yatra',
            'Janmashtami', 'Maha Shivratri'
        ],
        required: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Gallery', gallerySchema);