const Invoice = require('../models/invoice');

// Helper: Calculate Totals
function calculateTotals(items, taxPercent = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = (subtotal * taxPercent) / 100;
  const totalAmount = subtotal + tax;
  return { subtotal, totalAmount };
}

// 1. GET all invoices (with optional status filter)
exports.getAllInvoices = async (req, res) => {
  try {
     const { userId , status } = req.query;
     if (!userId) {
       return res.status(400).json({ error: 'User ID is required to fetch invoices.' });
     }
     const filter = {userId};
     if (status) filter.status = status;
     const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
     res.json(invoices);
   } catch (err) {
     res.status(500).json({ error: 'Failed to retrieve invoices', details: err.message });
   }
};

// 2. GET invoice metrics / dashboard summary
exports.getInvoiceMetrics = async (req, res) => {
  try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required to fetch metrics.' });
      }
      const invoices = await Invoice.find({ userId });
  
      let totalRevenue = 0;
      let pendingRevenue = 0;
      let overdueCount = 0;
  
      invoices.forEach(inv => {
        if (inv.status === 'Paid') {
          totalRevenue += inv.totalAmount;
        } else {
          pendingRevenue += inv.totalAmount;
          if (new Date(inv.dueDate) < new Date() && inv.status !== 'Paid') {
            overdueCount++;
          }
        }
      });
  
      res.json({
        totalCount: invoices.length,
        totalRevenue,
        pendingRevenue,
        overdueCount
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to calculate metrics', details: err.message });
    }
};

// 3. POST create invoice
exports.createInvoice = async (req, res) => {
   try {
      const { userId, clientName, clientEmail, dueDate, items, taxPercent, notes } = req.body;
  
      if (!userId) {
        return res.status(400).json({ error: 'Unauthorized: User ID missing.' });
      }
      
      if (!clientName || !clientEmail || !dueDate || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required invoice fields' });
      }
  
      // Process line items
      const parsedItems = items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        amount: Number(item.quantity) * Number(item.unitPrice)
      }));
  
      const parsedTax = Number(taxPercent) || 0;
      const { subtotal, totalAmount } = calculateTotals(parsedItems, parsedTax);
  
      // Generate unique invoice number: INV-YEAR-TIMESTAMP
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  
      const newInvoice = new Invoice({
        userId,
        invoiceNumber,
        clientName,
        clientEmail,
        dueDate,
        items: parsedItems,
        taxPercent: parsedTax,
        subtotal,
        totalAmount,
        notes,
        status: 'Sent'
      });
  
      const saved = await newInvoice.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create invoice', details: err.message });
    }
};

// 4. PATCH update invoice status
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Draft', 'Sent', 'Paid', 'Overdue'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid invoice status' });
    }

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Invoice not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
};

// 5. DELETE invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete invoice', details: err.message });
  }
};