/* The Architecture of Excellence: the menu and the reading options.

   Without this file the pages still read fine: the header link goes to
   the contents in the footer. With it, that link becomes a Menu button
   that opens the contents and an Accessibility panel.

   Choices are kept in localStorage under "aoe-prefs" and written to the
   root element as data attributes, which book.css styles. Each page also
   has a few lines in its <head> that apply them before first paint. */
(function () {
  "use strict";

  var root = document.documentElement;
  var KEY = "aoe-prefs";

  /* An empty value means "leave it to the device or the default". */
  var OPTIONS = [
    { key: "text", name: "Text size", values: [["", "Default"], ["l", "Large"], ["xl", "Larger"]] },
    { key: "theme", name: "Light", values: [["", "Device"], ["light", "Daylight"], ["candle", "Candlelight"]] },
    { key: "contrast", name: "Contrast", values: [["", "Standard"], ["more", "Stronger"]] },
    { key: "spacing", name: "Spacing", values: [["", "Standard"], ["roomy", "Roomier"]] },
    { key: "motion", name: "Motion", values: [["", "On"], ["reduce", "Still"]] }
  ];

  var systemStill = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* Each figure's own script adds a class ending in "-live" to the root
     while its scroll animation is on. Those scripts run before this one,
     so the classes they added are here to be remembered. */
  var liveClasses = Array.prototype.filter.call(root.classList, function (c) {
    return /-live$/.test(c);
  });

  function allowed(key, value) {
    for (var i = 0; i < OPTIONS.length; i++) {
      if (OPTIONS[i].key !== key) continue;
      for (var j = 0; j < OPTIONS[i].values.length; j++) {
        if (OPTIONS[i].values[j][0] === value) return true;
      }
    }
    return false;
  }

  function load() {
    var clean = {};
    try {
      var raw = JSON.parse(window.localStorage.getItem(KEY) || "{}") || {};
      for (var k in raw) {
        if (Object.prototype.hasOwnProperty.call(raw, k) && raw[k] && allowed(k, raw[k])) clean[k] = raw[k];
      }
    } catch (e) { /* private window or blocked storage: carry on without */ }
    return clean;
  }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* not kept, still applied */ }
  }

  var prefs = load();

  function apply() {
    for (var i = 0; i < OPTIONS.length; i++) {
      var k = OPTIONS[i].key;
      if (prefs[k]) root.setAttribute("data-" + k, prefs[k]);
      else root.removeAttribute("data-" + k);
    }
    var still = prefs.motion === "reduce";
    for (var j = 0; j < liveClasses.length; j++) root.classList.toggle(liveClasses[j], !still);
    /* text size and spacing move things; let the figures re-measure */
    try { window.dispatchEvent(new Event("resize")); } catch (e) { /* old browser: next scroll does it */ }
  }

  apply();

  /* ---------- the menu ---------- */

  var header = document.querySelector(".running");
  var fallback = header && header.querySelector(".running-contents");
  var footerList = document.querySelector("#contents .toc-list");
  if (!header || !fallback) return;

  var button = document.createElement("button");
  button.type = "button";
  button.className = "running-menu";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "book-menu");
  button.textContent = "Menu";

  var menu = document.createElement("div");
  menu.className = "menu";
  menu.id = "book-menu";
  menu.hidden = true;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  if (footerList) {
    var nav = el("nav", "menu-sec");
    nav.setAttribute("aria-label", "Contents");
    nav.appendChild(el("p", "label", "Contents"));
    nav.appendChild(footerList.cloneNode(true));
    menu.appendChild(nav);
  }

  var panel = el("section", "menu-sec");
  panel.setAttribute("aria-labelledby", "menu-a11y");

  var title = el("div", "menu-title");
  var flame = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  flame.setAttribute("class", "flame");
  flame.setAttribute("viewBox", "0 0 14 20");
  flame.setAttribute("aria-hidden", "true");
  flame.setAttribute("focusable", "false");
  var outer = document.createElementNS("http://www.w3.org/2000/svg", "path");
  outer.setAttribute("class", "flame-outer");
  outer.setAttribute("d", "M7 .8C9.6 5 12.6 8.2 12.6 12.4a5.6 5.6 0 0 1-11.2 0C1.4 8.2 4.4 5 7 .8Z");
  var core = document.createElementNS("http://www.w3.org/2000/svg", "path");
  core.setAttribute("class", "flame-core");
  core.setAttribute("d", "M7 8.4c1.4 2 2.5 3.4 2.5 5.1a2.5 2.5 0 0 1-5 0C4.5 11.8 5.6 10.4 7 8.4Z");
  flame.appendChild(outer);
  flame.appendChild(core);
  title.appendChild(flame);
  var heading = el("p", "label", "Accessibility");
  heading.id = "menu-a11y";
  title.appendChild(heading);
  panel.appendChild(title);
  panel.appendChild(el("p", "menu-note", "Set the page the way your eyes like it."));

  var buttons = [];

  OPTIONS.forEach(function (option) {
    var group = el("div", "opt");
    var nameId = "opt-" + option.key;
    group.setAttribute("role", "group");
    group.setAttribute("aria-labelledby", nameId);
    var name = el("span", "opt-name", option.name);
    name.id = nameId;
    group.appendChild(name);
    var seg = el("div", "opt-seg");
    option.values.forEach(function (pair) {
      var b = el("button", "opt-btn", pair[1]);
      b.type = "button";
      b.setAttribute("data-key", option.key);
      b.setAttribute("data-value", pair[0]);
      seg.appendChild(b);
      buttons.push(b);
    });
    group.appendChild(seg);
    panel.appendChild(group);
  });

  var reset = el("button", "menu-reset", "Reset");
  reset.type = "button";
  panel.appendChild(reset);
  menu.appendChild(panel);

  function sync() {
    buttons.forEach(function (b) {
      var key = b.getAttribute("data-key");
      var value = b.getAttribute("data-value");
      var current = prefs[key] || "";
      /* a device set to reduce motion is already still, and stays so */
      if (key === "motion" && systemStill) {
        b.setAttribute("aria-pressed", value === "reduce" ? "true" : "false");
        b.disabled = value === "";
        return;
      }
      b.setAttribute("aria-pressed", value === current ? "true" : "false");
    });
  }

  function choose(key, value) {
    if (value) prefs[key] = value;
    else delete prefs[key];
    save();
    apply();
    sync();
  }

  function isOpen() { return !menu.hidden; }

  function open() {
    menu.hidden = false;
    button.setAttribute("aria-expanded", "true");
    button.textContent = "Close";
  }

  function close(returnFocus) {
    if (!isOpen()) return;
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    button.textContent = "Menu";
    if (returnFocus) button.focus();
  }

  button.addEventListener("click", function () {
    if (isOpen()) close(false); else open();
  });

  menu.addEventListener("click", function (event) {
    var target = event.target;
    var b = target.closest ? target.closest(".opt-btn") : null;
    if (b && !b.disabled) {
      choose(b.getAttribute("data-key"), b.getAttribute("data-value"));
      return;
    }
    if (target.closest && target.closest(".menu-reset")) {
      prefs = {};
      save();
      apply();
      sync();
      return;
    }
    if (target.closest && target.closest("a")) close(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc") close(true);
  });

  document.addEventListener("click", function (event) {
    if (isOpen() && !header.contains(event.target)) close(false);
  });

  sync();
  header.replaceChild(button, fallback);
  header.appendChild(menu);
})();
