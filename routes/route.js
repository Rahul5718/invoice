const express  = require('express')

const router = express.Router()

const authController = require('../controller/auth')
const invoiceController = require('../controller/invoice')

router.post('/register',authController.register)
router.post('/login',authController.login)

router.get('/invoices',invoiceController.getAllInvoices)
router.get('/invoices/metrics',invoiceController.getInvoiceMetrics)

router.post('/invoices',invoiceController.createInvoice)
router.patch('/invoices/:id/status',invoiceController.updateInvoiceStatus)

router.delete('/invoices/:id',invoiceController.deleteInvoice)

module.exports = router