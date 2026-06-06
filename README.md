# 🧾 Receiptly — AI-Powered Receipt Scanner

> Scan, analyze, and organize your receipts with AI-powered precision.

👉 **Live Demo**: [receipt-tracker-blush-ten.vercel.app](https://receipt-tracker-blush-ten.vercel.app)

---

## ✨ Features

- 📄 Drag & drop PDF receipt upload
- 🤖 AI extraction of merchant, items, and prices
- 🗂️ Receipt dashboard with AI summaries
- 🔐 Secure authentication with Clerk
- ⚡ Background processing with Inngest

## 🛠️ Tech Stack

Next.js · Convex · Clerk · Inngest · OpenAI · Schematic · Tailwind CSS · Vercel

---

## 🚀 Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/receipt-tracker.git
cd receipt-tracker
pnpm install
cp .env.example .env.local  # fill in your keys
npx convex dev
pnpm dev
```

## 🔑 Environment Variables

```env
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
CONVEX_DEPLOY_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=
OPENAI_API_KEY=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
NEXT_PUBLIC_SCHEMATIC_KEY=
SCHEMATIC_API_KEY=
```

## 🔄 How It Works

1. User uploads a PDF receipt
2. File is stored in Convex
3. Inngest job extracts text with pdf2json
4. OpenAI analyzes and extracts structured data
5. Data is displayed in the dashboard

---

Built with ❤️ using Next.js, Convex, Clerk, Inngest, and OpenAI.