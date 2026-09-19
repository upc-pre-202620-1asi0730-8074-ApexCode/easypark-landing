
(function () {
  "use strict";

 //*  1. Menú móvil  
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  function closeNav() {
    nav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  navToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

 //*  2. Sombra del header al hacer scroll  
  var header = document.getElementById("header");

  function onScroll() {
    header.classList.toggle("is-stuck", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

 //*  3. Scroll-spy: marca la sección visible en el menú  
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (section) { spy.observe(section); });
  }

 //*  4. Animación de entrada de los bloques  
  var revealables = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var delay = Math.min(i * 70, 280);
        setTimeout(function () { entry.target.classList.add("is-visible"); }, delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

 //*  5. Contadores del hero  
  var counters = document.querySelectorAll("[data-count]");

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("es-PE") + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = parseInt(el.getAttribute("data-count"), 10).toLocaleString("es-PE") + (el.getAttribute("data-suffix") || "");
    });
  }

 //*  6. Acordeón de preguntas frecuentes  
  var questions = document.querySelectorAll(".faq-q");

  questions.forEach(function (question) {
    question.addEventListener("click", function () {
      var isOpen = question.getAttribute("aria-expanded") === "true";

      // Cierra todas las respuestas antes de abrir la seleccionada.
      questions.forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
        other.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen) {
        var answer = question.nextElementSibling;
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

 //*  7. Validación del formulario de contacto  
  var form = document.getElementById("contactForm");
  var formOk = document.getElementById("formOk");
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, message) {
    var field = input.closest(".field");
    field.classList.toggle("has-error", Boolean(message));
    field.querySelector(".error").textContent = message || "";
    return !message;
  }

  function validateField(input) {
    var value = input.value.trim();

    if (!value) return setError(input, "Este campo es obligatorio.");
    if (input.type === "email" && !emailPattern.test(value)) {
      return setError(input, "Ingresa un correo electrónico válido.");
    }
    if (input.id === "mensaje" && value.length < 10) {
      return setError(input, "Cuéntanos un poco más (mínimo 10 caracteres).");
    }
    return setError(input, "");
  }

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
    fields.forEach(function (input) {
      if (!validateField(input)) valid = false;
    });

    if (!valid) {
      form.querySelector(".has-error input, .has-error textarea").focus();
      return;
    }

    formOk.hidden = false;
    form.reset();
  });

  //*   8. Año actual en el footer  
  document.getElementById("year").textContent = new Date().getFullYear();
})();
