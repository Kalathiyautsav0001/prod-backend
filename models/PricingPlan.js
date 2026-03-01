const mongoose = require('mongoose');

const pricingPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Plan name is required'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Wedding', 'Corporate', 'Birthday', 'Baby Shower', 'Festival']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    duration: {
        type: String,
        required: [true, 'Duration is required'],
    },
    guests: {
        type: String,
        required: [true, 'Guest count is required'],
    },
    features: {
        type: [String],
        required: [true, 'Features are required'],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0 && v.every(f => f && f.trim() !== '');
            },
            message: 'At least one valid feature is required'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    popular: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // This will add createdAt and updatedAt automatically
});

// Remove any pre-save hooks if they exist
// If you have a pre-save hook, comment it out or remove it completely

module.exports = mongoose.model('PricingPlan', pricingPlanSchema);