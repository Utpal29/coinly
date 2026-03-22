# Coinly — Personal Finance Tracker

Coinly is a premium personal finance tracking app that helps you manage income and expenses with a beautiful dark UI, real-time insights, and instant feedback on every action.

## Features

- **Home Landing Page** — Public-facing page with feature overview and call-to-action
- **Dashboard** — Stat cards (balance, income, expenses) with sparklines, infinite scroll transaction list, search & filter
- **Optimistic UI** — Add, edit, and delete transactions with instant feedback; changes appear immediately and roll back automatically on failure
- **Insights** — Pie chart (spending by category), bar chart (monthly income vs expenses), line chart (balance over time), ranked top 5 expenses
- **Calendar View** — Browse transactions by month with day-level income/expense summaries
- **Profile** — Update display name, currency preference, change password, delete account
- **Authentication** — Email/password and Google OAuth via Supabase Auth
- **Responsive** — Mobile-first layout with FAB, hover-reveal actions on desktop
- **Premium Dark UI** — Glassmorphism cards, aurora mesh backgrounds, gold + cyan accents, shimmer skeletons

## Tech Stack

- **React 19** + **Vite 6**
- **TypeScript** (strict mode)
- **Tailwind CSS 3**
- **shadcn/ui** (Radix UI primitives)
- **Chart.js** + react-chartjs-2
- **Supabase** (Auth + Postgres)
- **Sonner** (toast notifications)

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/Utpal29/coinly.git
   cd coinly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page (guests) / redirect to dashboard (logged in) |
| `/login` | Sign in with email or Google |
| `/signup` | Create a new account |
| `/dashboard` | Financial overview + transaction list |
| `/add-transaction` | Add a new transaction |
| `/edit-transaction/:id` | Edit an existing transaction |
| `/insights` | Charts and spending analytics |
| `/calendar` | Monthly calendar view |
| `/profile` | Account settings |

## Author

**Utpal Prajapati**
- Portfolio: [utpal.netlify.app](https://utpal.netlify.app)
- GitHub: [@Utpal29](https://github.com/Utpal29)

---

Made with ❤️ by Utpal Prajapati
