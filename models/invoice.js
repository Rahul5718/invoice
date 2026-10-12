const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true }
});

const InvoiceSchema = new mongoose.Schema({

     userId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
          index:true
     },
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Paid', 'Overdue'], 
    default: 'Draft' 
  },
  items: [ItemSchema],
  taxPercent: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  notes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', InvoiceSchema);