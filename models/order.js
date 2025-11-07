const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the order
const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the 'User' model
        required: true
    },
    items: [{
        product: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

// Virtual method to calculate total amount dynamically
orderSchema.virtual('calculatedTotalAmount').get(function() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Pre-save middleware to ensure totalAmount is always correct
orderSchema.pre('save', function(next) {
    this.totalAmount = this.calculatedTotalAmount;
    next();
});

// Create and export the model
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
