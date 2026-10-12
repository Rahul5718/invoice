const userStr = localStorage.getItem('invoicely_user');

// If not logged in, immediately redirect to login page
if (!userStr) {
  window.location.replace('/login.html');
}

const currentUser = JSON.parse(userStr || '{}');
const currentUserId = currentUser.id || currentUser._id;

// Update profile on page load
document.addEventListener('DOMContentLoaded', () => {
  const profileNameEl = document.querySelector('.profile-name');
  const profileRoleEl = document.querySelector('.profile-role');

  if (profileNameEl && currentUser.name) {
    profileNameEl.textContent = currentUser.name;
  }
  if (profileRoleEl && currentUser.businessName) {
    profileRoleEl.textContent = currentUser.businessName;
  }

  // Load invoices and metrics
  fetchInvoices();
  fetchMetrics();
});

// Sign Out handler
function logout() {
  localStorage.removeItem('invoicely_token');
  localStorage.removeItem('invoicely_user');
  window.location.replace('/login.html');
}

let currentInvoices = [];

// Initialize default date to 14 days from now
document.addEventListener('DOMContentLoaded', () => {
  const dueInput = document.getElementById('dueDate');
  const d = new Date();
  d.setDate(d.getDate() + 14);
  dueInput.value = d.toISOString().split('T')[0];

  fetchInvoices();
  fetchMetrics();
});

// Event Listeners
document.getElementById('btn-add-item').addEventListener('click', addItemRow);
document.getElementById('invoice-form').addEventListener('submit', handleCreateInvoice);
document.getElementById('status-filter').addEventListener('change', (e) => {
  fetchInvoices(e.target.value);
});

// Add new line item row
function addItemRow() {
  const container = document.getElementById('items-container');
  const row = document.createElement('div');
  row.className = 'item-row';
  row.innerHTML = `
    <input type="text" class="item-desc" placeholder="Service description" required>
    <input type="number" class="item-qty" placeholder="Qty" min="1" value="1" required>
    <input type="number" class="item-price" placeholder="Price ($)" min="0" step="0.01" value="100" required>
    <button type="button" class="btn-remove-item" onclick="removeItemRow(this)">&times;</button>
  `;
  container.appendChild(row);
}

// Remove line item row
function removeItemRow(btn) {
  const rows = document.querySelectorAll('.item-row');
  if (rows.length > 1) {
    btn.parentElement.remove();
  } else {
    alert('An invoice must contain at least one line item.');
  }
}

// Create Invoice
async function handleCreateInvoice(e) {
  e.preventDefault();

  const itemRows = document.querySelectorAll('.item-row');
  const items = Array.from(itemRows).map(row => ({
    description: row.querySelector('.item-desc').value,
    quantity: parseFloat(row.querySelector('.item-qty').value),
    unitPrice: parseFloat(row.querySelector('.item-price').value)
  }));

  const payload = {
     userId: currentUserId,
     clientName: document.getElementById('clientName').value,
     clientEmail: document.getElementById('clientEmail').value,
     dueDate: document.getElementById('dueDate').value,
     taxPercent: parseFloat(document.getElementById('taxPercent').value) || 0,
     notes: document.getElementById('notes').value,
     items
  };

  try {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Failed to create invoice');

    document.getElementById('invoice-form').reset();
    fetchInvoices();
    fetchMetrics();
  } catch (err) {
    alert(err.message);
  }
}

// Fetch invoices from backend
async function fetchInvoices(status = '') {
  try {
    let url = `/api/invoices?userId=${encodeURIComponent(currentUserId)}`;
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }

    const res = await fetch(url);
    currentInvoices = await res.json();
    renderTable(currentInvoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
  }
}

// Fetch metrics summary
async function fetchMetrics() {
 try {
    const res = await fetch(`/api/invoices/metrics?userId=${encodeURIComponent(currentUserId)}`);
    const data = await res.json();

    document.getElementById('metric-count').textContent = data.totalCount;
    document.getElementById('metric-paid').textContent = `$${data.totalRevenue.toFixed(2)}`;
    document.getElementById('metric-pending').textContent = `$${data.pendingRevenue.toFixed(2)}`;
    document.getElementById('metric-overdue').textContent = data.overdueCount;
  } catch (err) {
    console.error('Error fetching metrics:', err);
  }
}

// Render Table
function renderTable(invoices) {
  const tbody = document.getElementById('invoice-tbody');
  tbody.innerHTML = '';

  if (invoices.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No invoices found.</td></tr>';
    return;
  }

  invoices.forEach(inv => {
    const isOverdue = new Date(inv.dueDate) < new Date() && inv.status !== 'Paid';
    const displayStatus = isOverdue && inv.status !== 'Paid' ? 'Overdue' : inv.status;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${inv.invoiceNumber}</strong></td>
      <td>${inv.clientName}<br><small style="color:#64748b;">${inv.clientEmail}</small></td>
      <td>${new Date(inv.dueDate).toLocaleDateString()}</td>
      <td><strong>$${inv.totalAmount.toFixed(2)}</strong></td>
      <td><span class="badge badge-${displayStatus}">${displayStatus}</span></td>
      <td>
        <button class="btn btn-secondary" onclick="viewInvoice('${inv._id}')">View</button>
        ${inv.status !== 'Paid' ? `<button class="btn btn-primary" onclick="updateStatus('${inv._id}', 'Paid')">Mark Paid</button>` : ''}
        <button class="btn btn-danger" onclick="deleteInvoice('${inv._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Update Status
async function updateStatus(id, newStatus) {
  try {
    await fetch(`/api/invoices/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchInvoices();
    fetchMetrics();
  } catch (err) {
    alert('Error updating status');
  }
}

// Delete Invoice
async function deleteInvoice(id) {
  if (!confirm('Are you sure you want to delete this invoice?')) return;
  try {
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    fetchInvoices();
    fetchMetrics();
  } catch (err) {
    alert('Error deleting invoice');
  }
}

// View & Printable Invoice Modal
function viewInvoice(id) {
  const inv = currentInvoices.find(i => i._id === id);
  if (!inv) return;

  document.getElementById('modal-invoice-num').textContent = inv.invoiceNumber;
  const modalBody = document.getElementById('modal-body');
  
  modalBody.innerHTML = `
    <div style="margin-bottom: 20px;">
      <p><strong>Billed To:</strong> ${inv.clientName} (${inv.clientEmail})</p>
      <p><strong>Issue Date:</strong> ${new Date(inv.issueDate).toLocaleDateString()}</p>
      <p><strong>Due Date:</strong> ${new Date(inv.dueDate).toLocaleDateString()}</p>
      <p><strong>Status:</strong> ${inv.status}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="border-bottom: 2px solid #ccc; text-align: left;">
          <th style="padding: 6px 0;">Item</th>
          <th style="padding: 6px 0;">Qty</th>
          <th style="padding: 6px 0;">Price</th>
          <th style="padding: 6px 0;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${inv.items.map(item => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0;">${item.description}</td>
            <td style="padding: 6px 0;">${item.quantity}</td>
            <td style="padding: 6px 0;">$${item.unitPrice.toFixed(2)}</td>             <td style="padding: 6px 0;">$${item.amount.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="text-align: right; margin-bottom: 20px;">
      <p>Subtotal: $${inv.subtotal.toFixed(2)}</p>
      <p>Tax (${inv.taxPercent}%): $${((inv.subtotal * inv.taxPercent) / 100).toFixed(2)}</p>
      <p style="font-size: 1.2rem; font-weight: bold;">Grand Total: $${inv.totalAmount.toFixed(2)}</p>
    </div>

    ${inv.notes ? `<div><strong>Notes:</strong><p style="color:#64748b;">${inv.notes}</p></div>` : ''}
  `;

  document.getElementById('invoice-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('invoice-modal').style.display = 'none';
}
