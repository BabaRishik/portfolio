/**
 * Portfolio JavaScript - Thallada Baba Rishik
 * Features:
 * - Interactive Canvas Circuit / Silicon Grid Animation
 * - Responsive Sticky Header & Scroll Spy Navigation
 * - Mobile Drawer Menu Toggle
 * - Scroll Reveal via IntersectionObserver
 * - One-Click Copy to Clipboard with Toast Notification (Email & Phone)
 * - UI-Ready Contact Form with Mailto Client Launcher
 * - Back to Top Button
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. SILICON CIRCUIT CANVAS ANIMATION
  // =========================================================================
  const canvas = document.getElementById('circuitCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle nodes representing integrated circuit junctions
    const particles = [];
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 22 : 45;
    const maxDistance = isMobile ? 90 : 130;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Subtle, slow horizontal/vertical biased velocity mimicking circuit bus lines
        const speed = 0.25 + Math.random() * 0.45;
        const angle = (Math.floor(Math.random() * 4) * Math.PI) / 2 + (Math.random() * 0.3 - 0.15);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.radius = Math.random() > 0.8 ? 2.2 : 1.4;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen edges
        if (this.x < 0) this.x = width;
        else if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        else if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.45)';
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationFrameId;
    let isTabActive = true;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function renderCanvas() {
      if (!isTabActive || prefersReducedMotion) return;

      ctx.clearRect(0, 0, width, height);

      // Draw interconnect traces
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            
            // Circuit-style 90-degree step line or direct trace
            if (i % 2 === 0) {
              ctx.lineTo(particles[i].x, particles[j].y);
            }
            ctx.lineTo(particles[j].x, particles[j].y);

            ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // Draw and update particle points
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(renderCanvas);
    }

    if (!prefersReducedMotion) {
      renderCanvas();
    }

    // Window resize handler
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Pause animation when tab is not visible to preserve device performance
    document.addEventListener('visibilitychange', () => {
      isTabActive = !document.hidden;
      if (isTabActive && !prefersReducedMotion) {
        cancelAnimationFrame(animationFrameId);
        renderCanvas();
      }
    });
  }

  // =========================================================================
  // 2. STICKY NAVBAR & MOBILE MENU TOGGLE
  // =========================================================================
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-link');

  // Add scroll shadow to navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Toggle mobile navigation drawer
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile menu when a nav link is clicked
    navItems.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // =========================================================================
  // 3. SCROLL SPY ACTIVE LINK HIGHLIGHTING
  // =========================================================================
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const matchingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (matchingLink) {
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          matchingLink.classList.add('active');
        } else {
          matchingLink.classList.remove('active');
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink);
  updateActiveNavLink();

  // =========================================================================
  // 4. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal-fade');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // =========================================================================
  // 5. TOAST NOTIFICATION & CLIPBOARD COPYING
  // =========================================================================
  const toast = document.getElementById('toastNotification');
  let toastTimeout;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function copyTextToClipboard(text, successMessage) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast(successMessage))
        .catch(() => fallbackCopy(text, successMessage));
    } else {
      fallbackCopy(text, successMessage);
    }
  }

  function fallbackCopy(text, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(successMessage);
    } catch (err) {
      showToast('Could not copy automatically. Value: ' + text);
    }
    document.body.removeChild(textArea);
  }

  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      copyTextToClipboard('tbabarishik@gmail.com', 'Copied email: tbabarishik@gmail.com');
    });
  }

  const copyPhoneBtn = document.getElementById('copyPhoneBtn');
  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', () => {
      copyTextToClipboard('9391529386', 'Copied phone: 9391529386');
    });
  }

  // =========================================================================
  // 6. CONTACT FORM HANDLING (UI-READY & TRANSPARENT)
  // =========================================================================
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('senderName');
      const emailInput = document.getElementById('senderEmail');
      const subjectInput = document.getElementById('senderSubject');
      const messageInput = document.getElementById('senderMessage');

      const nameVal = nameInput.value.trim();
      const emailVal = emailInput.value.trim();
      const subjectVal = subjectInput.value.trim() || 'Internship / Engineering Opportunity';
      const messageVal = messageInput.value.trim();

      let hasError = false;

      // Validate name
      if (!nameVal) {
        nameInput.closest('.form-group').classList.add('has-error');
        hasError = true;
      } else {
        nameInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        emailInput.closest('.form-group').classList.add('has-error');
        hasError = true;
      } else {
        emailInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate message
      if (!messageVal) {
        messageInput.closest('.form-group').classList.add('has-error');
        hasError = true;
      } else {
        messageInput.closest('.form-group').classList.remove('has-error');
      }

      if (hasError) return;

      // Honest, UI-Ready handling: launch default email client with draft prepared
      const recipient = 'tbabarishik@gmail.com';
      const emailBody = `Hello Thallada Baba Rishik,\n\nName: ${nameVal}\nEmail: ${emailVal}\n\nMessage:\n${messageVal}\n\n---\nSent from Portfolio Website`;
      const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subjectVal)}&body=${encodeURIComponent(emailBody)}`;

      if (formFeedback) {
        formFeedback.className = 'form-feedback info';
        formFeedback.innerHTML = `<strong>Opening your email client...</strong><br>A draft message to <code>tbabarishik@gmail.com</code> has been prepared. If your mail program does not launch automatically, you can email directly at <a href="${mailtoUrl}" style="color: #00e5ff; text-decoration: underline;">tbabarishik@gmail.com</a>.`;
        formFeedback.classList.remove('hidden');
      }

      showToast('Launching email client with your message...');

      // Trigger mailto link
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 500);
    });

    // Clear validation error on field input
    const inputs = contactForm.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        input.closest('.form-group').classList.remove('has-error');
      });
    });
  }

  // =========================================================================
  // 7. BACK TO TOP BUTTON
  // =========================================================================
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

});
