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
