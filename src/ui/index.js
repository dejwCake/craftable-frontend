export function initUI() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUIHandlers);
    } else {
        initUIHandlers();
    }
}

function initUIHandlers() {
    const sidebar = document.getElementById('sidebar');
    let backdrop = null;

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

    // Sidebar: mobile show/hide toggle
    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('hide');
        if (backdrop) {
            backdrop.remove();
            backdrop = null;
        }
    }

    document.querySelectorAll('[data-coreui-toggle="sidebar"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!sidebar) return;
            const isHidden = sidebar.classList.contains('hide');
            if (isHidden) {
                sidebar.classList.remove('hide');
                // Create backdrop for mobile
                backdrop = document.createElement('div');
                backdrop.className = 'sidebar-backdrop fade show';
                backdrop.addEventListener('click', closeSidebar);
                document.body.appendChild(backdrop);
            } else {
                closeSidebar();
            }
        });
    });

    // Sidebar: desktop unfoldable (narrow) toggle
    document.querySelectorAll('[data-coreui-toggle="unfoldable"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!sidebar) return;
            sidebar.classList.toggle('sidebar-narrow-unfoldable');
        });
    });

    // Dropdowns
    document.querySelectorAll('[data-coreui-toggle="dropdown"]').forEach((toggle) => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = toggle.closest('.dropdown');
            if (!dropdown) return;
            const menu = dropdown.querySelector('.dropdown-menu');
            if (!menu) return;
            const isOpen = menu.classList.contains('show');

            // Close all other open dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach((m) => m.classList.remove('show'));

            if (!isOpen) {
                menu.classList.add('show');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach((m) => m.classList.remove('show'));
        }
    });

    // On mobile, sidebar starts hidden
    if (sidebar && window.innerWidth < 992) {
        sidebar.classList.add('hide');
    }
}
