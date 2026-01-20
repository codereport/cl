// Page order for arrow navigation
const pages = ['/', '/table.html', '/graphic.html', '/links.html'];

// Get current page index
function getCurrentIndex() {
    let path = window.location.pathname;
    if (path === '/index.html') path = '/';
    return pages.indexOf(path);
}

// Navigate to a page without full reload
async function navigateTo(url, pushState = true) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Update the page content
        document.title = doc.title;
        document.body.innerHTML = doc.body.innerHTML;
        
        // Update URL (skip if handling popstate)
        if (pushState) {
            history.pushState({}, '', url);
        }
        
        // Re-run any page-specific scripts
        initPage();
        
        // Update active nav link
        updateActiveNav();
    } catch (e) {
        // Fallback to regular navigation on error
        window.location.href = url;
    }
}

// Initialize page-specific functionality
function initPage() {
    // Mobile nav toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('nav-menu-open');
            navToggle.classList.toggle('nav-toggle-active');
        });

        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('nav-menu-open');
                navToggle.classList.remove('nav-toggle-active');
            });
        });
    }

    // Close menu on outside click
    document.addEventListener('click', function(event) {
        if (navMenu && navToggle &&
            !navMenu.contains(event.target) &&
            !navToggle.contains(event.target) &&
            navMenu.classList.contains('nav-menu-open')) {
            navMenu.classList.remove('nav-menu-open');
            navToggle.classList.remove('nav-toggle-active');
        }
    });

    // Graphic page: combinator highlight cycling
    if (window.location.pathname === '/graphic.html') {
        setTimeout(() => {
            const colors = ["green", "yellow", "red", "blue"];
            let index = 0;
            const body = document.body;
            body.classList.add("cycle-highlights");
            body.dataset.active = colors[index];
            index += 1;
            setInterval(() => {
                body.dataset.active = colors[index % colors.length];
                index += 1;
            }, 2000);
        }, 2000);
    }
}

// Update active nav link based on current URL
function updateActiveNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('nav-link-active');
        const href = link.getAttribute('href');
        const path = window.location.pathname;
        if (href === path || (href === '/' && (path === '/' || path === '/index.html'))) {
            link.classList.add('nav-link-active');
        }
    });
}

// Arrow key navigation
document.addEventListener('keydown', function(event) {
    // Don't navigate if user is typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    
    const currentIndex = getCurrentIndex();
    if (currentIndex === -1) return;
    
    let nextIndex = -1;
    
    if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + pages.length) % pages.length;
    } else if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % pages.length;
    }
    
    if (nextIndex !== -1) {
        event.preventDefault();
        navigateTo(pages[nextIndex]);
    }
});

// Handle browser back/forward
window.addEventListener('popstate', function() {
    navigateTo(window.location.pathname, false);
});

// Intercept nav link clicks for instant navigation
document.addEventListener('click', function(event) {
    const link = event.target.closest('a.nav-link');
    if (link && link.href && !link.target) {
        const url = new URL(link.href);
        if (url.origin === window.location.origin && pages.includes(url.pathname)) {
            event.preventDefault();
            navigateTo(url.pathname);
        }
    }
});

// Initialize on load
initPage();
