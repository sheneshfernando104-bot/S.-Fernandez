/**
 * S. Fernandez Web Design & Development
 * Admin Dashboard Engine (Passcode authentication, metrics, filters, status updater, export)
 */

(function () {
  'use strict';

  // Default Admin Passcode (can be updated or set via window.ADMIN_PASSCODE)
  const ADMIN_PASSCODE = window.ADMIN_PASSCODE || 'sfernandez2025';
  const AUTH_KEY = 'sf_admin_authenticated';

  let bookingsCache = [];
  let currentFilterStatus = 'all';
  let currentSearchQuery = '';

  function initAdmin() {
    checkAuth();
    bindAdminEvents();
  }

  // Authentication check
  function checkAuth() {
    const isAuthed = sessionStorage.getItem(AUTH_KEY) === 'true';
    const loginModal = document.getElementById('admin-login-modal');
    const dashboard = document.getElementById('admin-dashboard');

    if (isAuthed) {
      loginModal?.classList.add('hidden');
      dashboard?.classList.remove('hidden');
      loadDashboardData();
    } else {
      loginModal?.classList.remove('hidden');
      dashboard?.classList.add('hidden');
    }
  }

  // Bind Admin Events
  function bindAdminEvents() {
    // Login form submit
    const loginForm = document.getElementById('admin-login-form');
    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const passInput = document.getElementById('admin-passcode-input');
      const errorMsg = document.getElementById('admin-login-error');

      if (passInput?.value === ADMIN_PASSCODE) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        errorMsg?.classList.add('hidden');
        checkAuth();
      } else {
        errorMsg?.classList.remove('hidden');
        passInput?.focus();
      }
    });

    // Logout
    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_KEY);
      checkAuth();
    });

    // Refresh Data
    document.getElementById('admin-refresh-btn')?.addEventListener('click', () => {
      loadDashboardData();
      showToast('Bookings refreshed.', 'info');
    });

    // Search bar
    const searchInput = document.getElementById('admin-search-input');
    searchInput?.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      renderBookingsTable();
    });

    // Status filter tabs
    document.querySelectorAll('.admin-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-filter-pill').forEach(b => {
          b.classList.remove('bg-orange-500', 'text-white');
          b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
        });
        btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
        btn.classList.add('bg-orange-500', 'text-white');

        currentFilterStatus = btn.dataset.status;
        renderBookingsTable();
      });
    });

    // Export CSV
    document.getElementById('btn-export-csv')?.addEventListener('click', exportToCsv);

    // Export JSON
    document.getElementById('btn-export-json')?.addEventListener('click', exportToJson);

    // Modal close
    document.getElementById('booking-detail-modal-close')?.addEventListener('click', () => {
      document.getElementById('booking-detail-modal')?.classList.add('hidden');
    });

    // Manual Slot Block
    const blockSlotForm = document.getElementById('block-slot-form');
    blockSlotForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dateVal = document.getElementById('block-slot-date')?.value;
      const timeVal = document.getElementById('block-slot-time')?.value;
      const reasonVal = document.getElementById('block-slot-reason')?.value || 'Admin Reserved';

      if (!dateVal || !timeVal) {
        showToast('Please select both date and time to block.', 'error');
        return;
      }

      const blockedBooking = {
        type: 'Reserved / Blocked',
        businessName: 'Internal Schedule Block',
        status: 'Contacted',
        consultation: {
          date: dateVal,
          time: timeVal,
          timeLabel: `${timeVal} CET`,
          clientName: 'S. Fernandez (Admin Block)',
          clientEmail: 'seneshf60@gmail.com',
          clientPhone: '+39 351 082 3322',
          contactMethod: 'Blocked Slot',
          notes: reasonVal
        },
        estimatedPrice: 'N/A',
        adminNotes: reasonVal
      };

      try {
        await window.StorageService.saveBooking(blockedBooking);
        showToast(`Slot on ${dateVal} at ${timeVal} is now blocked.`, 'success');
        document.getElementById('block-slot-modal')?.classList.add('hidden');
        loadDashboardData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Open/Close block slot modal
    document.getElementById('btn-open-block-slot')?.addEventListener('click', () => {
      document.getElementById('block-slot-modal')?.classList.remove('hidden');
    });
    document.getElementById('block-slot-modal-close')?.addEventListener('click', () => {
      document.getElementById('block-slot-modal')?.classList.add('hidden');
    });
  }

  // Load Dashboard Data
  async function loadDashboardData() {
    bookingsCache = await window.StorageService.getBookings();
    updateMetrics();
    renderBookingsTable();
  }

  // Update Summary Metrics
  function updateMetrics() {
    const totalCount = bookingsCache.length;
    const newCount = bookingsCache.filter(b => b.status === 'New').length;
    const inProgressCount = bookingsCache.filter(b => b.status === 'In Progress').length;
    const completedCount = bookingsCache.filter(b => b.status === 'Completed').length;

    // Calculate approximate pipeline value
    let totalPipeline = 0;
    bookingsCache.forEach(b => {
      if (b.status !== 'Cancelled' && b.estimatedPrice) {
        const matches = b.estimatedPrice.match(/\d+/g);
        if (matches && matches.length >= 2) {
          const avg = (parseInt(matches[0], 10) + parseInt(matches[1], 10)) / 2;
          totalPipeline += avg;
        } else if (matches && matches.length === 1) {
          totalPipeline += parseInt(matches[0], 10);
        }
      }
    });

    document.getElementById('metric-total-bookings').textContent = totalCount;
    document.getElementById('metric-new-inquiries').textContent = newCount;
    document.getElementById('metric-in-progress').textContent = inProgressCount;
    document.getElementById('metric-completed').textContent = completedCount;
    document.getElementById('metric-pipeline-value').textContent = `$${Math.round(totalPipeline).toLocaleString()}`;
  }

  // Render Bookings Table
  function renderBookingsTable() {
    const tableBody = document.getElementById('admin-bookings-tbody');
    const emptyState = document.getElementById('admin-empty-state');
    if (!tableBody) return;

    let filtered = [...bookingsCache];

    // Filter by status
    if (currentFilterStatus !== 'all') {
      filtered = filtered.filter(b => b.status.toLowerCase().replace(/\s+/g, '-') === currentFilterStatus.toLowerCase());
    }

    // Filter by search query
    if (currentSearchQuery) {
      filtered = filtered.filter(b => {
        const client = b.consultation || {};
        return (
          b.id?.toLowerCase().includes(currentSearchQuery) ||
          b.businessName?.toLowerCase().includes(currentSearchQuery) ||
          b.type?.toLowerCase().includes(currentSearchQuery) ||
          client.clientName?.toLowerCase().includes(currentSearchQuery) ||
          client.clientEmail?.toLowerCase().includes(currentSearchQuery) ||
          client.clientPhone?.toLowerCase().includes(currentSearchQuery)
        );
      });
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      emptyState?.classList.remove('hidden');
      return;
    }

    emptyState?.classList.add('hidden');

    tableBody.innerHTML = filtered.map(b => {
      const client = b.consultation || {};
      const statusColors = {
        'New': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
        'Contacted': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
        'In Progress': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
        'Completed': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        'Cancelled': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
      };

      const dateStr = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-GB') : 'N/A';
      const slotStr = client.date ? `${client.date} @ ${client.timeLabel || client.time}` : 'TBD';

      return `
        <tr class="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
          <td class="py-4 px-4 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">${b.id}</td>
          <td class="py-4 px-4">
            <div class="font-bold text-sm text-slate-900 dark:text-white">${client.clientName || 'Anonymous'}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <span>${client.clientEmail || 'No email'}</span>
              <span>•</span>
              <a href="https://wa.me/${(client.clientPhone || '').replace(/[^0-9]/g, '')}" target="_blank" class="text-emerald-500 hover:underline">${client.clientPhone || ''}</a>
            </div>
          </td>
          <td class="py-4 px-4">
            <div class="font-semibold text-sm text-slate-900 dark:text-white">${b.businessName || 'Project'}</div>
            <span class="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">${b.type}</span>
          </td>
          <td class="py-4 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span class="block font-semibold text-slate-900 dark:text-white">${slotStr}</span>
            <span class="text-[11px] text-slate-400">Via ${client.contactMethod || 'WhatsApp'}</span>
          </td>
          <td class="py-4 px-4">
            <select class="admin-status-dropdown text-xs font-bold py-1 px-2.5 rounded-lg border ${statusColors[b.status] || 'bg-slate-100 text-slate-700'} cursor-pointer" data-id="${b.id}">
              <option value="New" ${b.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Contacted" ${b.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="In Progress" ${b.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td class="py-4 px-4 text-sm font-bold text-slate-900 dark:text-white">${b.estimatedPrice || '$--'}</td>
          <td class="py-4 px-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button type="button" class="btn-inspect-booking px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20" data-id="${b.id}">
                Details
              </button>
              <button type="button" class="btn-delete-booking p-1.5 rounded-lg text-xs text-red-500 hover:bg-red-500/10" data-id="${b.id}" title="Delete">
                🗑
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Status change listener
    tableBody.querySelectorAll('.admin-status-dropdown').forEach(dropdown => {
      dropdown.addEventListener('change', async (e) => {
        const id = dropdown.dataset.id;
        const newStatus = e.target.value;
        await window.StorageService.updateBooking(id, { status: newStatus });
        showToast(`Booking ${id} status updated to ${newStatus}.`, 'success');
        loadDashboardData();
      });
    });

    // Inspect listener
    tableBody.querySelectorAll('.btn-inspect-booking').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        openBookingModal(id);
      });
    });

    // Delete listener
    tableBody.querySelectorAll('.btn-delete-booking').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm(`Are you sure you want to delete booking ${id}? This action cannot be undone.`)) {
          await window.StorageService.deleteBooking(id);
          showToast(`Booking ${id} deleted.`, 'info');
          loadDashboardData();
        }
      });
    });
  }

  // Open Full Booking Inspection Modal
  function openBookingModal(id) {
    const booking = bookingsCache.find(b => b.id === id);
    if (!booking) return;

    const modal = document.getElementById('booking-detail-modal');
    const content = document.getElementById('booking-detail-content');
    if (!modal || !content) return;

    const client = booking.consultation || {};
    const design = booking.design || {};
    const contentReq = booking.content || {};

    content.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <div>
          <span class="text-xs font-mono font-bold text-orange-500">${booking.id}</span>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">${booking.businessName || 'Project Details'}</h2>
          <span class="text-xs text-slate-400">Created: ${new Date(booking.createdAt).toLocaleString()}</span>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-400 block">Est. Investment</span>
          <span class="text-xl font-extrabold text-emerald-500">${booking.estimatedPrice}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <!-- Client & Call -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Client Contact & Consultation</h4>
          <div class="space-y-2">
            <div><span class="text-slate-400 text-xs">Name:</span> <strong class="text-slate-900 dark:text-white">${client.clientName || 'N/A'}</strong></div>
            <div><span class="text-slate-400 text-xs">Email:</span> <a href="mailto:${client.clientEmail}" class="text-blue-500 hover:underline">${client.clientEmail || 'N/A'}</a></div>
            <div><span class="text-slate-400 text-xs">Phone/WhatsApp:</span> <a href="https://wa.me/${(client.clientPhone||'').replace(/[^0-9]/g, '')}" target="_blank" class="text-emerald-500 hover:underline font-bold">${client.clientPhone || 'N/A'}</a></div>
            <div><span class="text-slate-400 text-xs">Preferred Platform:</span> <strong>${client.contactMethod || 'N/A'}</strong></div>
            <div><span class="text-slate-400 text-xs">Consultation Slot:</span> <strong class="text-orange-500">${client.date || 'N/A'} at ${client.timeLabel || client.time || 'N/A'}</strong></div>
            ${client.notes ? `<div class="mt-2 pt-2 border-t text-xs text-slate-500"><span class="font-semibold">Client Notes:</span> ${client.notes}</div>` : ''}
          </div>
        </div>

        <!-- Project Overview -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Project Scope & Timeline</h4>
          <div class="space-y-2">
            <div><span class="text-slate-400 text-xs">Website Type:</span> <strong>${booking.type}</strong></div>
            <div><span class="text-slate-400 text-xs">Purpose:</span> <span>${booking.purpose || 'N/A'}</span></div>
            <div><span class="text-slate-400 text-xs">Target Audience:</span> <span>${booking.targetAudience || 'N/A'}</span></div>
            <div><span class="text-slate-400 text-xs">Budget Range:</span> <strong>${booking.budget || 'N/A'}</strong></div>
            <div><span class="text-slate-400 text-xs">Delivery Deadline:</span> <strong>${booking.timeline || 'N/A'}</strong></div>
            ${booking.existingWebsite ? `<div><span class="text-slate-400 text-xs">Existing Site:</span> <a href="${booking.existingWebsite}" target="_blank" class="text-blue-500 hover:underline">${booking.existingWebsite}</a></div>` : ''}
          </div>
        </div>
      </div>

      <!-- Design & Aesthetics -->
      <div class="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Design Preferences</h4>
        <div class="flex items-center gap-6 flex-wrap text-sm">
          <div><span class="text-slate-400 text-xs">Style:</span> <strong>${design.style || 'N/A'}</strong></div>
          <div><span class="text-slate-400 text-xs">Typography:</span> <strong>${design.fontStyle || 'N/A'}</strong></div>
          <div class="flex items-center gap-2">
            <span class="text-slate-400 text-xs">Colors:</span>
            <span class="w-5 h-5 rounded-full border shadow-sm" style="background-color: ${design.primaryColor};" title="Primary"></span>
            <span class="font-mono text-xs">${design.primaryColor || '#--'}</span>
            <span class="w-5 h-5 rounded-full border shadow-sm" style="background-color: ${design.secondaryColor};" title="Secondary"></span>
            <span class="font-mono text-xs">${design.secondaryColor || '#--'}</span>
          </div>
        </div>
        ${design.inspiration ? `<div class="mt-2 text-xs text-slate-500"><span class="font-semibold">Inspiration URLs:</span> ${design.inspiration}</div>` : ''}
      </div>

      <!-- Features & Pages -->
      <div class="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Requested Features & Pages</h4>
        <div class="mb-3">
          <span class="text-xs text-slate-400 block mb-1">Features (${booking.features?.length || 0}):</span>
          <div class="flex flex-wrap gap-1.5">
            ${(booking.features || []).map(f => `<span class="px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold">${f}</span>`).join('')}
          </div>
        </div>
        <div>
          <span class="text-xs text-slate-400 block mb-1">Pages (${booking.pages?.length || 0}):</span>
          <div class="flex flex-wrap gap-1.5">
            ${(booking.pages || []).map(p => `<span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">${p}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Admin Private Notes Section -->
      <div class="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Private Admin Notes</h4>
        <textarea id="admin-notes-textarea" rows="3" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-orange-500" placeholder="Add private client notes, call logs, wireframe links...">${booking.adminNotes || ''}</textarea>
        <div class="mt-2 flex justify-end">
          <button type="button" id="btn-save-admin-notes" class="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-colors">
            Save Notes
          </button>
        </div>
      </div>
    `;

    // Notes save listener
    document.getElementById('btn-save-admin-notes')?.addEventListener('click', async () => {
      const notes = document.getElementById('admin-notes-textarea')?.value;
      await window.StorageService.updateBooking(id, { adminNotes: notes });
      showToast('Admin notes saved successfully.', 'success');
      loadDashboardData();
    });

    modal.classList.remove('hidden');
  }

  // Export to CSV
  function exportToCsv() {
    if (bookingsCache.length === 0) {
      showToast('No bookings to export.', 'info');
      return;
    }

    const headers = ['ID', 'Created At', 'Status', 'Client Name', 'Email', 'Phone', 'Business', 'Type', 'Consultation Date', 'Time Slot', 'Contact Method', 'Est. Price', 'Budget', 'Timeline', 'Features', 'Pages', 'Notes'];
    
    const rows = bookingsCache.map(b => {
      const c = b.consultation || {};
      return [
        b.id,
        b.createdAt,
        b.status,
        `"${(c.clientName || '').replace(/"/g, '""')}"`,
        `"${(c.clientEmail || '').replace(/"/g, '""')}"`,
        `"${(c.clientPhone || '').replace(/"/g, '""')}"`,
        `"${(b.businessName || '').replace(/"/g, '""')}"`,
        `"${(b.type || '').replace(/"/g, '""')}"`,
        c.date || '',
        c.timeLabel || c.time || '',
        c.contactMethod || '',
        `"${(b.estimatedPrice || '').replace(/"/g, '""')}"`,
        `"${(b.budget || '').replace(/"/g, '""')}"`,
        `"${(b.timeline || '').replace(/"/g, '""')}"`,
        `"${(b.features || []).join('; ')}"`,
        `"${(b.pages || []).join('; ')}"`,
        `"${(b.adminNotes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SFernandez_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Bookings exported to CSV.', 'success');
  }

  // Export to JSON
  function exportToJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookingsCache, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `SFernandez_Bookings_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Bookings exported to JSON backup.', 'success');
  }

  // Toast
  function showToast(msg, type = 'info') {
    if (window.showToast) {
      window.showToast(msg, type);
    } else {
      alert(msg);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
  } else {
    initAdmin();
  }
})();
