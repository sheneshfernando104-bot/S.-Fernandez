# S. Fernandez | Modern Web Design & Development

> **"Websites built exactly the way you imagine them."**

A complete, ultra-modern, responsive website and interactive project booking platform built for **S. Fernandez Web Design & Development**.

Featuring an ambient live motion video hero, 8 interactive service offerings, a filterable portfolio showcase with case studies, transparent 3-tier pricing, customer reviews, FAQ accordions, and a **9-Step Interactive Website Builder & Booking Engine** with real-time price estimation, draft auto-saving, calendar slot blocking, and a password-protected admin portal.

---

## 🌟 Key Features

1. **Ambient Motion Video Hero**:
   - Modern digital loop with fallback canvas & glowing orbs.
   - Interactive playback controls (Play/Pause, Sound toggle, Live status pill).
   - Live availability badge: *"Accepting 2 new client projects this month"*.
   - Fast metrics display (45+ sites launched, 99.4% satisfaction, 100/100 speed).

2. **8 Tailored Service Offerings**:
   - High-Converting Landing Page (from $5)
   - Portfolio Website (from $10)
   - Blog / Publication (from $15)
   - Business Website (from $20)
   - Restaurant / Cafe Website (from $25)
   - Booking & Appointment Website (from $30)
   - E-commerce Store (from $40)
   - Custom Web Application (from $55, up to $70)
   - *"Configure This Type"* one-click buttons that jump straight to the interactive builder with that type preselected!

3. **Filterable Portfolio Showcase**:
   - Categories: All, E-Commerce, Business & Dining, Bookings, SaaS/Web Apps.
   - Interactive Quick-View modal with project overview, tech stack, and key metrics.

4. **Transparent 3-Tier Pricing ($5 to $70)**:
   - Basic Launch ($5 – $18)
   - Growth Business ($20 – $42) — *Most Popular*
   - Premium & Store ($45 – $70) — *Max Cap $70*

5. **The Main Feature: 9-Step Interactive Website Builder**:
   - **Progress Bar & Live Price Estimator**: Updates dynamic investment range in real time as the client toggles features, pages, urgency, and content options.
   - **Auto-Save Drafts**: Automatically saves progress to `localStorage` so nothing is lost if the page refreshes.
   - **Step 1: Website Type** (8+ selectable visual cards).
   - **Step 2: Purpose & Audience** (Business name, goals, target audience, existing site).
   - **Step 3: Design Preferences** (6 aesthetic styles, color palette picker with presets and custom hex pickers, typography direction, inspiration URLs).
   - **Step 4: Features Needed** (12 multi-select feature cards with live pricing impact).
   - **Step 5: Pages Needed** (8 standard pages + dynamic custom page tag manager).
   - **Step 6: Content & Extras** (Logo design, copywriting, photography sourcing, domain/hosting setup).
   - **Step 7: Budget & Timeline** (Budget tier dropdown, delivery urgency).
   - **Step 8: Book a Consultation** (Interactive calendar date picker, time slot chips, **auto-blocking already-booked slots**, contact details, preferred platform).
   - **Step 9: Review & Summary** (Recap card with "Edit" buttons per section, cost breakdown, Confirm Booking button).
   - **Post-Submission Celebration**: Confetti explosion, unique booking reference ID (`SF-YYYY-XXXX`), pre-filled WhatsApp direct message, and `.ics` calendar invite download!

6. **Password-Protected Admin Portal (`admin.html` / `/admin`)**:
   - Passcode protection (Default: `sfernandez2025`).
   - Summary statistics (Total Bookings, New Inquiries, In Progress, Completed, Total Pipeline Value in $).
   - Filter by status (New, Contacted, In Progress, Completed, Cancelled) and live text search.
   - Detailed modal inspector for each client's 9-step answers.
   - Inline status updates saved to backend.
   - Private admin notes field saved per booking.
   - **Manual Slot Blocker**: Tool to block out specific dates/times for holidays or external clients.
   - **Export to CSV & JSON Backup** with one click.

7. **Extra Polish**:
   - Dark mode & Light mode toggle with instant theme persistence.
   - Floating WhatsApp contact button with direct chat link (`+39 351 082 3322`).
   - Mobile-first responsive layout with slide-over drawer navigation.
   - SEO metadata, Open Graph cards, Twitter cards, and custom SVG favicon.

---

## 🚀 Quick Start (Running Locally)

### Option 1: Python REST API Server (Recommended)
This serves the frontend files AND provides a live REST API for saving bookings and blocking booked time slots in `data/bookings.json`:

```bash
python server.py
```

Then open your browser to:
- **Public Website:** [http://localhost:3000](http://localhost:3000)
- **Admin Portal:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html) (or [http://localhost:3000/admin](http://localhost:3000/admin))

### Option 2: Direct Static Browser Preview
You can also open `index.html` directly in any web browser or use VS Code's "Live Server" extension. The app will automatically use browser `localStorage` as an offline storage engine, meaning the builder, booking system, slot blocker, and admin portal will all work seamlessly without a server!

---

## 🔐 Admin Portal Credentials

- **URL:** `/admin.html` (or `/admin` when running on server / Vercel / Netlify)
- **Default Security Passcode:** `sfernandez2025`

*(You can change this passcode in `js/admin.js` by editing `const ADMIN_PASSCODE = 'your_new_passcode';` or by defining `window.ADMIN_PASSCODE`)*.

---

## 📧 Email Notifications Setup

When a client confirms their booking, the application can automatically send the entire project specification and booking time to **seneshf60@gmail.com**.

### Option A: Formspree (Easiest - 1 Minute Setup)
1. Go to [https://formspree.io](https://formspree.io) and create a free account.
2. Create a new form pointing to `seneshf60@gmail.com`.
3. In `index.html`, right before `</body>`, add your Formspree endpoint:
   ```html
   <script>
     window.FORMSPREE_ENDPOINT = 'https://formspree.io/f/your_form_id';
   </script>
   ```
4. Now, every submission will be automatically emailed to you instantly!

### Option B: EmailJS
1. Register at [https://www.emailjs.com](https://www.emailjs.com).
2. Set up your email service and template with variables: `{{businessName}}`, `{{type}}`, `{{consultationDate}}`, `{{clientEmail}}`.
3. Call `emailjs.send(...)` inside `sendEmailNotification()` in `js/builder.js`.

---

## 🌐 Deployment Guide

### Deploying to Vercel (1 Click)
The project includes a ready-to-use `vercel.json` file.
1. Push this folder to a GitHub repository or drag-and-drop into [Vercel](https://vercel.com).
2. Vercel automatically deploys it as a fast global edge application.
3. Access your live site at `https://your-site.vercel.app` and admin at `https://your-site.vercel.app/admin`.

### Deploying to Netlify
The project includes a `netlify.toml` file.
1. Drag and drop the folder into the [Netlify Drop](https://app.netlify.com/drop) dashboard.
2. Your website is instantly live with free SSL!

---

## 🛠️ Project Structure

```
├── index.html          # Public website (Hero with video, Services, Portfolio, Pricing, Builder)
├── admin.html          # Password-protected Admin Portal & CRM
├── server.py           # Lightweight Python REST API server (serves frontend + /api endpoints)
├── css/
│   └── styles.css      # Custom styles, glassmorphism, animations, theme tokens
├── js/
│   ├── app.js          # Navigation, theme toggle, video controls, portfolio, FAQ
│   ├── builder.js      # 9-step website builder, live price calculator, calendar slot blocker
│   ├── admin.js        # Admin dashboard authentication, status updater, CSV export
│   └── storage.js      # Unified storage engine (REST API + LocalStorage fallback)
├── data/
│   └── bookings.json   # Seeded persistent bookings database
├── vercel.json         # Vercel deployment configuration
├── netlify.toml        # Netlify deployment configuration
└── README.md           # Documentation & setup guide
```

---

## 📞 Business & Contact Information

- **Brand:** S. Fernandez
- **Tagline:** *"Websites built exactly the way you imagine them"*
- **Email:** [seneshf60@gmail.com](mailto:seneshf60@gmail.com)
- **Phone / WhatsApp:** [+39 351 082 3322](https://wa.me/393510823322)
- **Base Pricing:** Starting from $5 (Min $5, Max $70 USD)
- **Location:** Milan, Italy (Serving international clients worldwide)
