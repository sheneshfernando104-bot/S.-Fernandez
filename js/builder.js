/**
 * S. Fernandez Web Design & Development
 * Interactive Multi-Step Website Builder & Booking Engine
 */

(function () {
  'use strict';

  // Builder State Object
  const defaultState = {
    step: 1,
    type: 'Business Website',
    typePrice: 20,
    purpose: '',
    targetAudience: '',
    businessName: '',
    existingWebsite: '',
    design: {
      style: 'Minimalist Clean',
      primaryColor: '#0A2540',
      secondaryColor: '#F97316',
      fontStyle: 'Modern Sans',
      inspiration: ''
    },
    features: ['Contact Form', 'SEO Setup & Audit'],
    pages: ['Home', 'About', 'Services', 'Contact'],
    customPages: [],
    content: {
      logo: 'I already have a logo',
      copywriting: 'I will provide my own text',
      images: 'I will provide photos',
      hosting: 'I have my own domain & hosting'
    },
    budget: '$15 – $35',
    timeline: '1 – 2 Weeks',
    consultation: {
      date: '',
      time: '',
      timeLabel: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      contactMethod: 'WhatsApp Call',
      notes: ''
    }
  };

  let state = { ...defaultState };

  // Feature Catalog with Pricing (Scaled to $5 - $70 budget range)
  const FEATURE_CATALOG = [
    { id: 'Contact Form', label: 'Contact Form', desc: 'Custom inquiry form with email notifications', price: 0, icon: 'mail' },
    { id: 'Online Payments', label: 'Online Payments', desc: 'Stripe, PayPal, Apple Pay integration', price: 10, icon: 'credit-card' },
    { id: 'User Login', label: 'User Login / Auth', desc: 'Member portals, client accounts, protected areas', price: 10, icon: 'users' },
    { id: 'Blog', label: 'Blog / CMS', desc: 'Easy-to-use content management system', price: 6, icon: 'book-open' },
    { id: 'Image Gallery', label: 'Image / Project Gallery', desc: 'Interactive lightbox, filters & grid showcases', price: 4, icon: 'image' },
    { id: 'Live Chat', label: 'Live Chat Integration', desc: 'WhatsApp or Tidio live chat bubble', price: 3, icon: 'message-square' },
    { id: 'Multi-language', label: 'Multi-Language (i18n)', desc: 'Bilingual / multilingual switcher', price: 6, icon: 'globe' },
    { id: 'SEO Setup & Audit', label: 'SEO Setup & Speed Audit', desc: 'Schema markup, meta tags, 95+ PageSpeed', price: 5, icon: 'search' },
    { id: 'Custom Animations', label: 'Custom Smooth Animations', desc: 'Scroll reveals, micro-interactions, 3D feels', price: 4, icon: 'sparkles' },
    { id: 'Booking Calendar', label: 'Booking & Scheduling', desc: 'Calendar appointment picker & sync', price: 8, icon: 'calendar' },
    { id: 'Admin Dashboard', label: 'Admin Dashboard', desc: 'Manage submissions, leads & metrics', price: 12, icon: 'layout-dashboard' },
    { id: 'Social Media Feeds', label: 'Social Media Feeds', desc: 'Instagram, LinkedIn & TikTok feeds', price: 3, icon: 'share-2' }
  ];

  // Website Type Base Pricing (Minimum $5, strictly within $5 - $70)
  const TYPE_PRICING = {
    'Landing Page': 5,
    'Portfolio Website': 10,
    'Blog / Publication': 15,
    'Business Website': 20,
    'Restaurant / Cafe': 25,
    'Booking Website': 30,
    'E-commerce Store': 40,
    'Custom Web App': 55,
    'Other': 15
  };

  // Calendar State
  let currentCalDate = new Date();
  // Ensure calendar shows current year/month
  currentCalDate.setDate(1);

  // Initialize Builder
  function initBuilder() {
    loadSavedDraft();
    bindEvents();
    renderStep(state.step);
    updatePriceEstimate();
  }

  // Save to LocalStorage on every step change
  function saveDraft() {
    window.StorageService.saveDraft(state);
    const draftNotice = document.getElementById('draft-saved-indicator');
    if (draftNotice) {
      draftNotice.classList.remove('opacity-0');
      setTimeout(() => draftNotice.classList.add('opacity-0'), 2000);
    }
  }

  // Restore saved draft
  function loadSavedDraft() {
    const saved = window.StorageService.getDraft();
    if (saved) {
      state = { ...defaultState, ...saved };
      const resumeBanner = document.getElementById('resume-draft-banner');
      if (resumeBanner) resumeBanner.classList.remove('hidden');
    }
  }

  // Reset draft
  window.resetBuilderDraft = function () {
    window.StorageService.clearDraft();
    state = JSON.parse(JSON.stringify(defaultState));
    const resumeBanner = document.getElementById('resume-draft-banner');
    if (resumeBanner) resumeBanner.classList.add('hidden');
    renderStep(1);
    updatePriceEstimate();
    showToast('Builder form has been reset to defaults.', 'info');
  };

  // Calculate dynamic live estimated price (Strictly Min $5, Max $70)
  function calculatePrice() {
    let base = TYPE_PRICING[state.type] || 20;

    // Feature add-ons
    let featuresTotal = 0;
    state.features.forEach(f => {
      const match = FEATURE_CATALOG.find(item => item.id === f);
      if (match) featuresTotal += match.price;
    });

    // Page count additions (5 pages included in base; extra pages are +$2 each)
    const totalPages = state.pages.length + state.customPages.length;
    let extraPages = Math.max(0, totalPages - 5) * 2;

    // Content extras
    let extrasTotal = 0;
    if (state.content.logo.includes('custom logo')) extrasTotal += 5;
    if (state.content.copywriting.includes('copywriting')) extrasTotal += 6;
    if (state.content.images.includes('stock')) extrasTotal += 3;
    if (state.content.hosting.includes('assistance')) extrasTotal += 4;

    // Subtotal
    let subtotal = base + featuresTotal + extraPages + extrasTotal;

    // Timeline rush fee (small proportional fee capped within $70)
    if (state.timeline.includes('ASAP')) {
      subtotal = Math.round(subtotal * 1.15);
    }

    // Min & Max range (Enforcing strictly Minimum $5 and Maximum $70)
    let minPrice = Math.max(5, Math.min(65, Math.round(subtotal * 0.9)));
    let maxPrice = Math.min(70, Math.max(minPrice + 3, Math.round(subtotal * 1.1)));

    // Ensure within $5 and $70 bounds
    if (minPrice < 5) minPrice = 5;
    if (maxPrice > 70) maxPrice = 70;
    if (minPrice > maxPrice) minPrice = maxPrice - 2;

    return { min: minPrice, max: maxPrice, exact: Math.min(70, Math.max(5, subtotal)) };
  }

  // Update live estimate badges across the UI
  function updatePriceEstimate() {
    const { min, max } = calculatePrice();
    const priceBadges = document.querySelectorAll('.live-price-display');
    priceBadges.forEach(el => {
      el.textContent = `$${min} – $${max}`;
    });
  }

  // Render specific step
  function renderStep(stepNumber) {
    state.step = stepNumber;
    saveDraft();

    // Update Progress Bar
    const percent = Math.round((stepNumber / 9) * 100);
    const progressFill = document.getElementById('builder-progress-fill');
    const stepLabel = document.getElementById('builder-step-label');
    const percentLabel = document.getElementById('builder-percent-label');

    if (progressFill) progressFill.style.width = `${percent}%`;
    if (stepLabel) stepLabel.textContent = `Step ${stepNumber} of 9`;
    if (percentLabel) percentLabel.textContent = `${percent}% Completed`;

    // Highlight Step Dots in header
    for (let i = 1; i <= 9; i++) {
      const dot = document.getElementById(`step-indicator-dot-${i}`);
      if (dot) {
        if (i < stepNumber) {
          dot.className = 'w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold transition-all';
          dot.innerHTML = '✓';
        } else if (i === stepNumber) {
          dot.className = 'w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-orange-500/20 transition-all';
          dot.textContent = i;
        } else {
          dot.className = 'w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-medium transition-all';
          dot.textContent = i;
        }
      }
    }

    // Show only active step container
    for (let i = 1; i <= 9; i++) {
      const container = document.getElementById(`builder-step-${i}`);
      if (container) {
        if (i === stepNumber) {
          container.classList.remove('hidden');
          container.classList.add('step-slide-in');
        } else {
          container.classList.add('hidden');
          container.classList.remove('step-slide-in');
        }
      }
    }

    // Populate step content
    if (stepNumber === 1) renderStep1();
    if (stepNumber === 2) renderStep2();
    if (stepNumber === 3) renderStep3();
    if (stepNumber === 4) renderStep4();
    if (stepNumber === 5) renderStep5();
    if (stepNumber === 6) renderStep6();
    if (stepNumber === 7) renderStep7();
    if (stepNumber === 8) renderStep8();
    if (stepNumber === 9) renderStep9();

    // Reinitialize icons if Lucide is loaded
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Step 1: Website Type
  function renderStep1() {
    const cards = document.querySelectorAll('.website-type-card');
    cards.forEach(card => {
      const type = card.dataset.type;
      if (type === state.type) {
        card.classList.add('border-orange-500', 'bg-orange-500/10', 'ring-2', 'ring-orange-500');
        card.classList.remove('border-slate-200', 'dark:border-slate-800');
      } else {
        card.classList.remove('border-orange-500', 'bg-orange-500/10', 'ring-2', 'ring-orange-500');
        card.classList.add('border-slate-200', 'dark:border-slate-800');
      }
    });
  }

  // Step 2: Purpose & Audience
  function renderStep2() {
    const nameInput = document.getElementById('input-business-name');
    const purposeInput = document.getElementById('input-website-purpose');
    const audienceInput = document.getElementById('input-target-audience');
    const urlInput = document.getElementById('input-existing-website');

    if (nameInput) nameInput.value = state.businessName || '';
    if (purposeInput) purposeInput.value = state.purpose || '';
    if (audienceInput) audienceInput.value = state.targetAudience || '';
    if (urlInput) urlInput.value = state.existingWebsite || '';
  }

  // Step 3: Design Preferences
  function renderStep3() {
    // Style cards
    const styleCards = document.querySelectorAll('.design-style-card');
    styleCards.forEach(card => {
      if (card.dataset.style === state.design.style) {
        card.classList.add('border-orange-500', 'bg-orange-500/10', 'ring-2', 'ring-orange-500');
      } else {
        card.classList.remove('border-orange-500', 'bg-orange-500/10', 'ring-2', 'ring-orange-500');
      }
    });

    // Font cards
    const fontCards = document.querySelectorAll('.font-style-card');
    fontCards.forEach(card => {
      if (card.dataset.font === state.design.fontStyle) {
        card.classList.add('border-orange-500', 'bg-orange-500/10', 'ring-2', 'ring-orange-500');
      } else {
        card.classList.remove('border-orange-500', 'bg-orange-500/10', 'ring-2', 'ring-orange-500');
      }
    });

    // Color Pickers
    const primaryPicker = document.getElementById('input-primary-color');
    const secondaryPicker = document.getElementById('input-secondary-color');
    const primaryHex = document.getElementById('label-primary-color');
    const secondaryHex = document.getElementById('label-secondary-color');
    const previewBox = document.getElementById('palette-preview-box');

    if (primaryPicker) primaryPicker.value = state.design.primaryColor;
    if (secondaryPicker) secondaryPicker.value = state.design.secondaryColor;
    if (primaryHex) primaryHex.textContent = state.design.primaryColor;
    if (secondaryHex) secondaryHex.textContent = state.design.secondaryColor;

    if (previewBox) {
      previewBox.style.background = `linear-gradient(135deg, ${state.design.primaryColor} 0%, ${state.design.secondaryColor} 100%)`;
    }

    const inspirationInput = document.getElementById('input-inspiration-links');
    if (inspirationInput) inspirationInput.value = state.design.inspiration || '';
  }

  // Step 4: Features Needed
  function renderStep4() {
    const container = document.getElementById('features-selection-grid');
    if (!container) return;

    container.innerHTML = FEATURE_CATALOG.map(f => {
      const isSelected = state.features.includes(f.id);
      return `
        <div data-feature="${f.id}" class="feature-card cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
          isSelected
            ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/50'
            : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 hover:border-slate-400 dark:hover:border-slate-700'
        }">
          <div class="mt-0.5 p-2 rounded-lg ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">
            <i data-lucide="${f.icon}" class="w-5 h-5"></i>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-sm ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'}">${f.label}</h4>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full ${f.price === 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}">
                ${f.price === 0 ? 'Included' : `+$${f.price}`}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${f.desc}</p>
          </div>
          <div class="w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 dark:border-slate-700'}">
            ${isSelected ? '✓' : ''}
          </div>
        </div>
      `;
    }).join('');

    // Feature card click listener
    container.querySelectorAll('.feature-card').forEach(el => {
      el.addEventListener('click', () => {
        const featId = el.dataset.feature;
        if (state.features.includes(featId)) {
          state.features = state.features.filter(x => x !== featId);
        } else {
          state.features.push(featId);
        }
        renderStep4();
        updatePriceEstimate();
      });
    });
  }

  // Step 5: Pages Needed
  function renderStep5() {
    const defaultPages = ['Home', 'About', 'Services', 'Portfolio', 'Blog', 'Shop', 'Contact', 'FAQ'];
    const standardGrid = document.getElementById('standard-pages-grid');
    const customList = document.getElementById('custom-pages-list');
    const totalCountEl = document.getElementById('total-pages-count');

    if (standardGrid) {
      standardGrid.innerHTML = defaultPages.map(page => {
        const isSelected = state.pages.includes(page);
        return `
          <button type="button" data-page="${page}" class="page-select-btn px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
            isSelected
              ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/40'
              : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-slate-400'
          }">
            <span>${page}</span>
            <span class="text-xs font-bold">${isSelected ? '✓' : '+'}</span>
          </button>
        `;
      }).join('');

      standardGrid.querySelectorAll('.page-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = btn.dataset.page;
          if (state.pages.includes(p)) {
            state.pages = state.pages.filter(x => x !== p);
          } else {
            state.pages.push(p);
          }
          renderStep5();
          updatePriceEstimate();
        });
      });
    }

    if (customList) {
      if (state.customPages.length === 0) {
        customList.innerHTML = `<span class="text-xs text-slate-400 italic">No custom pages added yet. Type below and click Add.</span>`;
      } else {
        customList.innerHTML = state.customPages.map((cp, idx) => `
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold border border-orange-500/30">
            ${cp}
            <button type="button" class="remove-custom-page-btn text-orange-400 hover:text-orange-600" data-idx="${idx}">×</button>
          </span>
        `).join('');

        customList.querySelectorAll('.remove-custom-page-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            state.customPages.splice(idx, 1);
            renderStep5();
            updatePriceEstimate();
          });
        });
      }
    }

    const total = state.pages.length + state.customPages.length;
    if (totalCountEl) totalCountEl.textContent = `${total} Pages Selected`;
  }

  // Step 6: Content & Extras
  function renderStep6() {
    const radioGroups = ['logo', 'copywriting', 'images', 'hosting'];
    radioGroups.forEach(group => {
      const inputs = document.querySelectorAll(`input[name="content-${group}"]`);
      inputs.forEach(input => {
        if (input.value === state.content[group]) {
          input.checked = true;
          input.closest('.content-option-card')?.classList.add('border-orange-500', 'bg-orange-500/10');
        } else {
          input.checked = false;
          input.closest('.content-option-card')?.classList.remove('border-orange-500', 'bg-orange-500/10');
        }
      });
    });
  }

  // Step 7: Budget & Timeline
  function renderStep7() {
    const budgetSelect = document.getElementById('select-budget-range');
    if (budgetSelect) budgetSelect.value = state.budget;

    const timelineCards = document.querySelectorAll('.timeline-option-card');
    timelineCards.forEach(card => {
      if (card.dataset.timeline === state.timeline) {
        card.classList.add('border-orange-500', 'bg-orange-500/10', 'ring-2', 'ring-orange-500');
      } else {
        card.classList.remove('border-orange-500', 'bg-orange-500/10', 'ring-2', 'ring-orange-500');
      }
    });
  }

  // Step 8: Book a Consultation
  async function renderStep8() {
    // Populate client contact fields
    const nameInput = document.getElementById('input-client-name');
    const emailInput = document.getElementById('input-client-email');
    const phoneInput = document.getElementById('input-client-phone');
    const methodSelect = document.getElementById('select-contact-method');
    const notesInput = document.getElementById('input-client-notes');

    if (nameInput) nameInput.value = state.consultation.clientName || '';
    if (emailInput) emailInput.value = state.consultation.clientEmail || '';
    if (phoneInput) phoneInput.value = state.consultation.clientPhone || '';
    if (methodSelect) methodSelect.value = state.consultation.contactMethod || 'WhatsApp Call';
    if (notesInput) notesInput.value = state.consultation.notes || '';

    // Render calendar view
    renderCalendar();
  }

  // Render Calendar Grid
  async function renderCalendar() {
    const monthYearEl = document.getElementById('calendar-month-year');
    const daysGrid = document.getElementById('calendar-days-grid');
    if (!daysGrid) return;

    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (monthYearEl) {
      monthYearEl.textContent = `${monthNames[month]} ${year}`;
    }

    // Days in current month
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Align Monday as first column (0 = Mon, ..., 6 = Sun)
    const startOffset = (firstDayIndex + 6) % 7;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = '';

    // Empty lead cells
    for (let i = 0; i < startOffset; i++) {
      html += `<div class="aspect-square"></div>`;
    }

    // Month days
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);

      const isPast = cellDate < today;
      const isSunday = cellDate.getDay() === 0;
      const isDisabled = isPast || isSunday;

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = state.consultation.date === dateStr;

      html += `
        <button type="button" 
          data-date="${dateStr}" 
          class="cal-day-btn text-sm ${isSelected ? 'selected' : ''} ${isDisabled ? 'text-slate-300 dark:text-slate-700' : 'text-slate-800 dark:text-slate-200 bg-white/30 dark:bg-slate-800/40'}"
          ${isDisabled ? 'disabled' : ''}>
          <span>${day}</span>
        </button>
      `;
    }

    daysGrid.innerHTML = html;

    // Attach click events
    daysGrid.querySelectorAll('.cal-day-btn:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', async () => {
        state.consultation.date = btn.dataset.date;
        state.consultation.time = ''; // Reset selected slot
        renderCalendar();
        await renderTimeSlots(state.consultation.date);
      });
    });

    // If a date is already selected, render its slots
    if (state.consultation.date) {
      await renderTimeSlots(state.consultation.date);
    } else {
      const slotsContainer = document.getElementById('time-slots-container');
      if (slotsContainer) {
        slotsContainer.innerHTML = `<div class="text-sm text-slate-500 dark:text-slate-400 italic py-6 text-center">Please select a consultation date from the calendar to view available time slots.</div>`;
      }
    }
  }

  // Render Time Slots for selected date & block already-booked slots
  async function renderTimeSlots(dateStr) {
    const slotsContainer = document.getElementById('time-slots-container');
    const selectedDateLabel = document.getElementById('selected-date-preview-label');
    if (!slotsContainer) return;

    if (selectedDateLabel) {
      const d = new Date(dateStr);
      selectedDateLabel.textContent = `Slots for: ${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    // Default time slots (CET / Italian timezone)
    const standardSlots = [
      { time: '09:30', label: '09:30 AM CET' },
      { time: '11:00', label: '11:00 AM CET' },
      { time: '14:00', label: '02:00 PM CET' },
      { time: '15:30', label: '03:30 PM CET' },
      { time: '17:00', label: '05:00 PM CET' },
      { time: '18:30', label: '06:30 PM CET' }
    ];

    // Fetch already booked slots for this date
    slotsContainer.innerHTML = `<div class="py-4 text-center text-xs text-slate-400">Checking slot availability...</div>`;
    const bookedSlots = await window.StorageService.getBookedSlots(dateStr);

    slotsContainer.innerHTML = standardSlots.map(slot => {
      const isBooked = bookedSlots.includes(slot.time);
      const isSelected = state.consultation.time === slot.time;

      return `
        <button type="button" 
          data-time="${slot.time}" 
          data-label="${slot.label}"
          class="time-slot-chip cursor-pointer ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : 'bg-white/50 dark:bg-slate-800/40'}"
          ${isBooked ? 'disabled' : ''}>
          <span>${slot.label}</span>
        </button>
      `;
    }).join('');

    slotsContainer.querySelectorAll('.time-slot-chip:not(.booked)').forEach(btn => {
      btn.addEventListener('click', () => {
        state.consultation.time = btn.dataset.time;
        state.consultation.timeLabel = btn.dataset.label;
        renderTimeSlots(dateStr);
      });
    });
  }

  // Step 9: Review & Summary
  function renderStep9() {
    const summaryContainer = document.getElementById('summary-recap-content');
    if (!summaryContainer) return;

    const { min, max } = calculatePrice();
    const allPages = [...state.pages, ...state.customPages];

    summaryContainer.innerHTML = `
      <!-- Website Type & Brand -->
      <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 relative">
        <button type="button" class="btn-jump-step absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20" data-jump="1">Edit</button>
        <div class="flex items-center gap-2 mb-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <h4 class="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">1. Project & Brand</h4>
        </div>
        <p class="font-extrabold text-lg text-slate-900 dark:text-white">${state.businessName || 'Unnamed Project'}</p>
        <p class="text-sm font-medium text-orange-600 dark:text-orange-400 mt-0.5">${state.type}</p>
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div><span class="font-semibold text-slate-400">Purpose:</span> ${state.purpose || 'Not specified'}</div>
          <div><span class="font-semibold text-slate-400">Audience:</span> ${state.targetAudience || 'Not specified'}</div>
        </div>
      </div>

      <!-- Design Preferences -->
      <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 relative">
        <button type="button" class="btn-jump-step absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20" data-jump="3">Edit</button>
        <div class="flex items-center gap-2 mb-2">
          <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <h4 class="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">2. Design & Aesthetics</h4>
        </div>
        <div class="flex items-center gap-4 flex-wrap">
          <span class="text-sm font-semibold">${state.design.style} Style</span>
          <span class="text-sm text-slate-400">•</span>
          <span class="text-sm font-semibold">${state.design.fontStyle}</span>
          <div class="flex items-center gap-2 ml-auto">
            <span class="text-xs text-slate-400">Palette:</span>
            <span class="w-6 h-6 rounded-full border shadow-sm" style="background-color: ${state.design.primaryColor};" title="Primary"></span>
            <span class="w-6 h-6 rounded-full border shadow-sm" style="background-color: ${state.design.secondaryColor};" title="Secondary"></span>
          </div>
        </div>
      </div>

      <!-- Features & Pages -->
      <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 relative">
        <button type="button" class="btn-jump-step absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20" data-jump="4">Edit</button>
        <div class="flex items-center gap-2 mb-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <h4 class="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">3. Features & Pages</h4>
        </div>
        <div class="mb-3">
          <span class="text-xs font-semibold text-slate-400 block mb-1">Selected Features (${state.features.length}):</span>
          <div class="flex flex-wrap gap-1.5">
            ${state.features.map(f => `<span class="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium">${f}</span>`).join('')}
          </div>
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 block mb-1">Included Pages (${allPages.length}):</span>
          <div class="flex flex-wrap gap-1.5">
            ${allPages.map(p => `<span class="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">${p}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Content, Budget & Timeline -->
      <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 relative">
        <button type="button" class="btn-jump-step absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20" data-jump="7">Edit</button>
        <div class="flex items-center gap-2 mb-2">
          <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <h4 class="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">4. Budget & Schedule</h4>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><span class="text-slate-400 text-xs block">Budget Tier:</span> <strong>${state.budget}</strong></div>
          <div><span class="text-slate-400 text-xs block">Desired Delivery:</span> <strong>${state.timeline}</strong></div>
        </div>
      </div>

      <!-- Booked Consultation -->
      <div class="p-5 rounded-2xl border-2 border-orange-500/40 bg-orange-500/5 relative">
        <button type="button" class="btn-jump-step absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20" data-jump="8">Edit</button>
        <div class="flex items-center gap-2 mb-2">
          <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <h4 class="font-bold text-sm uppercase tracking-wider text-orange-600 dark:text-orange-400">5. 1-on-1 Strategy Call</h4>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-2">
          <div><span class="text-slate-400 text-xs block">Consultation Date & Time:</span> <strong class="text-base text-slate-900 dark:text-white">${state.consultation.date || 'Date not chosen'} at ${state.consultation.timeLabel || 'Slot not chosen'}</strong></div>
          <div><span class="text-slate-400 text-xs block">Client Name & Email:</span> <strong>${state.consultation.clientName || 'N/A'}</strong> (${state.consultation.clientEmail || 'N/A'})</div>
          <div><span class="text-slate-400 text-xs block">WhatsApp / Phone:</span> <strong>${state.consultation.clientPhone || 'N/A'}</strong></div>
          <div><span class="text-slate-400 text-xs block">Preferred Platform:</span> <strong>${state.consultation.contactMethod || 'WhatsApp'}</strong></div>
        </div>
      </div>

      <!-- Live Estimated Investment Box -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 to-slate-900/60 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span class="text-xs uppercase tracking-wider text-blue-300 font-bold block">Estimated Project Investment</span>
          <div class="text-3xl font-extrabold text-white mt-1">$${min} – $${max}</div>
          <p class="text-xs text-blue-200/70 mt-1">Includes design, responsive development, speed optimization, and launch support.</p>
        </div>
        <div class="text-right">
          <span class="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Free Strategy Call Included</span>
        </div>
      </div>
    `;

    // Jump step listeners
    summaryContainer.querySelectorAll('.btn-jump-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStep = parseInt(btn.dataset.jump, 10);
        renderStep(targetStep);
      });
    });
  }

  // Validate current step before proceeding
  function validateStep(stepNumber) {
    if (stepNumber === 1) {
      if (!state.type) {
        showToast('Please select a website type to continue.', 'error');
        return false;
      }
    }
    if (stepNumber === 2) {
      const nameInput = document.getElementById('input-business-name');
      const purposeInput = document.getElementById('input-website-purpose');
      if (nameInput) state.businessName = nameInput.value.trim();
      if (purposeInput) state.purpose = purposeInput.value.trim();

      const audienceInput = document.getElementById('input-target-audience');
      if (audienceInput) state.targetAudience = audienceInput.value.trim();

      const urlInput = document.getElementById('input-existing-website');
      if (urlInput) state.existingWebsite = urlInput.value.trim();

      if (!state.businessName) {
        showToast('Please enter your business or project name.', 'error');
        nameInput?.focus();
        return false;
      }
    }
    if (stepNumber === 3) {
      const inspirationInput = document.getElementById('input-inspiration-links');
      if (inspirationInput) state.design.inspiration = inspirationInput.value.trim();
    }
    if (stepNumber === 5) {
      if (state.pages.length === 0 && state.customPages.length === 0) {
        showToast('Please select at least one page for your website.', 'error');
        return false;
      }
    }
    if (stepNumber === 8) {
      const nameInput = document.getElementById('input-client-name');
      const emailInput = document.getElementById('input-client-email');
      const phoneInput = document.getElementById('input-client-phone');
      const methodSelect = document.getElementById('select-contact-method');
      const notesInput = document.getElementById('input-client-notes');

      if (nameInput) state.consultation.clientName = nameInput.value.trim();
      if (emailInput) state.consultation.clientEmail = emailInput.value.trim();
      if (phoneInput) state.consultation.clientPhone = phoneInput.value.trim();
      if (methodSelect) state.consultation.contactMethod = methodSelect.value;
      if (notesInput) state.consultation.notes = notesInput.value.trim();

      if (!state.consultation.date) {
        showToast('Please select a consultation date from the calendar.', 'error');
        return false;
      }
      if (!state.consultation.time) {
        showToast('Please select an available time slot for your call.', 'error');
        return false;
      }
      if (!state.consultation.clientName) {
        showToast('Please enter your full name.', 'error');
        nameInput?.focus();
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(state.consultation.clientEmail)) {
        showToast('Please provide a valid email address.', 'error');
        emailInput?.focus();
        return false;
      }
      if (!state.consultation.clientPhone || state.consultation.clientPhone.length < 6) {
        showToast('Please provide your phone or WhatsApp number.', 'error');
        phoneInput?.focus();
        return false;
      }
    }

    return true;
  }

  // Bind All Events
  function bindEvents() {
    // Next Step Buttons
    document.querySelectorAll('.btn-builder-next').forEach(btn => {
      btn.addEventListener('click', () => {
        if (validateStep(state.step)) {
          if (state.step < 9) {
            renderStep(state.step + 1);
            document.getElementById('website-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    // Back Step Buttons
    document.querySelectorAll('.btn-builder-prev').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.step > 1) {
          renderStep(state.step - 1);
          document.getElementById('website-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Step 1: Website Type click
    document.querySelectorAll('.website-type-card').forEach(card => {
      card.addEventListener('click', () => {
        state.type = card.dataset.type;
        state.typePrice = TYPE_PRICING[state.type] || 190;
        renderStep1();
        updatePriceEstimate();
      });
    });

    // Step 3: Style selection
    document.querySelectorAll('.design-style-card').forEach(card => {
      card.addEventListener('click', () => {
        state.design.style = card.dataset.style;
        renderStep3();
      });
    });

    // Step 3: Font selection
    document.querySelectorAll('.font-style-card').forEach(card => {
      card.addEventListener('click', () => {
        state.design.fontStyle = card.dataset.font;
        renderStep3();
      });
    });

    // Step 3: Color inputs
    const primaryPicker = document.getElementById('input-primary-color');
    const secondaryPicker = document.getElementById('input-secondary-color');

    primaryPicker?.addEventListener('input', (e) => {
      state.design.primaryColor = e.target.value;
      renderStep3();
    });

    secondaryPicker?.addEventListener('input', (e) => {
      state.design.secondaryColor = e.target.value;
      renderStep3();
    });

    // Preset Palettes
    document.querySelectorAll('.preset-palette-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.design.primaryColor = btn.dataset.primary;
        state.design.secondaryColor = btn.dataset.secondary;
        renderStep3();
      });
    });

    // Step 5: Add Custom Page
    const addCustomBtn = document.getElementById('btn-add-custom-page');
    const customInput = document.getElementById('input-custom-page-name');

    function handleAddCustomPage() {
      const val = customInput?.value.trim();
      if (val) {
        if (!state.customPages.includes(val) && !state.pages.includes(val)) {
          state.customPages.push(val);
          customInput.value = '';
          renderStep5();
          updatePriceEstimate();
        } else {
          showToast('This page is already added.', 'info');
        }
      }
    }

    addCustomBtn?.addEventListener('click', handleAddCustomPage);
    customInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddCustomPage();
      }
    });

    // Step 6: Content Radios
    const radioGroups = ['logo', 'copywriting', 'images', 'hosting'];
    radioGroups.forEach(group => {
      document.querySelectorAll(`input[name="content-${group}"]`).forEach(radio => {
        radio.addEventListener('change', (e) => {
          state.content[group] = e.target.value;
          renderStep6();
          updatePriceEstimate();
        });
      });
    });

    // Step 7: Budget & Timeline
    const budgetSelect = document.getElementById('select-budget-range');
    budgetSelect?.addEventListener('change', (e) => {
      state.budget = e.target.value;
      updatePriceEstimate();
    });

    document.querySelectorAll('.timeline-option-card').forEach(card => {
      card.addEventListener('click', () => {
        state.timeline = card.dataset.timeline;
        renderStep7();
        updatePriceEstimate();
      });
    });

    // Calendar Month Navigation
    document.getElementById('cal-prev-month')?.addEventListener('click', () => {
      const now = new Date();
      now.setDate(1);
      now.setHours(0, 0, 0, 0);

      // Don't navigate to past months
      const prevMonth = new Date(currentCalDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      if (prevMonth >= now) {
        currentCalDate = prevMonth;
        renderCalendar();
      } else {
        showToast('Cannot navigate to past months.', 'info');
      }
    });

    document.getElementById('cal-next-month')?.addEventListener('click', () => {
      currentCalDate.setMonth(currentCalDate.getMonth() + 1);
      renderCalendar();
    });

    // Final Submission: Confirm Booking
    document.getElementById('btn-confirm-booking')?.addEventListener('click', handleFinalSubmission);
  }

  // Handle Booking Confirmation
  async function handleFinalSubmission() {
    const confirmBtn = document.getElementById('btn-confirm-booking');
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Securing your booking...
      `;
    }

    try {
      const { min, max } = calculatePrice();
      const bookingPayload = {
        type: state.type,
        businessName: state.businessName,
        purpose: state.purpose,
        targetAudience: state.targetAudience,
        existingWebsite: state.existingWebsite,
        design: state.design,
        features: state.features,
        pages: [...state.pages, ...state.customPages],
        content: state.content,
        budget: state.budget,
        timeline: state.timeline,
        consultation: state.consultation,
        estimatedPrice: `$${min} – $${max}`,
        adminNotes: ''
      };

      // 1. Save to Backend / LocalStorage
      const savedBooking = await window.StorageService.saveBooking(bookingPayload);

      // 2. Clear saved draft
      window.StorageService.clearDraft();

      // 3. Trigger email notification attempt (Formspree / EmailJS / Server)
      sendEmailNotification(savedBooking);

      // 4. Render Success Screen
      showSuccessScreen(savedBooking);

    } catch (err) {
      showToast(err.message || 'An error occurred while confirming your booking.', 'error');
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `Confirm Booking & Submit Project Request →`;
      }
    }
  }

  // Trigger Email Dispatch (with fallback support)
  function sendEmailNotification(booking) {
    // Configurable endpoint (e.g. Formspree or EmailJS or Resend)
    // Formspree free form endpoint can be configured in README/settings
    console.log('Sending booking confirmation to seneshf60@gmail.com:', booking);
    // If user has a formspree endpoint configured, submit in background:
    const formspreeEndpoint = window.FORMSPREE_ENDPOINT || '';
    if (formspreeEndpoint) {
      fetch(formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(booking)
      }).catch(e => console.warn('Formspree dispatch error:', e));
    }
  }

  // Display Success Screen
  function showSuccessScreen(booking) {
    // Trigger celebration confetti
    if (window.confetti) {
      window.confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    const builderWrapper = document.getElementById('builder-card-container');
    const successWrapper = document.getElementById('builder-success-screen');

    if (builderWrapper) builderWrapper.classList.add('hidden');
    if (successWrapper) {
      successWrapper.classList.remove('hidden');
      successWrapper.classList.add('step-slide-in');

      // Populate details
      document.getElementById('success-booking-id').textContent = booking.id;
      document.getElementById('success-client-name').textContent = booking.consultation.clientName;
      document.getElementById('success-date-time').textContent = `${booking.consultation.date} at ${booking.consultation.timeLabel}`;
      document.getElementById('success-method').textContent = booking.consultation.contactMethod;
      document.getElementById('success-project-type').textContent = booking.type;
      document.getElementById('success-estimated-price').textContent = booking.estimatedPrice;

      // WhatsApp direct message URL
      const waMsg = encodeURIComponent(
        `Ciao S. Fernandez! I just booked a website consultation.\n\n` +
        `• Booking ID: ${booking.id}\n` +
        `• Project: ${booking.type} (${booking.businessName})\n` +
        `• Date: ${booking.consultation.date} at ${booking.consultation.timeLabel}\n` +
        `• Est. Budget: ${booking.estimatedPrice}\n\n` +
        `Looking forward to our call!`
      );
      const waLink = document.getElementById('success-whatsapp-btn');
      if (waLink) {
        waLink.href = `https://wa.me/393510823322?text=${waMsg}`;
      }

      // Add to calendar download
      const calDownloadBtn = document.getElementById('success-calendar-download-btn');
      if (calDownloadBtn) {
        calDownloadBtn.onclick = () => downloadIcs(booking);
      }

      // Scroll into view
      successWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Generate .ics calendar invite
  function downloadIcs(booking) {
    const cons = booking.consultation;
    if (!cons.date || !cons.time) return;

    const [year, month, day] = cons.date.split('-');
    const [hours, minutes] = cons.time.split(':');

    // Create 45 minute duration
    const startObj = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const endObj = new Date(startObj.getTime() + 45 * 60 * 1000);

    const formatIcsDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//S. Fernandez//Web Design Strategy Call//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${booking.id}@sfernandez.dev`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startObj)}`,
      `DTEND:${formatIcsDate(endObj)}`,
      `SUMMARY:Website Strategy Consultation: S. Fernandez & ${cons.clientName}`,
      `DESCRIPTION:Strategy call for your ${booking.type} project (${booking.businessName}).\\nReference: ${booking.id}\\nPlatform: ${cons.contactMethod}`,
      `LOCATION:${cons.contactMethod}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SFernandez_Consultation_${booking.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Toast notification helper
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgClass = type === 'error' ? 'bg-red-600 text-white' : type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900';

    toast.className = `toast-msg ${bgClass}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="ml-2 font-bold opacity-70 hover:opacity-100">&times;</button>
    `;

    toast.querySelector('button')?.addEventListener('click', () => toast.remove());
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Public helper: jump directly to builder with preselected website type
  window.configureWebsiteType = function (typeName) {
    if (TYPE_PRICING[typeName]) {
      state.type = typeName;
      state.typePrice = TYPE_PRICING[typeName];
    }
    renderStep(1);
    updatePriceEstimate();
    const builderSection = document.getElementById('website-builder');
    if (builderSection) {
      builderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Expose toast
  window.showToast = showToast;

  // Run on DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBuilder);
  } else {
    initBuilder();
  }
})();
