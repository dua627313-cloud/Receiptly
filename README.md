# 🧾 Receiptly — AI-Powered Receipt Scanner

Scan, analyze, and organize your receipts with AI-powered precision.

🌐 **Live Demo:** https://receipt-tracker-blush-ten.vercel.app

## ✨ Features

- 📄 Drag & drop PDF receipt upload
- 🤖 AI-powered extraction of merchant, items, dates, and prices
- 🗂️ Receipt dashboard with organized expense history
- 🔐 Secure authentication with Clerk
- ⚡ Background processing with Inngest
- 📱 Responsive user interface

## 🛠️ Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Convex
- Clerk
- Inngest
- OpenAI API
- Schematic
- Vercel

## 🚀 Getting Started

```bash
git clone https://github.com/dua627313-cloud/Receiptly.git
cd Receiptly

pnpm install

cp .env.example .env.local

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

1. User uploads a receipt.
2. The file is securely stored.
3. Background processing extracts receipt text.
4. OpenAI analyzes the receipt and returns structured information.
5. Receipt details are saved and displayed in the dashboard.

## 🤖 How OpenAI Models Were Used

During development of Receiptly, OpenAI tools were used to accelerate development and improve the project.

### GPT-5.6
- Brainstormed application architecture and feature ideas.
- Helped refine prompts for accurate receipt data extraction.
- Assisted with debugging application logic and improving code quality.
- Suggested UI improvements and documentation.

### Codex
- Assisted with generating boilerplate code.
- Helped debug Next.js and TypeScript issues.
- Suggested improvements for API integration and project structure.
- Accelerated implementation of application features.

The project design, implementation, testing, and final integration were completed by the project author.

## ❤️ Built for OpenAI Build Week

Receiptly demonstrates how AI can simplify everyday expense management by converting paper receipts into organized, searchable digital records using modern web technologies and OpenAI models.
