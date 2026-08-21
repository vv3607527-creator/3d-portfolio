// ==========================================================================
// 3D Canvas Scroll Engine & Portfolio Interactivity
// ==========================================================================

// Configuration
const FRAME_COUNT = 240;
const FRAME_DIRECTORY = 'ezgif-261dfe51b672c270-jpg';
const FRAME_PREFIX = 'ezgif-frame-';
const FRAME_EXTENSION = '.jpg';

// Helper to get formatted filename
function getFrameUrl(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `${FRAME_DIRECTORY}/${FRAME_PREFIX}${paddedIndex}${FRAME_EXTENSION}`;
}

// DOM Elements
const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const scrollHint = document.getElementById('scroll-hint');
const navLinks = document.querySelectorAll('.nav-link');
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');
const toast = document.getElementById('toast');
const copyEmailBtn = document.getElementById('copy-email-btn');
const contactForm = document.getElementById('contact-form');

// State
const images = [];
let loadedCount = 0;
let isLoaded = false;
let targetFrame = 0;
let currentFrame = 0;
let animationFrameId = null;

// Initialize Canvas Size & DPI
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (isLoaded) {
    drawFrame(Math.round(currentFrame));
  }
}

window.addEventListener('resize', resizeCanvas);

// Draw specific frame onto canvas with cover fit
function drawFrame(index) {
  const img = images[index];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Clear background
  ctx.fillStyle = '#010206';
  ctx.fillRect(0, 0, width, height);

  // Compute 'cover' scaling so the frame fills 100% of the screen width and height
  const scale = Math.max(width / img.width, height / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

// Smooth Animation Loop (Lerp interpolation)
function animate() {
  // Linear interpolation for silky-smooth scrubbing
  const diff = targetFrame - currentFrame;
  if (Math.abs(diff) > 0.001) {
    currentFrame += diff * 0.12;
  } else {
    currentFrame = targetFrame;
  }

  const frameToDraw = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(currentFrame)));
  drawFrame(frameToDraw);

  animationFrameId = requestAnimationFrame(animate);
}

// Update target frame from scroll position
function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (maxScroll > 0) {
    const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
    targetFrame = scrollFraction * (FRAME_COUNT - 1);
  }

  // Hide scroll hint once user scrolls
  if (scrollHint) {
    if (scrollTop > 60) {
      scrollHint.style.opacity = '0';
    } else {
      scrollHint.style.opacity = '1';
    }
  }

  // Active Nav Link Spy
  updateActiveNavLink();
}

window.addEventListener('scroll', handleScroll, { passive: true });

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.pageYOffset;

  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 120;
    const sectionId = section.getAttribute('id');

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// Smooth Scroll for all in-page anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      // Close mobile menu if open
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navMenu.style.display = '';
      }
    }
  });
});

// Toast Notification Helper
let toastTimeout = null;
function showToast(message, icon = 'fa-check-circle') {
  if (!toast) return;
  toast.innerHTML = `<i class="fa-solid ${icon}" style="color: var(--primary-red); font-size: 1.1rem;"></i> <span>${message}</span>`;
  toast.classList.add('show');
  
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Copy Email Button Handler
if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = 'venkeypro456@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      showToast(`Email copied: ${email}`);
    }).catch(() => {
      showToast(`Email: ${email}`);
    });
  });
}

// Interactive Contact Form Handler
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();

    // Construct email parameters
    const emailSubject = encodeURIComponent(`Portfolio Inquiry: ${subject} (from ${name})`);
    const emailBody = encodeURIComponent(`Hi Venkatesh,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent from Portfolio Website`);
    
    // Open Gmail web compose in a new tab
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=venkeypro456@gmail.com&su=${emailSubject}&body=${emailBody}`;
    window.open(gmailUrl, '_blank');

    showToast(`Draft opened in Gmail! Thank you, ${name}.`);
    contactForm.reset();
  });
}

// Mobile Menu Toggle
if (mobileToggle && navMenu) {
  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    if (navMenu.classList.contains('active')) {
      navMenu.style.display = 'flex';
      navMenu.style.flexDirection = 'column';
      navMenu.style.position = 'absolute';
      navMenu.style.top = '100%';
      navMenu.style.left = '0';
      navMenu.style.width = '100%';
      navMenu.style.background = '#0d0f12';
      navMenu.style.padding = '1.5rem';
      navMenu.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
    } else {
      navMenu.style.display = '';
    }
  });
}

// Preload Images
function preloadImages() {
  resizeCanvas();

  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    const frameIndex = i - 1;

    img.onload = () => {
      loadedCount++;
      const percent = Math.floor((loadedCount / FRAME_COUNT) * 100);
      progressBar.style.width = `${percent}%`;
      progressPercent.textContent = `${percent}%`;

      // Render the first frame as soon as it's ready
      if (frameIndex === 0 && !isLoaded) {
        drawFrame(0);
      }

      if (loadedCount === FRAME_COUNT) {
        onAllFramesLoaded();
      }
    };

    img.onerror = () => {
      console.error(`Failed to load frame ${i}`);
      loadedCount++;
      if (loadedCount === FRAME_COUNT) {
        onAllFramesLoaded();
      }
    };

    img.src = getFrameUrl(i);
    images[frameIndex] = img;
  }
}

function onAllFramesLoaded() {
  isLoaded = true;
  loader.classList.add('fade-out');
  handleScroll();
  currentFrame = targetFrame;
  drawFrame(Math.round(currentFrame));
  animate();
}

// Initialize
preloadImages();
