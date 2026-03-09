/* ============================================================
   INSEKTSTOP – app.js
   Handles: mobile navigation, contact form, toast, footer year
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav   = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('is-open', !expanded);
    });

    /* Close nav when a link inside it is tapped */
    siteNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
      }
    });

    /* Close nav on Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
        navToggle.focus();
      }
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Toast helper ---------- */
  var toastEl      = document.getElementById('toast');
  var toastTimeout = null;

  function showToast(message) {
    if (!toastEl) { return; }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 4000);
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contact-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Basic validation */
      var name    = form.querySelector('#name').value.trim();
      var email   = form.querySelector('#email').value.trim();
      var service = form.querySelector('#service').value;

      if (!name) {
        showToast('Please enter your full name.');
        form.querySelector('#name').focus();
        return;
      }

      if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.');
        form.querySelector('#email').focus();
        return;
      }

      if (!service) {
        showToast('Please select a service.');
        form.querySelector('#service').focus();
        return;
      }

      /* Simulate successful submission */
      var submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Sending…';

      setTimeout(function () {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Send enquiry';
        showToast('✅ Thank you! We'll be in touch within 2 hours.');
      }, 1200);
    });
  }

  /* ---------- Helpers ---------- */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

}());
