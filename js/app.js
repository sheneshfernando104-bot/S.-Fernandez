/**
 * S. Fernandez Web Design & Development
 * Main Application Script (UI interactions, theme, video controls, portfolio, FAQ)
 */

(function () {
  'use strict';

  // Portfolio items database for interactive modal & filtering
  const PORTFOLIO_PROJECTS = [
    {
      id: 'luxe-atelier',
      title: 'L’Atelier Milano - Luxury Fashion',
      category: 'ecommerce',
      categoryLabel: 'E-commerce Store',
      tagline: 'High-converting luxury apparel store with Stripe & Apple Pay',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      badge: 'E-commerce',
      metrics: ['+142% Checkout Rate', '0.5s Load Time', 'Multi-currency'],
      tech: ['Next.js', 'Tailwind CSS', 'Stripe', 'Framer Motion'],
      overview: 'Designed and developed a minimalist, ultra-fast online shopping experience for high-end boutique fashion with 1-click checkout and localized currency switching.'
    },
    {
      id: 'aurora-saas',
      title: 'Aurora AI - Analytics Platform',
      category: 'saas',
      categoryLabel: 'Custom Web App',
      tagline: 'Interactive B2B dashboard with real-time data visualizations',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      badge: 'SaaS / Web App',
      metrics: ['12k Active Users', '99.9% Uptime', 'Dark/Light Sync'],
      tech: ['React', 'TypeScript', 'Tailwind', 'Chart.js'],
      overview: 'A high-performance SaaS landing page and interactive client analytics portal featuring interactive metric widgets, user authentication, and responsive graphs.'
    },
    {
      id: 'villa-sorrento',
      title: 'Villa Sorrento - Boutique Retreat',
      category: 'booking',
      categoryLabel: 'Booking & Hospitality',
      tagline: 'Luxury villa reservation portal with 3D room tour & live calendar',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      badge: 'Booking Portal',
      metrics: ['3.4x Direct Bookings', 'Zero Commission', '3 Languages'],
      tech: ['Next.js', 'Tailwind CSS', 'Booking API', 'i18n'],
      overview: 'Eliminated reliance on third-party OTAs by giving this luxury boutique resort a bespoke direct-booking portal with instant deposit processing.'
    },
    {
      id: 'trattoria-roma',
      title: 'Trattoria da Mario - Rome',
      category: 'business',
      categoryLabel: 'Restaurant & Dining',
      tagline: 'Interactive digital menu, table reservations & brand storytelling',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      badge: 'Hospitality',
      metrics: ['+80 Table Bookings/wk', 'Mobile-first QR', 'Google 4.9★ Sync'],
      tech: ['Tailwind CSS', 'OpenTable API', 'Google Reviews API'],
      overview: 'Created an appetizing, photography-driven website with mobile-optimized reservation widgets and dynamic seasonal menu management.'
    },
    {
      id: 'zenith-capital',
      title: 'Zenith Private Wealth',
      category: 'corporate',
      categoryLabel: 'Corporate Website',
      tagline: 'Institutional trust and prestige for a boutique investment firm',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      badge: 'Corporate',
      metrics: ['Institutional Grade', 'A+ Security Score', 'Lead Flow +65%'],
      tech: ['Next.js', 'Tailwind CSS', 'Accessible WCAG 2.1'],
      overview: 'Built a sleek corporate presence conveying timeless sophistication, institutional security standards, and seamless appointment booking for high-net-worth clients.'
    },
    {
      id: 'creator-portfolio',
      title: 'Matteo Rossi - Cinema Director',
      category: 'creative',
      categoryLabel: 'Portfolio & Showreel',
      tagline: 'Immersive video portfolio with fluid transitions & case studies',
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
      badge: 'Portfolio',
      metrics: ['Vimeo 4K Streaming', 'Sound FX Design', 'Award Winning'],
      tech: ['HTML5 Video', 'Tailwind CSS', 'SmoothScroll'],
      overview: 'A cinematic digital showcase highlighting commercial video reels, client brand campaigns, and interactive behind-the-scenes production stills.'
    }
  ];

  // Initialize Landing Page Logic
  function initApp() {
    initTheme();
    initMobileNav();
    initVideoControls();
    initPortfolio();
    initFaq();
    initFloatingWhatsapp();
    initSmoothScroll();
    initLucideIcons();
  }

  // 1. Theme Switcher (Dark & Light Mode)
  function initTheme() {
    const theme = window.StorageService ? window.StorageService.getTheme() : 'dark';
    applyTheme(theme);

    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    themeToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        if (window.StorageService) {
          window.StorageService.setTheme(next);
        }
      });
    });
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    const iconsDark = document.querySelectorAll('.theme-icon-dark');
    const iconsLight = document.querySelectorAll('.theme-icon-light');

    if (theme === 'dark') {
      root.classList.add('dark');
      iconsDark.forEach(el => el.classList.remove('hidden'));
      iconsLight.forEach(el => el.classList.add('hidden'));
    } else {
      root.classList.remove('dark');
      iconsDark.forEach(el => el.classList.add('hidden'));
      iconsLight.forEach(el => el.classList.remove('hidden'));
    }
  }

  // 2. Mobile Navigation
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const menuDrawer = document.getElementById('mobile-menu-drawer');
    const closeBtn = document.getElementById('mobile-menu-close');
    const menuLinks = document.querySelectorAll('.mobile-nav-link');

    function openMenu() {
      menuDrawer?.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menuDrawer?.classList.add('hidden');
      document.body.style.overflow = '';
    }

    toggleBtn?.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    menuLinks.forEach(l => l.addEventListener('click', closeMenu));
  }

  // 3. Hero Live Video Background Controls
  function initVideoControls() {
    const video = document.getElementById('hero-background-video');
    const togglePlayBtn = document.getElementById('video-toggle-play');
    const toggleSoundBtn = document.getElementById('video-toggle-sound');
    const playIcon = document.getElementById('video-icon-play');
    const pauseIcon = document.getElementById('video-icon-pause');
    const soundMuteIcon = document.getElementById('video-icon-mute');
    const soundUnmuteIcon = document.getElementById('video-icon-unmute');

    if (!video) return;

    // Autoplay fallback check
    video.play().catch(() => {
      console.log('Video autoplay prevented by browser policy; controls enabled.');
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
    });

    togglePlayBtn?.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playIcon?.classList.add('hidden');
        pauseIcon?.classList.remove('hidden');
      } else {
        video.pause();
        playIcon?.classList.remove('hidden');
        pauseIcon?.classList.add('hidden');
      }
    });

    toggleSoundBtn?.addEventListener('click', () => {
      video.muted = !video.muted;
      if (video.muted) {
        soundMuteIcon?.classList.remove('hidden');
        soundUnmuteIcon?.classList.add('hidden');
      } else {
        soundMuteIcon?.classList.add('hidden');
        soundUnmuteIcon?.classList.remove('hidden');
      }
    });
  }

  // 4. Portfolio Filters & Modal
  function initPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    const filterBtns = document.querySelectorAll('.portfolio-filter-btn');

    function renderPortfolio(category = 'all') {
      if (!grid) return;

      const filtered = category === 'all'
        ? PORTFOLIO_PROJECTS
        : PORTFOLIO_PROJECTS.filter(p => p.category === category);

      grid.innerHTML = filtered.map(item => `
        <div class="glass-panel rounded-2xl overflow-hidden card-hover-lift group cursor-pointer border border-slate-200/80 dark:border-slate-800" data-project="${item.id}">
          <div class="relative aspect-video overflow-hidden bg-slate-900">
            <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            <div class="absolute top-3 left-3">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-md text-orange-400 border border-orange-500/30">
                ${item.badge}
              </span>
            </div>
            <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/90 text-slate-900 backdrop-blur-md shadow-lg flex items-center gap-1">
                View Case Study ↗
              </span>
            </div>
          </div>

          <div class="p-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">${item.categoryLabel}</span>
            <h3 class="text-xl font-bold mt-1 text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">${item.title}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">${item.tagline}</p>

            <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                ${item.tech.slice(0, 3).map(t => `<span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">${t}</span>`).join('')}
              </div>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">${item.metrics[0]}</span>
            </div>
          </div>
        </div>
      `).join('');

      // Attach click to open modal
      grid.querySelectorAll('[data-project]').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.project;
          openProjectModal(id);
        });
      });
    }

    // Filter clicks
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-orange-500', 'text-white', 'shadow-md');
          b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
        });
        btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
        btn.classList.add('bg-orange-500', 'text-white', 'shadow-md');

        const cat = btn.dataset.filter;
        renderPortfolio(cat);
      });
    });

    renderPortfolio('all');
  }

  // Portfolio Modal
  function openProjectModal(id) {
    const project = PORTFOLIO_PROJECTS.find(p => p.id === id);
    if (!project) return;

    const modal = document.getElementById('project-modal');
    const content = document.getElementById('project-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-slate-900">
        <img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
        <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow">${project.badge}</span>
          <span class="text-xs text-white/80">${project.categoryLabel}</span>
        </div>
      </div>

      <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white">${project.title}</h2>
      <p class="text-base text-slate-600 dark:text-slate-300 mt-2">${project.tagline}</p>

      <div class="my-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
        <h4 class="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-2">Key Project Deliverables & Results</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${project.metrics.map(m => `
            <div class="p-3 rounded-lg bg-white/70 dark:bg-slate-900/60 text-center">
              <span class="font-bold text-sm text-slate-900 dark:text-white">${m}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="text-sm text-slate-600 dark:text-slate-300 space-y-3">
        <h4 class="font-bold text-slate-900 dark:text-white">Project Brief & Architecture:</h4>
        <p>${project.overview}</p>
      </div>

      <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-400">Stack:</span>
          ${project.tech.map(t => `<span class="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">${t}</span>`).join('')}
        </div>
        <button type="button" onclick="window.configureWebsiteType('${project.categoryLabel.includes('E-commerce') ? 'E-commerce Store' : project.categoryLabel.includes('Booking') ? 'Booking Website' : 'Business Website'}'); document.getElementById('project-modal').classList.add('hidden');" class="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/25">
          Build Something Like This →
        </button>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  // Close project modal
  document.getElementById('project-modal-close')?.addEventListener('click', () => {
    document.getElementById('project-modal')?.classList.add('hidden');
    document.body.style.overflow = '';
  });

  document.getElementById('project-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'project-modal') {
      document.getElementById('project-modal')?.classList.add('hidden');
      document.body.style.overflow = '';
    }
  });

  // 5. FAQ Accordions
  function initFaq() {
    const accordions = document.querySelectorAll('.faq-accordion-item');
    accordions.forEach(item => {
      const trigger = item.querySelector('.faq-accordion-trigger');
      const body = item.querySelector('.faq-accordion-body');
      const icon = item.querySelector('.faq-icon');

      trigger?.addEventListener('click', () => {
        const isOpen = !body.classList.contains('hidden');

        // Close all other items
        accordions.forEach(other => {
          other.querySelector('.faq-accordion-body')?.classList.add('hidden');
          const otherIcon = other.querySelector('.faq-icon');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        });

        if (!isOpen) {
          body.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    });
  }

  // 6. Floating WhatsApp Button
  function initFloatingWhatsapp() {
    const waBtn = document.getElementById('floating-whatsapp-btn');
    if (waBtn) {
      waBtn.addEventListener('click', (e) => {
        // Let it naturally navigate to WhatsApp
      });
    }
  }

  // 7. Smooth Scroll for Nav Links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const el = document.querySelector(targetId);
          if (el) {
            e.preventDefault();
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  // 8. Reinitialize Lucide Icons
  function initLucideIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
