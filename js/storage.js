/**
 * S. Fernandez Web Design & Development
 * Unified Storage Service (API + LocalStorage Fallback)
 */

const STORAGE_KEY = 'sf_web_bookings';
const PREFS_KEY = 'sf_builder_draft';
const THEME_KEY = 'sf_theme_preference';

// Default initial bookings if none exist in localStorage
const DEFAULT_SEED_BOOKINGS = [
  {
    id: "SF-2026-1042",
    createdAt: "2026-10-25T14:30:00.000Z",
    status: "In Progress",
    type: "E-commerce Store",
    businessName: "Gelato & Co. Milano",
    purpose: "Launch artisanal gelato gift boxes and local delivery orders across Lombardy",
    targetAudience: "Food lovers, corporate gifting, tourists in Milan",
    existingWebsite: "",
    design: {
      style: "Luxury Elegant",
      primaryColor: "#0F172A",
      secondaryColor: "#F59E0B",
      fontStyle: "Classic Serif",
      inspiration: "https://santambroeus.com"
    },
    features: [
      "Contact Form",
      "Online Payments / Stripe Checkout",
      "Image / Project Gallery",
      "Multi-language Support",
      "Advanced SEO Setup & Audit"
    ],
    pages: ["Home", "About", "Shop", "Menu", "Contact", "Corporate Gifting"],
    content: {
      logo: "Already have a logo",
      copywriting: "Need copywriting assistance",
      images: "Have own photography",
      hosting: "Need help setting up hosting & domain"
    },
    budget: "$35 – $55",
    timeline: "Fast Track (1 – 2 weeks)",
    consultation: {
      date: "2026-10-30",
      time: "14:00",
      timeLabel: "02:00 PM CET",
      clientName: "Marco Rossi",
      clientEmail: "marco.rossi@gelatomilano.it",
      clientPhone: "+39 340 123 4567",
      contactMethod: "WhatsApp Call",
      notes: "Want to ensure high speed mobile checkout with Apple Pay."
    },
    estimatedPrice: "$50 – $65",
    adminNotes: "Client deposit received. Color palette and typography approved."
  },
  {
    id: "SF-2026-1048",
    createdAt: "2026-10-27T09:15:00.000Z",
    status: "New",
    type: "Booking & Appointment Website",
    businessName: "Studio Benessere Zen",
    purpose: "Automate client appointments and massage bookings online",
    targetAudience: "Wellness clients, busy professionals seeking relaxation",
    existingWebsite: "",
    design: {
      style: "Minimalist Clean",
      primaryColor: "#064E3B",
      secondaryColor: "#10B981",
      fontStyle: "Modern Sans",
      inspiration: "https://calm.com"
    },
    features: [
      "Contact Form",
      "Online Booking & Scheduling Calendar",
      "Online Payments",
      "Custom Smooth Animations"
    ],
    pages: ["Home", "About", "Services", "Pricing", "Contact"],
    content: {
      logo: "Need custom logo designed",
      copywriting: "I will provide my own text",
      images: "Please source professional stock images",
      hosting: "Already have hosting/domain"
    },
    budget: "$15 – $35",
    timeline: "Standard (2 – 4 weeks)",
    consultation: {
      date: "2026-10-31",
      time: "11:00",
      timeLabel: "11:00 AM CET",
      clientName: "Elena Bianchi",
      clientEmail: "elena.bianchi@studiozen.it",
      clientPhone: "+39 348 987 6543",
      contactMethod: "Google Meet",
      notes: "Need Google Calendar two-way synchronization."
    },
    estimatedPrice: "$35 – $48",
    adminNotes: "Sent meeting link invite. Reviewing service pricing tiers."
  },
  {
    id: "SF-2026-1033",
    createdAt: "2026-10-18T16:20:00.000Z",
    status: "Completed",
    type: "High-Converting Landing Page",
    businessName: "FitPulse Coaching",
    purpose: "Promote 90-day transformation cohort with direct WhatsApp intake",
    targetAudience: "Athletes and fitness enthusiasts aged 22-40",
    existingWebsite: "",
    design: {
      style: "Bold & Vibrant",
      primaryColor: "#111827",
      secondaryColor: "#F97316",
      fontStyle: "Futuristic Tech",
      inspiration: "https://gymshark.com"
    },
    features: [
      "Contact Form",
      "Custom Smooth Animations",
      "Advanced SEO Setup & Audit"
    ],
    pages: ["Home", "Transformation Stories", "Apply Now"],
    content: {
      logo: "Already have a logo",
      copywriting: "I will provide my own text",
      images: "Have own photography",
      hosting: "Already have hosting/domain"
    },
    budget: "$5 – $15",
    timeline: "ASAP / Rush (Under 1 week)",
    consultation: {
      date: "2026-10-20",
      time: "16:00",
      timeLabel: "04:00 PM CET",
      clientName: "Luca Marini",
      clientEmail: "luca.fitness@fitpulse.eu",
      clientPhone: "+39 339 555 1212",
      contactMethod: "WhatsApp Call",
      notes: "Website went live in 4 days! Conversion rate jumped 40%."
    },
    estimatedPrice: "$8 – $15",
    adminNotes: "Project launched successfully. 5-star Google review received."
  }
];

const StorageService = {
  // Check if API server is reachable
  async hasApi() {
    try {
      const res = await fetch('/api/slots?date=test', { method: 'GET', headers: { 'Accept': 'application/json' } });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // Get all bookings
  async getBookings() {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          // Mirror to localStorage as cache
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (e) {
      console.warn('API unavailable, falling back to LocalStorage:', e);
    }

    // Fallback to localStorage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (err) {
        console.error('Failed to parse localStorage bookings', err);
      }
    }
    // Initialize with seed data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_BOOKINGS));
    return DEFAULT_SEED_BOOKINGS;
  },

  // Save new booking
  async saveBooking(bookingData) {
    // Generate unique ID and metadata if needed
    if (!bookingData.id) {
      const year = new Date().getFullYear();
      const code = Math.floor(1000 + Math.random() * 9000);
      bookingData.id = `SF-${year}-${code}`;
    }
    if (!bookingData.createdAt) {
      bookingData.createdAt = new Date().toISOString();
    }
    if (!bookingData.status) {
      bookingData.status = 'New';
    }

    // Try API first
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        const json = await res.json();
        // Also update local cache
        const all = await this.getBookings();
        return json.booking || bookingData;
      } else if (res.status === 409) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'This slot is already booked.');
      }
    } catch (e) {
      if (e.message && e.message.includes('already booked')) {
        throw e;
      }
      console.warn('Saving to local storage as fallback:', e);
    }

    // LocalStorage fallback
    const all = await this.getBookings();
    
    // Check if slot is already booked locally
    const reqDate = bookingData.consultation?.date;
    const reqTime = bookingData.consultation?.time;
    if (reqDate && reqTime) {
      const conflict = all.find(b => 
        b.consultation?.date === reqDate && 
        b.consultation?.time === reqTime && 
        b.status !== 'Cancelled'
      );
      if (conflict) {
        throw new Error(`The slot on ${reqDate} at ${reqTime} is already booked. Please choose another.`);
      }
    }

    all.unshift(bookingData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return bookingData;
  },

  // Update booking status or notes
  async updateBooking(id, updates) {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (res.ok) {
        return true;
      }
    } catch (e) {
      console.warn('API update failed, updating localStorage:', e);
    }

    // LocalStorage update
    const all = await this.getBookings();
    const idx = all.findIndex(b => b.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return true;
    }
    return false;
  },

  // Delete booking
  async deleteBooking(id) {
    try {
      const res = await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        return true;
      }
    } catch (e) {
      console.warn('API delete failed, updating localStorage:', e);
    }

    const all = await this.getBookings();
    const filtered = all.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Get booked slots for a given date
  async getBookedSlots(dateStr) {
    try {
      const res = await fetch(`/api/slots?date=${encodeURIComponent(dateStr)}`);
      if (res.ok) {
        const json = await res.json();
        return json.bookedSlots || [];
      }
    } catch (e) {
      // Fallback
    }

    const all = await this.getBookings();
    return all
      .filter(b => b.consultation?.date === dateStr && b.status !== 'Cancelled')
      .map(b => b.consultation?.time)
      .filter(Boolean);
  },

  // Builder draft persistence
  saveDraft(draftData) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(draftData));
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  },

  getDraft() {
    try {
      const item = localStorage.getItem(PREFS_KEY);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },

  clearDraft() {
    localStorage.removeItem(PREFS_KEY);
  },

  // Theme preference
  getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark'; // Default to sleek dark mode
  },

  setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }
};

window.StorageService = StorageService;
