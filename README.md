# Invoicely — Freelance Invoice Generator & Payment Tracker

A full-stack financial workflow tool designed for independent contractors, freelancers, and small agencies to create itemized invoices, monitor cashflow health, and track real-time payment states with strict user data isolation.

---

## 🔗 Project Links

- **Live Deployment:** [https://your-deployment-link.com](https://your-deployment-link.com)
- **Video Walkthrough:** [Demo Video Link (Loom / YouTube)](https://your-video-link.com)
- **Repository:** [https://github.com/your-username/invoice-tracker](https://github.com/your-username/invoice-tracker)

---

## 📌 Features

- **Multi-Tenant User Isolation:** Every user (e.g., Raj vs. Riya) has an independent billing workspace. Database queries, metrics, and invoices are strictly scoped by `userId`.
- **Itemized Financial Calculations:** Dynamic subtotal, proportional tax rate evaluation, and total calculations with custom remittance instructions.
- **Aging & Status Lifecycles:** Real-time categorization across `Draft`, `Sent`, `Paid`, and dynamic `Overdue` states.
- **Client-Side Print & PDF Engine:** Styled via CSS print media queries (`@media print`) to generate invoices directly from the browser without server overhead.
- **Secure Authentication:** User credential persistence with salted one-way hashing via `bcryptjs`.

---

## 🛠 Tech Stack

- **Runtime & Server:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Security & Auth:** bcryptjs, CORS
- **Frontend:** Vanilla HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid, Print Styles), JavaScript (ES6+ Fetch API)

---

## 🏛 System Architecture & Design



### Engineering Trade-Offs & Limitations

1. **Browser Print vs. Server-Side PDF Generation (Puppeteer):**
   * *Problem:* Server-side headless browsers consume 100MB+ RAM per render instance and create CPU bottlenecks under simultaneous requests.
   * *Mitigation:* Offloaded compilation to client-side CSS media queries (`@media print`), enabling zero-cost PDF generation and print dialogues directly on the user's browser engine.
2. **Dynamic Overdue Calculations:**
   * *Problem:* Running scheduled cron jobs every minute to update the status of expired invoices adds unnecessary database writes.
   * *Mitigation:* The system computes overdue status dynamically during read time by comparing `dueDate` against `Date.now()`, ensuring accurate status evaluation without background worker overhead.

---

## 🔌 API Endpoints

### Authentication Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registers a new user account with hashed password |
| `POST` | `/api/auth/login` | Validates credentials and returns session user payload |

### Invoice Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/invoices?userId={id}` | Returns all invoices owned by the specified user |
| `GET` | `/api/invoices/metrics?userId={id}` | Calculates revenue, pending balances, and overdue count |
| `POST` | `/api/invoices` | Creates a new invoice associated with the user |
| `PATCH` | `/api/invoices/:id/status` | Updates invoice lifecycle status (`Sent`, `Paid`, `Draft`) |
| `DELETE`| `/api/invoices/:id` | Permanently deletes an invoice record |

---

## 🚀 Local Setup & Installation

Follow these steps to run the project locally on your machine:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI

### 2. Clone the Repository
```bash
git clone [https://github.com/your-username/invoice-tracker.git](https://github.com/your-username/invoice-tracker.git)
cd invoice-tracker

## Install Dependencies 

``bash
npm install
```

### start application 
```bash
npm start
```
or 

```bash
node server.js
```

### Steps to Commit and Push to GitHub

Run the following commands in your project root terminal to push your documentation to GitHub:

```bash
git add README.md
git commit -m "docs: add comprehensive README with architecture and setup guide"
git push origin main