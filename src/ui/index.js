import Sidebar from '@coreui/coreui/js/dist/sidebar.js';
import '@coreui/coreui/js/dist/navigation.js';

export function initUI() {
  document.addEventListener('DOMContentLoaded', () => {
    // Spinner buttons
    document.querySelectorAll('.btn-spinner').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (!(e.shiftKey || e.ctrlKey || e.metaKey)) {
          btn.style.pointerEvents = 'none';
          const icon = btn.querySelector('i');
          if (icon) {
            icon.className = 'fa-solid fa-spinner fa-spin';
          }
        }
      });
    });

    // Remove empty nav titles when no children there
    document.querySelectorAll('.nav-title').forEach((title) => {
      const next = title.nextElementSibling;
      if (!next || !next.classList.contains('nav-item')) {
        title.style.display = 'none';
      }
    });

    // Handle external sidebar toggle buttons (outside the sidebar element)
    document.querySelectorAll('[data-coreui-toggle="sidebar"]').forEach((btn) => {
      if (!btn.closest('.sidebar')) {
        btn.addEventListener('click', () => {
          const sidebar = document.querySelector('.sidebar');
          if (sidebar) {
            const instance = Sidebar.getOrCreateInstance(sidebar);
            instance.toggle();
          }
        });
      }
    });
  });
}
