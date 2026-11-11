# AI Budget Buddy 💰 | Modern Fintech Dashboard

AI Budget Buddy is an AI-powered personal finance management dashboard designed for students and young professionals. It connects with users' PayPal Sandbox Business accounts, retrieves transaction history through the PayPal Transaction Search API, stores transactions in MongoDB, synchronizes transactions automatically every day, and empowers users to understand their income, expenses, budgets, and spending habits through algorithmic AI insights.

---

## 🎨 Visual Identity & Design System

The application closely recreates the modern SaaS fintech design language:
- **Primary Dark Blue**: `#00308A` (Header branding, active titles, and prominent cards)
- **Secondary Blue**: `#0079C1` (Primary buttons, key indicators, active nav items)
- **Accent Blue**: `#009CDE` (Glows, highlight badges, and status pills)
- **Background**: `#F4F8FC` (Soft light blue-tinted page background)
- **Subtle Borders**: `#DCE7F1` (Card outlines, dividers, and table borders)
- **Muted Text**: `#64748B` (Secondary descriptions and subtitles)
- **Layout**: Desktop-first layout optimized for a 1440px viewport, fully responsive across tablet and mobile devices with collapsible navigation.

---

## 📱 Navigation & Pages

### 1. Main Navigation
- **Persistent Sidebar Navigation** (Desktop 1440px) & **Mobile Drawer**:
  - `Dashboard`: Monthly financial overview, donut chart, budget card, largest expense, recent activity.
  - `Transactions`: Full searchable, filterable, and paginated transaction history with live category editing.
  - `Categories`: Breakdown of all 11 categories with spending totals, progress bars, and uncategorized detector.
  - `Analytics`: Cash flow bar charts, expense distribution donut, savings rate, and merchant leaderboard.
  - `Budgets`: Monthly budget target editor and category-wise spending limit trackers.
  - `AI Insights`: Algorithmic spending summaries, budget limits, savings tips, and "Ask AI Buddy" assistant.
  - `PayPal Sandbox`: OAuth connection management, AES-256-GCM encryption status, auto-sync toggle, and manual sync.
- **Top Navigation Bar**:
  - Month Selector (`< Previous Month`, `Month Year`, `Next Month >`).
  - **Ask AI Buddy** quick entry button.
  - **Sync Now** action button with spinner.
  - **Notifications Popover** with real-time audit alerts.
  - **Active User Switcher** ("Alex Johnson - User 1" vs "Morgan Smith - User 2") to test multi-user isolation.

---

## 🚀 Key Dashboard Features

### 1. Monthly Financial Overview (6 Summary Cards)
- **Total Income**: Sum of qualifying positive incoming credits ($).
- **Total Expenses**: Sum of outgoing debits ($).
- **Net Cash Flow**: Total Income minus Total Expenses (with surplus/deficit pill).
- **Transactions**: Total count of records indexed in MongoDB.
- **Monthly Budget**: Current target limit with direct inline edit trigger.
- **Remaining Budget**: Allowance left with remaining percentage.

### 2. Monthly Budget Progress Card
- Total monthly budget target.
- Total amount spent.
- Remaining budget.
- Dynamic color-coded progress bar:
  - 🔵 Blue: Healthy spending pace (<80%).
  - 🟡 Amber: Caution warning (80% - 100%).
  - 🔴 Red: Over-budget alert (>100%).

### 3. Expense Breakdown Donut Chart (Recharts)
- Interactive SVG Donut chart displaying categorized expenses from MongoDB.
- Center displays total monthly expenses.
- Interactive hover tooltips with exact amounts.
- Category legend displaying percentage and monetary values.

### 4. Largest Expense Card
- Dynamically highlights the user's highest spending category.
- Shows category icon, transaction count, dollar amount, and percentage of total expenses.

### 5. Recent Transactions & Manual Categorization
- Displays recent transactions with merchant name, date, amount, currency, and status.
- Interactive category dropdown allows instant re-classification into:
  - `Uncategorized`, `Food & Dining`, `Shopping`, `Travel`, `Entertainment`, `Bills & Utilities`, `Education`, `Health`, `Income`, `Transfers`, `Other`.
- Calls `PATCH /api/transactions/:id/category` and flags `categorySource: "manual"` to preserve user classifications during future PayPal syncs.

### 6. AI-Powered Financial Insights & "Ask AI Buddy"
- Dynamic financial observations derived directly from actual MongoDB transactions:
  - Top spending category alert.
  - Budget pacing warning.
  - Actionable savings recommendation (e.g. 15% reduction savings estimate).
- Interactive conversational modal responding to queries like:
  - *"Where did I spend the most this month?"*
  - *"How much did I spend on food & dining?"*
  - *"Am I on track with my monthly budget?"*
  - *"Give me 3 smart tips to reduce spending."*

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React 19, Recharts, Lucide React, Tailwind CSS v4, Vite.
- **Backend**: Node.js, Express.js (ES Modules).
- **Database**: MongoDB Atlas with Mongoose (with zero-config in-memory fallback for local dev).
- **Security**: AES-256-GCM credential encryption (`crypto`), Helmet security headers, CORS restrictions, rate limiting.
- **Scheduler**: `node-cron` running daily at 2:00 AM (Asia/Kolkata).

---

## 🏃 Getting Started

### 1. Start Backend & Frontend

**Backend (Port 5000):**
```bash
npm run server
```

**Frontend (Port 5173):**
```bash
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

### 2. Run Automated Verification Tests
```bash
npm run test:backend
```
Executes all 10 automated test scenarios (AES-256-GCM encryption, database storage, categorization, user isolation, duplicate prevention, and stats aggregation).

---

## 🧪 Manual Testing Instructions

1. **Dashboard Overview**: Open [http://localhost:5173](http://localhost:5173). Observe the 6 financial cards, donut chart, budget progress bar, largest expense card, and recent transactions.
2. **Seed Sample Data**: Click *"Seed Sample Data"* in the Transactions tab or in empty states to populate 5 sample transactions into MongoDB.
3. **Manual Categorization**: In any transaction row, change the category dropdown (e.g., change *"Blue Bottle Coffee"* to *"Food & Dining"*). Observe the inline loader and green checkmark.
4. **Edit Budget Target**: Click the pencil icon on the Monthly Budget card or navigate to the *Budgets* tab. Change the target (e.g. to $2,500) and observe the progress bar and remaining budget update immediately.
5. **Ask AI Buddy**: Click the **"Ask AI Buddy"** button in the top navigation or on the AI Insights card. Choose a suggested prompt like *"Where did I spend the most this month?"* and receive a real-time calculated response.
6. **Multi-User Data Isolation**: In the top navigation, switch the user dropdown from *Alex (User 1)* to *Morgan (User 2)*. Notice that Morgan's dashboard and transactions are completely isolated from Alex's data.
7. **PayPal Sandbox Connection**: Open the *PayPal Sandbox* tab to view encrypted credentials status, auto-sync settings, or trigger a manual sync via the *Sync Now* action.
