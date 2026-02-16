# BuitenZijn App - Project Plan

## Overview

A web application for our VZW (non-profit organization) built with:
- **Frontend**: Next.js 14+ (App Router) + TypeScript
- **Backend**: Convex (serverless backend)
- **Authentication**: Convex Auth
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 18+

---

## 🎨 House Style Configuration

### Brand Colors

```ts
// src/styles/theme.ts

export const colors = {
  // ==========================================
  // PRIMARY COLORS
  // ==========================================
  
  // Green - Main primary color
  green: {
    50: '#edf7ed',
    100: '#d4edd3',
    200: '#b0dfae',
    300: '#8ad088',
    400: '#6bc468',
    500: '#4EB54A',  // Main green
    600: '#45a342',
    700: '#3a8f39',
    800: '#2f7a2f',
    900: '#1f5c1f',
  },
  
  // Blue - Main primary color
  blue: {
    50: '#e8f1f9',
    100: '#c5dbef',
    200: '#9fc4e4',
    300: '#78acd9',
    400: '#5a9ad0',
    500: '#186DB7',  // Main blue
    600: '#1562a5',
    700: '#115490',
    800: '#0d467a',
    900: '#083459',
  },

  // ==========================================
  // COMPLEMENTARY COLORS
  // ==========================================
  
  // Orange - Complement to green
  orange: {
    50: '#fdf3e8',
    100: '#fadfc5',
    200: '#f5c89e',
    300: '#f0b076',
    400: '#eb9c54',
    500: '#E07A1F',  // Main orange
    600: '#c96e1c',
    700: '#af5f18',
    800: '#945014',
    900: '#6e3b0f',
  },
  
  // Rust Red - Complement to blue
  rust: {
    50: '#f9e8ea',
    100: '#efc5c9',
    200: '#e49da4',
    300: '#d8747e',
    400: '#cf5562',
    500: '#B71D2E',  // Main rust red
    600: '#a51a29',
    700: '#901624',
    800: '#7a131e',
    900: '#5c0e17',
  },

  // ==========================================
  // ANALOGOUS COLORS
  // ==========================================
  
  // Light Teal - Pairs with green
  teal: {
    50: '#e9f9f5',
    100: '#c8f0e5',
    200: '#a3e5d3',
    300: '#7ddac1',
    400: '#60d1b2',
    500: '#48C4A3',  // Main teal
    600: '#40b093',
    700: '#379a80',
    800: '#2e836d',
    900: '#226352',
  },
  
  // Soft Purple - Pairs with blue
  purple: {
    50: '#efedf9',
    100: '#d6d1ef',
    200: '#bab2e4',
    300: '#9e93d9',
    400: '#887bd0',
    500: '#6955C6',  // Main purple
    600: '#5f4db2',
    700: '#52429c',
    800: '#453885',
    900: '#332a64',
  },

  // ==========================================
  // NEUTRAL TONES
  // ==========================================
  
  // Light Beige - Background/neutral
  beige: {
    50: '#fdfcfa',
    100: '#FAF9F4',
    200: '#F5F3E8',  // Main beige
    300: '#ebe8d9',
    400: '#dfdbc8',
    500: '#d2cdb7',
    600: '#b8b39f',
    700: '#9a9684',
    800: '#7a776a',
    900: '#5a574f',
  },
  
  // Warm Gray - Neutral for balance
  gray: {
    50: '#f7f7f7',
    100: '#ededed',
    200: '#dfdfdf',
    300: '#cccccc',
    400: '#A8A8A8',  // Main warm gray
    500: '#8f8f8f',
    600: '#6e6e6e',
    700: '#545454',
    800: '#3a3a3a',
    900: '#212121',
  },

  // ==========================================
  // ACCENT COLORS
  // ==========================================
  
  // Golden Yellow - Adds vibrancy
  yellow: {
    50: '#fef9e6',
    100: '#fcf0bf',
    200: '#fae794',
    300: '#f7dd69',
    400: '#f5d548',
    500: '#F1C40F',  // Main golden yellow
    600: '#d9b00e',
    700: '#be9a0c',
    800: '#a1830a',
    900: '#776107',
  },
  
  // Deep Navy - Darker shade for contrast
  navy: {
    50: '#e6edf2',
    100: '#c1d2de',
    200: '#97b4c8',
    300: '#6d96b2',
    400: '#4d7fa1',
    500: '#2d688f',
    600: '#1e5777',
    700: '#144663',
    800: '#0B3954',  // Main deep navy
    900: '#072839',
  },

  // ==========================================
  // SEMANTIC COLORS
  // ==========================================
  
  success: '#4EB54A',   // Using brand green
  warning: '#F1C40F',   // Using golden yellow
  error: '#B71D2E',     // Using rust red
  info: '#186DB7',      // Using brand blue
};
```

### Typography

```ts
// src/styles/typography.ts

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    heading: ['Poppins', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

### Spacing & Layout

```ts
// src/styles/spacing.ts

export const spacing = {
  // Base spacing scale
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  
  // Container max-widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
};
```

---

## 🗄️ Database Schema Configuration

### User Table

```ts
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (extends auth users)
  users: defineTable({
    // Identity
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    
    // Profile
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    
    // Organization
    role: v.union(v.literal("admin"), v.literal("guest"), v.literal("other")),
    isActive: v.boolean(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Email verification tokens
  emailVerificationTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  // Password reset tokens
  passwordResetTokens: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"]),

  // Sessions (if managing manually)
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  // -----------------------------------------
  // ADD YOUR FUTURE TABLES BELOW
  // -----------------------------------------
  
  // Example: Activities table
  // activities: defineTable({
  //   title: v.string(),
  //   description: v.string(),
  //   date: v.number(),
  //   location: v.optional(v.string()),
  //   createdBy: v.id("users"),
  //   createdAt: v.number(),
  // })
  //   .index("by_date", ["date"])
  //   .index("by_creator", ["createdBy"]),

  // Example: Members table
  // members: defineTable({
  //   userId: v.id("users"),
  //   membershipType: v.string(),
  //   joinedAt: v.number(),
  //   expiresAt: v.optional(v.number()),
  // })
  //   .index("by_user", ["userId"]),
});
```

---

## 🔐 Authentication Features

### Required Features

- [x] **Login** - Email/password authentication
- [x] **Register** - New user signup
- [x] **Email Verification** - Verify email after registration
- [x] **Password Reset** - Forgot password flow
- [ ] **Remember Me** - Persistent sessions
- [ ] **Social Login** (optional) - Google, Microsoft, etc.

### Auth Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email/password login form |
| Register | `/register` | New account registration |
| Forgot Password | `/forgot-password` | Request password reset email |
| Reset Password | `/reset-password/:token` | Set new password |
| Verify Email | `/verify-email/:token` | Email verification handler |

### Protected Routes

```ts
// src/routes/protected.tsx

const protectedRoutes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/profile', component: Profile },
  { path: '/settings', component: Settings },
  // Add more protected routes here
];

const adminRoutes = [
  { path: '/admin', component: AdminDashboard },
  { path: '/admin/users', component: UserManagement },
  // Add more admin routes here
];
```

---

## 📁 Project Structure

```
BuitenZijnApp/
├── convex/                    # Convex backend
│   ├── _generated/            # Auto-generated files
│   ├── schema.ts              # Database schema
│   ├── auth.ts                # Authentication functions
│   ├── users.ts               # User-related functions
│   └── ...                    # Other backend functions
│
├── app/                       # Next.js App Router
│   ├── (auth)/                # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── verify-email/
│   │       └── page.tsx
│   ├── (dashboard)/           # Protected route group
│   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   ├── page.tsx           # Dashboard home
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   ├── providers.tsx          # Convex & auth providers
│   └── globals.css            # Global styles
│
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── auth/                  # Auth components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   └── AuthGuard.tsx
│   └── layout/                # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│   │
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts
│   └── ...
│
├── lib/                       # Utility functions
│   ├── utils.ts
│   └── validators.ts
│
├── styles/                    # House style configuration
│   ├── theme.ts               # Colors, shadows
│   ├── typography.ts          # Fonts, sizes
│   └── spacing.ts             # Spacing, layout
│
├── public/
│   ├── favicon.ico
│   └── logo.svg
│
├── .env.local                 # Environment variables
├── convex.json                # Convex configuration
├── package.json
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind with house style
├── tsconfig.json
└── README.md
```

---

## ⚙️ Environment Configuration

### Required Environment Variables

```env
# .env.local

# Convex
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# App
NEXT_PUBLIC_APP_NAME=BuitenZijn
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (for password reset, verification)
# Configure in Convex dashboard or use a service like Resend
```

---

## 🚀 Getting Started

### 1. Initialize Project

```bash
# Create Next.js project with TypeScript
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false

# Install Convex
npm install convex

# Install UI dependencies
npm install @headlessui/react @heroicons/react

# Initialize Convex (creates convex/ folder)
npx convex dev
```

### 2. Set Up Convex Provider

```tsx
// app/providers.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

### 3. Configure Convex Auth

Follow the [Convex Auth documentation](https://docs.convex.dev/auth) to set up authentication.

### 4. Set Up Tailwind with House Style

Update `tailwind.config.ts` to use your house style colors and fonts.

---

## 📋 Development Phases

### Phase 1: Foundation ✅ (Current)
- [ ] Project setup (Next.js + TypeScript)
- [ ] Convex backend initialization
- [ ] Tailwind CSS with house style
- [ ] Base UI components

### Phase 2: Authentication
- [ ] User registration
- [ ] Login/logout
- [ ] Email verification
- [ ] Password reset flow
- [ ] Protected routes

### Phase 3: Core App Shell
- [ ] Dashboard layout
- [ ] Navigation/sidebar
- [ ] User profile page
- [ ] Settings page

### Phase 4: Feature Development
- [ ] *Add your features here*
- [ ] ...
- [ ] ...

---

## 📝 Notes & Decisions

### Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | Next.js 14+ | SSR, App Router, built-in routing |
| Backend | Convex | Real-time, serverless, easy to use |
| Auth | Convex Auth | Integrated with backend |
| Styling | Tailwind CSS | Utility-first, customizable |
| Runtime | Node.js 18+ | Required for Next.js |

### Future Considerations

- [ ] PWA support for mobile
- [ ] Internationalization (Dutch/French/English)
- [ ] Dark mode toggle
- [ ] Accessibility (WCAG 2.1 AA)

---

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [Convex + Next.js Guide](https://docs.convex.dev/client/react/nextjs)
- [Convex Auth Guide](https://docs.convex.dev/auth)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/)

---

*Last updated: January 2026*
