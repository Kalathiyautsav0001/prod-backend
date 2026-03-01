const mongoose = require('mongoose');

const decorationItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Flowers', 'Lighting', 'Furniture', 'Backdrops', 'Table Settings', 'Props', 'Other']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    priceType: {
        type: String,
        required: true,
        enum: ['per item', 'per set', 'per hour', 'per day']
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DecorationItem', decorationItemSchema);