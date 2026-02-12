// UI initialization without jQuery
// Bootstrap 5 and CoreUI 5 handle dropdowns natively

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
  });
}
