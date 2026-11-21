/* =====================================================
THOMAS & HAZEL — WE STILL DO
Interactions & animations
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

/* ---------------------------------------------------
    ALWAYS START AT THE TOP ON REFRESH
--------------------------------------------------- */
window.scrollTo(0, 0);

/* ---------------------------------------------------
    FALLING PETALS / GOLD DUST
--------------------------------------------------- */
const ambientLayer = document.getElementById('ambientLayer');
const petalField = document.getElementById('petals');
const PETAL_COUNT = 34;
const PETAL_COLORS = ['#8a1c35', '#a3263f', '#6e1428', '#b83250', '#7a1f33'];
for (let i = 0; i < PETAL_COUNT; i++) {
const p = document.createElement('span');
const size = 9 + Math.random() * 10;
p.style.left = Math.random() * 100 + 'vw';
p.style.width = size + 'px';
p.style.height = (size * 1.45) + 'px';
p.style.background = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
// !important so petals keep falling even when the PC has "reduce motion" turned on
p.style.setProperty('animation-duration', (9 + Math.random() * 12) + 's', 'important');
p.style.setProperty('animation-iteration-count', 'infinite', 'important');
p.style.animationDelay = (Math.random() * -20) + 's';
p.style.opacity = (0.55 + Math.random() * 0.4).toFixed(2);
petalField.appendChild(p);
}

/* ---------------------------------------------------
    BURGUNDY PETAL BURST (confetti)
--------------------------------------------------- */
const burgundyColors = ['#6e1428', '#8a1c35', '#a3263f', '#b83250', '#5c1224'];
let petalShape = null;
if (window.confetti && confetti.shapeFromPath) {
try {
    petalShape = confetti.shapeFromPath({ path: 'M10 0C17 6 17 17 10 26C3 17 3 6 10 0Z' });
} catch (err) { petalShape = null; }
}
function petalBurst(scale) {
if (!window.confetti) return;
const base = {
    colors: burgundyColors,
    shapes: petalShape ? [petalShape] : ['circle'],
    scalar: petalShape ? 2.2 : 1.2,
    gravity: 0.65,
    drag: 0.92,
    ticks: 320,
    flat: false
};
const n = scale || 1;
confetti({ ...base, particleCount: Math.round(90 * n), spread: 360, startVelocity: 42, origin: { x: 0.5, y: 0.55 } });
confetti({ ...base, particleCount: Math.round(50 * n), spread: 120, startVelocity: 55, angle: 60,  origin: { x: 0, y: 0.7 } });
confetti({ ...base, particleCount: Math.round(50 * n), spread: 120, startVelocity: 55, angle: 120, origin: { x: 1, y: 0.7 } });
}

/* ---------------------------------------------------
    SCROLL REVEAL (stagger within each section)
--------------------------------------------------- */
const revealEls = document.querySelectorAll('.reveal');
revealEls.forEach((el, globalIndex) => {
const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal')) : [];
const localIndex = siblings.indexOf(el);
const delay = Math.min(localIndex, 6) * 0.12;
el.style.setProperty('--d', delay + 's');
});

const revealObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
    if (entry.isIntersecting) {
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
    }
});
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

/* ---------------------------------------------------
    COUNTDOWN
--------------------------------------------------- */
const eventDate = new Date('December 28, 2026 14:00:00').getTime();
const countdownEl = document.getElementById('countdown');
const countdownMarriedEl = document.getElementById('countdownMarried');
let countdownTimer = null;

function updateCountdown() {
const now = Date.now();
const diff = eventDate - now;

if (diff <= 0) {
    countdownEl.hidden = true;
    if (countdownMarriedEl) countdownMarriedEl.hidden = false;
    if (countdownTimer) clearInterval(countdownTimer);
    return;
}

const days = Math.floor(diff / (1000 * 60 * 60 * 24));
const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
const mins = Math.floor((diff / (1000 * 60)) % 60);
const secs = Math.floor((diff / 1000) % 60);

setUnit('days', days);
setUnit('hours', hours);
setUnit('mins', mins);
setUnit('secs', secs);
}

function setUnit(unit, value) {
const el = countdownEl.querySelector(`[data-unit="${unit}"]`);
if (!el) return;
const padded = String(value).padStart(2, '0');
if (el.textContent !== padded) {
    el.textContent = padded;
    el.classList.remove('is-tick');
    // restart animation
    requestAnimationFrame(() => el.classList.add('is-tick'));
}
}

updateCountdown();
countdownTimer = setInterval(updateCountdown, 1000);

/* ---------------------------------------------------
    ENVELOPE GATE
--------------------------------------------------- */
const gate = document.getElementById('gate');
const envelope = document.getElementById('envelope');
const seal = document.getElementById('seal');
const sparkles = document.getElementById('sparkles');
const ambientSparkles = document.getElementById('ambientSparkles');
const main = document.getElementById('main');
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const cinematic = document.getElementById('cinematic');
const cinematicVideo = document.getElementById('cinematicVideo');
const skipCinematic = document.getElementById('skipCinematic');
const unmuteNudge = document.getElementById('unmuteNudge');


// idle twinkling sparkles around the envelope
for (let i = 0; i < 18; i++) {
const s = document.createElement('span');
s.style.left = Math.random() * 100 + '%';
s.style.top = Math.random() * 100 + '%';
s.style.animationDuration = (1.8 + Math.random() * 2.4) + 's';
s.style.animationDelay = (Math.random() * 3) + 's';
ambientSparkles.appendChild(s);
}
let opened = false;

// Kick off buffering the moment the page loads instead of waiting for the
// envelope click — mobile browsers largely ignore preload="auto" until
// something explicitly asks them to fetch, so we ask early. This gives the
// video a head start while the person is still looking at the envelope
// (typically several seconds of dwell time before they tap it).
//
// Music is deliberately NOT preloaded here — it isn't needed until the
// cinematic ends (~30s later), and fetching it at the same time as the
// video would split the same limited mobile bandwidth between both files,
// making both buffer. It gets its own load() call once the cinematic is
// actually playing, further down.
try {
    cinematicVideo.load();
} catch (err) {
    /* no-op — worst case we fall back to on-demand loading */
}

function burstSparkles() {
const sealRect = seal.getBoundingClientRect();
const envRect = envelope.getBoundingClientRect();
const cx = sealRect.left - envRect.left + sealRect.width / 2;
const cy = sealRect.top - envRect.top + sealRect.height / 2;

for (let i = 0; i < 14; i++) {
    const s = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 90;
    s.style.left = cx + 'px';
    s.style.top = cy + 'px';
    s.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    s.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
    s.style.animationDelay = (Math.random() * 0.2) + 's';
    sparkles.appendChild(s);
    setTimeout(() => s.remove(), 5000);
}
}

function startCelebration() {
main.style.display = 'block';
document.body.style.overflow = 'auto';

// confetti burst
petalBurst(1);

// music
music.volume = 0.35;
music.play().then(() => {
    musicBtn.classList.add('is-playing');
}).catch(() => {
    /* autoplay blocked — user can press the music button */
});
musicBtn.disabled = false;
musicBtn.classList.add('is-ready');
}

function endCinematic() {
cinematic.classList.remove('is-active');
cinematic.classList.add('is-hidden');
cinematicVideo.pause();
unmuteNudge.hidden = true;
ambientLayer.classList.remove('is-paused');
startCelebration();
}


envelope.addEventListener('click', () => {
if (opened) return;
opened = true;

seal.classList.add('is-pressed');
setTimeout(() => seal.classList.remove('is-pressed'), 150);

setTimeout(() => burstSparkles(), 120);

envelope.classList.add('is-open');

setTimeout(() => {
    gate.classList.add('is-hidden');

    // No cinematic video published yet — skip straight to the celebration.
    // Once the cinematic section + video are added back to the HTML, this
    // will automatically pick the cinematic flow back up.
    if (!cinematic || !cinematicVideo) {
    ambientLayer.classList.remove('is-paused');
    startCelebration();
    return;
    }

    // play cinematic intro, then reveal the celebration
    ambientLayer.classList.add('is-paused');
    cinematic.classList.add('is-active');
    cinematicVideo.currentTime = 0;
    music.pause();
    musicBtn.classList.remove('is-playing');

    let cinematicTimer = null;
    const remaining = 36000;

    // ---- AUDIO FIX ----
    cinematicVideo.muted = true;
    cinematicVideo.play().then(() => {
    cinematicVideo.muted = false;
    cinematicVideo.volume = 0.9;

    setTimeout(() => {
        if (cinematicVideo.muted) {
        unmuteNudge.hidden = false;
        }
    }, 300);

    // Now that the video is confirmed playing, start quietly buffering the
    // music in the background. By the time the cinematic ends the music
    // should already be ready, without ever competing with the video for
    // bandwidth during the critical first few seconds.
    try { music.load(); } catch (err) { /* no-op */ }
    }).catch(() => {
    // even muted playback failed (rare) — leave muted, video still shows
    // still try to get music buffering so it's ready if things recover
    try { music.load(); } catch (err) { /* no-op */ }
    });

    unmuteNudge.addEventListener('click', () => {
    cinematicVideo.muted = false;
    cinematicVideo.volume = 0.9;
    cinematicVideo.play().catch(() => {});
    unmuteNudge.hidden = true;
    });

    cinematicTimer = setTimeout(endCinematic, remaining);

    cinematicVideo.addEventListener('ended', () => {
    if (cinematicTimer) clearTimeout(cinematicTimer);
    endCinematic();
    }, { once: true });

    skipCinematic.addEventListener('click', () => {
    if (cinematicTimer) clearTimeout(cinematicTimer);
    endCinematic();
    }, { once: true });

}, 4500);
});

// lock scroll until opened
document.body.style.overflow = 'hidden';

/* ---------------------------------------------------
    MUSIC TOGGLE
--------------------------------------------------- */
musicBtn.addEventListener('click', () => {
if (music.paused) {
    music.play();
    musicBtn.classList.add('is-playing');
} else {
    music.pause();
    musicBtn.classList.remove('is-playing');
}
});

/* ---------------------------------------------------
    SCROLL PROGRESS BAR
--------------------------------------------------- */
const progressFill = document.getElementById('progressFill');
function updateProgress() {
const scrollTop = window.scrollY;
const docHeight = document.documentElement.scrollHeight - window.innerHeight;
const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
progressFill.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ---------------------------------------------------
    SIDE NAV — SCROLL SPY
--------------------------------------------------- */
const navLinks = document.querySelectorAll('.side-nav a');
const navSections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href')));

const spyObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
    if (entry.isIntersecting) {
    const id = '#' + entry.target.id;
    navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === id);
    });
    }
});
}, { threshold: 0.5 });

navSections.forEach(sec => { if (sec) spyObserver.observe(sec); });

/* ---------------------------------------------------
    18 CELEBRATIONS TABS
--------------------------------------------------- */
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const indicator = document.querySelector('.tab-indicator');

function positionIndicator(tab) {
indicator.style.width = tab.offsetWidth + 'px';
indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
}

tabs.forEach(tab => {
tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('is-active'));
    panels.forEach(p => p.classList.remove('is-active'));

    tab.classList.add('is-active');
    document.getElementById(tab.dataset.target).classList.add('is-active');
    positionIndicator(tab);
});
});

// initial indicator position (after fonts/layout settle)
window.addEventListener('load', () => {
const active = document.querySelector('.tab.is-active');
if (active) positionIndicator(active);
});
setTimeout(() => {
const active = document.querySelector('.tab.is-active');
if (active) positionIndicator(active);
}, 400);

/* ---------------------------------------------------
    LIGHTBOX (gallery + dress code)
--------------------------------------------------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.querySelector('.lightbox__close');

document.querySelectorAll('[data-src]').forEach(el => {
el.addEventListener('click', () => {
    lightboxImg.src = el.dataset.src;
    lightboxImg.alt = el.querySelector('img')?.alt || '';
    lightbox.classList.add('is-open');
});
});

function closeLightbox() {
lightbox.classList.remove('is-open');
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') closeLightbox();
});

/* ---------------------------------------------------
    FAQ ACCORDION
--------------------------------------------------- */
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
const btn = item.querySelector('.faq-item__q');
const answer = item.querySelector('.faq-item__a');

btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    // close any other open items (single-open accordion)
    faqItems.forEach(other => {
    if (other !== item) {
        other.classList.remove('is-open');
        other.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-item__a').style.maxHeight = null;
    }
    });

    if (isOpen) {
    item.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    answer.style.maxHeight = null;
    } else {
    item.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    answer.style.maxHeight = answer.scrollHeight + 'px';
    }
});
});

/* ---------------------------------------------------
    RSVP FORM — sends submissions to Google Sheet
--------------------------------------------------- */
// Paste your Google Apps Script web-app URL here to collect RSVPs in a Google Sheet.
// Until then, the form opens an email to Hazel instead.
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbykTIUzIxXAiHKKtq5nr7Lugrwbeaxn1ha8w78TDbaw8EwpDOOKcdDEFbt-7KRUtrrdhA/exec';
const RSVP_EMAIL = 'hgprentice29@gmail.com';

const rsvpForm = document.getElementById('rsvpForm');
const rsvpSuccess = document.getElementById('rsvpSuccess');
const rsvpSubmitBtn = rsvpForm.querySelector('button[type="submit"]');

rsvpForm.addEventListener('submit', (e) => {
e.preventDefault();

const payload = {
    name: document.getElementById('rsvpName').value.trim(),
    status: document.getElementById('rsvpStatus').value === 'attend'
    ? 'Joyfully Accepts' : 'Regretfully Declines',
    guests: document.getElementById('rsvpGuests').value || '1',
    message: document.getElementById('rsvpMessage').value.trim()
};

if (!RSVP_ENDPOINT) {
    const mailBody = `Name: ${payload.name}\nAttendance: ${payload.status}\nGuests: ${payload.guests}\nMessage: ${payload.message}`;
    window.location.href = `mailto:${RSVP_EMAIL}?subject=${encodeURIComponent('RSVP - Thomas & Hazel')}&body=${encodeURIComponent(mailBody)}`;
    return;
}

rsvpSubmitBtn.disabled = true;
const originalLabel = rsvpSubmitBtn.innerHTML;
rsvpSubmitBtn.innerHTML = '<span>Sending...</span>';

fetch(RSVP_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors', // Apps Script doesn't return CORS headers; this still delivers the POST
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
})
    .then(() => {
    rsvpSuccess.textContent = 'Thank you! Your RSVP has been received. \u2713';
    rsvpSuccess.classList.add('is-visible');

    petalBurst(0.7);

    rsvpForm.reset();
    })
    .catch(() => {
    rsvpSuccess.textContent = 'Something went wrong. Please try again or message us directly.';
    rsvpSuccess.classList.add('is-visible');
    })
    .finally(() => {
    rsvpSubmitBtn.disabled = false;
    rsvpSubmitBtn.innerHTML = originalLabel;
    setTimeout(() => rsvpSuccess.classList.remove('is-visible'), 5000);
    });
});

});