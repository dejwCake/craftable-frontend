import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initUI } from '@/ui/index.js';

describe('initUI', () => {
    let sidebar;

    beforeEach(() => {
        document.body.innerHTML = '';
        sidebar = document.createElement('div');
        sidebar.id = 'sidebar';
        document.body.appendChild(sidebar);
    });

    function addSidebarToggle() {
        const btn = document.createElement('button');
        btn.setAttribute('data-coreui-toggle', 'sidebar');
        document.body.appendChild(btn);
        return btn;
    }

    function addUnfoldableToggle() {
        const btn = document.createElement('button');
        btn.setAttribute('data-coreui-toggle', 'unfoldable');
        document.body.appendChild(btn);
        return btn;
    }

    function addDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        const toggle = document.createElement('a');
        toggle.setAttribute('data-coreui-toggle', 'dropdown');
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        dropdown.appendChild(toggle);
        dropdown.appendChild(menu);
        document.body.appendChild(dropdown);
        return { dropdown, toggle, menu };
    }

    it('sidebar toggle removes hide class when hidden', () => {
        sidebar.classList.add('hide');
        const btn = addSidebarToggle();
        initUI();
        btn.click();
        expect(sidebar.classList.contains('hide')).toBe(false);
    });

    it('sidebar toggle adds hide class when visible', () => {
        const btn = addSidebarToggle();
        initUI();
        // First click: sidebar has no 'hide', so it should add 'hide' (closeSidebar)
        // Actually: isHidden check — sidebar starts without 'hide', so isHidden=false → closeSidebar
        btn.click();
        expect(sidebar.classList.contains('hide')).toBe(true);
    });

    it('sidebar toggle creates backdrop on open', () => {
        sidebar.classList.add('hide');
        const btn = addSidebarToggle();
        initUI();
        btn.click();
        const backdrop = document.querySelector('.sidebar-backdrop');
        expect(backdrop).not.toBeNull();
    });

    it('backdrop click closes sidebar', () => {
        sidebar.classList.add('hide');
        const btn = addSidebarToggle();
        initUI();
        btn.click(); // opens
        const backdrop = document.querySelector('.sidebar-backdrop');
        backdrop.click();
        expect(sidebar.classList.contains('hide')).toBe(true);
    });

    it('unfoldable toggle toggles class', () => {
        const btn = addUnfoldableToggle();
        initUI();
        btn.click();
        expect(sidebar.classList.contains('sidebar-narrow-unfoldable')).toBe(true);
        btn.click();
        expect(sidebar.classList.contains('sidebar-narrow-unfoldable')).toBe(false);
    });

    it('dropdown toggle adds show class', () => {
        const { toggle, menu } = addDropdown();
        initUI();
        toggle.click();
        expect(menu.classList.contains('show')).toBe(true);
    });

    it('clicking outside closes dropdown', () => {
        const { toggle, menu } = addDropdown();
        initUI();
        toggle.click();
        expect(menu.classList.contains('show')).toBe(true);
        // Click outside dropdown
        document.body.click();
        expect(menu.classList.contains('show')).toBe(false);
    });

    it('mobile: sidebar starts hidden on narrow viewport', () => {
        Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true });
        sidebar.classList.remove('hide');
        initUI();
        expect(sidebar.classList.contains('hide')).toBe(true);
        // Reset
        Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    });
});
