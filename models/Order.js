const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  deliveryMethod: { type: String, enum: ['Livraison', 'Ramassage'], required: true },
  deliveryAddress: { type: String },
  deliveryDate: { type: String, required: true },
  deliveryTime: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  note: String,
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // ← optionnel
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);