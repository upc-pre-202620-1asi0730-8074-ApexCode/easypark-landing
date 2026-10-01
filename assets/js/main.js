(function () {
  "use strict";
  var CONFIG = {
    APP_URL: "",
    APP_ROUTES: { login: "/sign-in", signup: "/sign-up", search: "/search" },
    VIDEOS: { product: "", team: "" }
  };

  var t = I18n.t;

  if (CONFIG.APP_URL) {
    document.querySelectorAll("[data-app-link]").forEach(function (link) {
      var route = CONFIG.APP_ROUTES[link.getAttribute("data-app-link")] || "/";
      link.setAttribute("href", CONFIG.APP_URL.replace(/\/$/, "") + route);
    });
  }
  
  var header = document.getElementById("header");
  var menuBtn = document.getElementById("menu-btn");
  var nav = document.getElementById("nav");

  if (menuBtn && nav) {
    var closeMenu = function () {
      nav.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
    };
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (nav && "IntersectionObserver" in window) {
    var navLinks = Array.prototype.slice.call(nav.querySelectorAll(':scope > a[href^="#"]'));
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute("href"));
      if (section) spy.observe(section);
    });
  }

  /* ==================================================================
     4. Reveal on scroll + hero counters
     ================================================================== */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        setTimeout(function () { entry.target.classList.add("is-visible"); }, Math.min(i * 70, 280));
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  function formatNumber(n) { return n.toLocaleString(I18n.getLocale()); }

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / 1400, 1);
      el.textContent = formatNumber(Math.round(target * (1 - Math.pow(1 - p, 3)))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    var countObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ==================================================================
     5. Accordions (benefits + FAQ)
     ================================================================== */
  function setOpen(item, open) {
    var head = item.querySelector(".acc-head");
    var body = item.querySelector(".acc-body");
    item.classList.toggle("is-open", open);
    head.setAttribute("aria-expanded", String(open));
    body.style.maxHeight = open ? body.scrollHeight + "px" : null;
  }

  document.querySelectorAll("[data-accordion]").forEach(function (acc) {
    var items = acc.querySelectorAll(".acc-item");
    items.forEach(function (item) {
      if (item.classList.contains("is-open")) setOpen(item, true);
      item.querySelector(".acc-head").addEventListener("click", function () {
        var wasOpen = item.classList.contains("is-open");
        items.forEach(function (other) { setOpen(other, false); });
        if (!wasOpen) setOpen(item, true);
      });
    });
  });

  // Recalculate open panels when text length changes (language / resize)
  function refreshOpenAccordions() {
    document.querySelectorAll(".acc-item.is-open .acc-body").forEach(function (body) {
      body.style.maxHeight = body.scrollHeight + "px";
    });
  }
  window.addEventListener("resize", refreshOpenAccordions);

  /* ==================================================================
     6. Benefits: segment tabs (drivers / operators)
     ================================================================== */
  var segmentTabs = document.querySelectorAll("[data-segment-tab]");

  function showSegment(segment) {
    segmentTabs.forEach(function (tab) {
      var active = tab.dataset.segmentTab === segment;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-segment-panel]").forEach(function (panel) {
      panel.hidden = panel.dataset.segmentPanel !== segment;
    });
    refreshOpenAccordions();
  }

  segmentTabs.forEach(function (tab) {
    tab.addEventListener("click", function () { showSegment(tab.dataset.segmentTab); });
  });

  // Hero CTAs open the matching segment
  document.querySelectorAll("[data-segment]").forEach(function (cta) {
    cta.addEventListener("click", function () { showSegment(cta.dataset.segment); });
  });

  /* ==================================================================
     7. Features: vertical tabs
     ================================================================== */
  var FEATURE_ICONS = { 1: "#i-search", 2: "#i-calendar", 3: "#i-qr", 4: "#i-map", 5: "#i-bell", 6: "#i-chart" };
  var featureTabs = document.querySelectorAll(".feature-tab");
  var featurePanel = document.querySelector(".feature-panel");

  featureTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var n = tab.dataset.feature;
      featureTabs.forEach(function (tb) {
        var active = tb === tab;
        tb.classList.toggle("is-active", active);
        tb.setAttribute("aria-selected", String(active));
      });
      document.getElementById("feature-ico").setAttribute("href", FEATURE_ICONS[n]);
      var map = { "feature-title": "", "feature-desc": "Desc", "feature-p1": "P1", "feature-p2": "P2", "feature-p3": "P3" };
      Object.keys(map).forEach(function (id) {
        var el = document.getElementById(id);
        var key = "features.tab" + n + map[id];
        el.setAttribute("data-i18n", key);
        el.textContent = t(key);
      });
      featurePanel.classList.remove("is-changing");
      void featurePanel.offsetWidth;
      featurePanel.classList.add("is-changing");
    });
  });

  /* ==================================================================
     8. Pricing: monthly / annual toggle
     ================================================================== */
  var billingBtns = document.querySelectorAll(".plan-toggle-btn");
  billingBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var annual = btn.dataset.billing === "annual";
      billingBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      document.querySelectorAll(".price-monthly").forEach(function (el) { el.hidden = annual; });
      document.querySelectorAll(".price-annual, .save-badge").forEach(function (el) { el.hidden = !annual; });
    });
  });

  /* ==================================================================
     9. Videos
     ================================================================== */
  document.querySelectorAll("[data-video]").forEach(function (frame) {
    var url = CONFIG.VIDEOS[frame.dataset.video];
    var play = frame.querySelector(".video-play");
    if (!url) {
      frame.classList.add("is-empty");
      play.setAttribute("disabled", "");
      return;
    }
    frame.querySelector(".video-soon").hidden = true;
    play.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.title = frame.dataset.video === "team" ? t("team.videoTitle") : t("overview.videoTitle");
      iframe.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      frame.innerHTML = "";
      frame.appendChild(iframe);
    });
  });

  /* ==================================================================
     10. Team photos: fall back to initials when a photo is missing
     ================================================================== */
  document.querySelectorAll(".team-avatar img").forEach(function (img) {
    var fallback = function () { img.parentElement.classList.add("no-photo"); img.remove(); };
    if (img.complete && img.naturalWidth === 0) fallback();
    else img.addEventListener("error", fallback);
  });

  /* ==================================================================
     11. Contact form validation
     ================================================================== */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, key) {
    var field = input.closest(".field");
    var small = field.querySelector(".error");
    field.classList.toggle("has-error", Boolean(key));
    input.setAttribute("aria-invalid", String(Boolean(key)));
    if (small.id) input.setAttribute("aria-describedby", small.id);
    small.textContent = key ? t(key) : "";
    return !key;
  }

  function validateField(input) {
    var value = input.value.trim();
    if (!value) return setError(input, "contact.errRequired");
    if (input.type === "email" && !EMAIL_RE.test(value)) return setError(input, "contact.errEmail");
    if (input.tagName === "TEXTAREA" && value.length < 10) return setError(input, "contact.errShort");
    return setError(input, "");
  }

  var form = document.getElementById("contact-form");
  if (form) {
    var formOk = document.getElementById("form-ok");
    var fields = form.querySelectorAll("input, textarea");
    fields.forEach(function (input) {
      input.addEventListener("blur", function () { validateField(input); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("has-error")) validateField(input);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      formOk.hidden = true;
      var valid = true;
      fields.forEach(function (input) { if (!validateField(input)) valid = false; });
      if (!valid) {
        form.querySelector(".has-error input, .has-error textarea").focus();
        return;
      }
      formOk.hidden = false;
      form.reset();
    });
  }

  /* ==================================================================
     12. Init
     ================================================================== */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  I18n.onChange(function () {
    document.querySelectorAll(".field.has-error input, .field.has-error textarea").forEach(validateField);
    refreshOpenAccordions();
  });

  I18n.init();
  refreshOpenAccordions();
})();
