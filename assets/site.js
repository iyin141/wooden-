document.addEventListener('DOMContentLoaded', () => {
  // Mobile / Desktop Redirects
  const isMobile = window.innerWidth < 768;
  const isMobilePath = window.location.pathname.startsWith('/m/');
  const hasDesktopParam = new URLSearchParams(window.location.search).has('desktop');
  const isDesktopParamValue1 = new URLSearchParams(window.location.search).get('desktop') === '1';

  if (isMobile && !isMobilePath && (!hasDesktopParam || !isDesktopParamValue1)) {
    if (window.location.pathname !== '/404.html') {
      window.location.href = '/m' + window.location.pathname + window.location.search;
    }
  } else if (!isMobile && isMobilePath) {
    window.location.href = window.location.pathname.replace(/^\/m/, '') + window.location.search;
  }

  // --- Mock Behaviors ---

  const path = window.location.pathname;

  // 1. Track Order: Submitting lookup form reveals result timeline
  if (path.includes('track-order')) {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Tracking details found! (Mock)');
      });
    });
  }

  // 2. Book a Visit: Highlight card, handle ?type=online
  if (path.includes('book-visit')) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('type') === 'online') {
      const cards = document.querySelectorAll('div[class*="border"]');
      cards.forEach(card => {
        if (card.textContent.toLowerCase().includes('online')) {
          card.classList.add('border-black', 'border-2');
        }
      });
    }

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.innerHTML = '<div class="p-8 text-center text-xl text-black">Booking received! We will be in touch shortly.</div>';
      });
    });

    document.addEventListener('click', (e) => {
      const card = e.target.closest('button');
      if (card && card.textContent.match(/\\d+:\\d+/)) {
        document.querySelectorAll('button').forEach(b => {
          if (b.textContent.match(/\\d+:\\d+/)) b.style.opacity = '0.5';
        });
        card.style.opacity = '1';
        card.style.fontWeight = 'bold';
      }
    });
  }

  // 3. Sign In: any code moves to /my-requests/
  if (path.includes('sign-in')) {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        window.location.href = isMobilePath ? '/m/my-requests/' : '/my-requests/';
      });
    });
    
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="tel"]');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\\D/g, '');
        if (val.length >= 6) {
           window.location.href = isMobilePath ? '/m/my-requests/' : '/my-requests/';
        }
      });
    });
  }

  // 4. Checkout: Paystack button
  if (path.includes('checkout')) {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn && btn.textContent.toLowerCase().includes('paystack')) {
        e.preventDefault();
        alert('Opening Paystack Popup... (Mock)');
        setTimeout(() => {
          window.location.href = isMobilePath ? '/m/order-confirmation/' : '/order-confirmation/';
        }, 1000);
      }
    });
  }

  // 5. Custom Order "Request a quote"
  if (path.includes('custom-order')) {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.innerHTML = '<div class="p-8 text-center text-xl bg-white text-black rounded shadow">Request received. Our design team will contact you.</div>';
      });
    });
  }

  // --- Inert Controls ---
  
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const text = btn.textContent.toLowerCase();
    
    // Hamburger menu toggle
    if (btn.getAttribute('aria-label') === 'Open Navigation Menu') {
        const overlay = document.getElementById('mobile-menu-drawer');
        if (overlay) overlay.style.display = 'block';
    }

    // Map toggle
    if (text.includes('view map') || text.includes('view on map') || btn.getAttribute('aria-label') === 'View on Map') {
       const overlay = isMobilePath ? document.getElementById('map-modal-mobile-overlay') : document.getElementById('map-modal-overlay');
       if (overlay) overlay.style.display = 'block';
    }

    // Size/finish accordion
    if (text.includes('size') || text.includes('finish') || text.includes('specifications') || text.includes('details') || text.includes('dimensions')) {
      const next = btn.nextElementSibling;
      if (next && next.tagName === 'DIV') {
        next.style.display = next.style.display === 'none' ? 'block' : 'none';
      }
    }
    
    // Tabs
    if (btn.role === 'tab') {
      const tabs = btn.parentElement.querySelectorAll('[role="tab"]');
      tabs.forEach(t => t.style.opacity = '0.5');
      btn.style.opacity = '1';
    }
  });
});
