/**
 * i18n.js — EasyPark translation module
 */
(function (global) {
    "use strict";

    var DEFAULT_LANG = "en";
    var SUPPORTED = ["en", "es"];
    var LOCALES = { en: "en-US", es: "es-PE" };

    var scriptSrc = document.currentScript ? document.currentScript.src : "";
    var BASE_URL = scriptSrc ? scriptSrc.replace(/i18n\.js(\?.*)?$/, "") : "assets/i18n/";

    var dictionaries = {};
    var currentLang = DEFAULT_LANG;
    var listeners = [];

    function flatten(obj, prefix, acc) {
        acc = acc || {};
        Object.keys(obj).forEach(function (key) {
            var full = prefix ? prefix + "." + key : key;
            if (obj[key] !== null && typeof obj[key] === "object") flatten(obj[key], full, acc);
            else acc[full] = obj[key];
        });
        return acc;
    }

    function load(lang) {
        if (dictionaries[lang]) return Promise.resolve(dictionaries[lang]);
        return fetch(BASE_URL + lang + ".json")
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (json) {
                dictionaries[lang] = flatten(json);
                return dictionaries[lang];
            });
    }

    function initialLang() {
        var fromUrl = new URLSearchParams(global.location.search).get("lang");
        return SUPPORTED.indexOf(fromUrl) !== -1 ? fromUrl : DEFAULT_LANG;
    }

    function t(key) {
        var dict = dictionaries[currentLang] || {};
        if (dict[key] !== undefined) return dict[key];
        var fallback = dictionaries[DEFAULT_LANG] || {};
        return fallback[key] !== undefined ? fallback[key] : "";
    }

    // Internal page links (landing <-> legal pages) carry the active language
    function syncPageLinks(lang) {
        document.querySelectorAll('a[href$=".html"], a[href*=".html?"]').forEach(function (a) {
            var href = a.getAttribute("href").split("?")[0];
            a.setAttribute("href", lang === DEFAULT_LANG ? href : href + "?lang=" + lang);
        });
    }

    function apply(lang) {
        var dict = dictionaries[lang];
        currentLang = lang;

        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            var value = dict[el.getAttribute("data-i18n")];
            if (value !== undefined) el.textContent = value;
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            var value = dict[el.getAttribute("data-i18n-placeholder")];
            if (value !== undefined) el.setAttribute("placeholder", value);
        });
        document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
            var value = dict[el.getAttribute("data-i18n-aria")];
            if (value !== undefined) el.setAttribute("aria-label", value);
        });

        document.documentElement.lang = lang;
        var titleKey = document.body.getAttribute("data-title-key") || "meta.title";
        if (dict[titleKey]) document.title = dict[titleKey];
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && dict["meta.description"]) metaDesc.setAttribute("content", dict["meta.description"]);

        document.querySelectorAll(".lang-opt").forEach(function (btn) {
            btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
        });
        syncPageLinks(lang);

        listeners.forEach(function (fn) { fn(lang); });
    }

    function setLanguage(lang) {
        if (SUPPORTED.indexOf(lang) === -1) return Promise.resolve();
        return Promise.all([load(DEFAULT_LANG), load(lang)])
            .then(function () { apply(lang); })
            .catch(function (err) {
                console.warn("[i18n] Could not load translations. Serve the site over HTTP.", err);
            });
    }

    function init() {
        document.querySelectorAll(".lang-opt").forEach(function (btn) {
            btn.addEventListener("click", function () {
                if (btn.dataset.lang !== currentLang) setLanguage(btn.dataset.lang);
            });
        });
        return setLanguage(initialLang());
    }

    global.I18n = {
        init: init,
        setLanguage: setLanguage,
        t: t,
        getLanguage: function () { return currentLang; },
        getLocale: function () { return LOCALES[currentLang]; },
        onChange: function (fn) { listeners.push(fn); }
    };
})(window);
