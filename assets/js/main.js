/* Business4U.com core script: layout, navigation, forms, ads, search, media, personalisation. */
(function () {
  "use strict";
  var C = window.B4U || {};
  var doc = document, html = doc.documentElement;
  var ROOT = html.getAttribute("data-root") || "";
  function $(s, el) { return (el || doc).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); }
  function u(p) { return ROOT + p; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  window.B4Uutil = { $: $, $$: $$, u: u, store: store, esc: esc, toast: toast, send: send, inbox: inbox };

  /* Theme */
  var saved = store("b4u-theme");
  if (saved) html.setAttribute("data-theme", saved);
  else if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) html.setAttribute("data-theme", "dark");

  /* Inbox decode (never rendered) */
  function inbox() {
    var k = C.k || [], m = C.m || [], s = "";
    for (var i = 0; i < m.length; i++) s += String.fromCharCode(m[i] ^ k[i % k.length]);
    return s;
  }

  var ICON = {
    logo: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="10" fill="#14213D"/><path d="M10 27h6v-6h6v-6h8" fill="none" stroke="#FFD84D" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="30" cy="15" r="3.2" fill="#43C485"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };

  var NAV = [
    ["Start", [["guides/how-to-start-a-business.html", "How to start a business", "The 12-step launch checklist"], ["tools/business-idea-quiz.html", "Business Match quiz", "Find ideas that fit you"], ["tools/business-name-generator.html", "Name generator", "Brandable names + domain check"], ["guides/llc-vs-sole-proprietorship-vs-corporation.html", "Choose a structure", "LLC, sole prop or corporation"], ["tools/business-plan-builder.html", "One-page plan builder", "Print-ready in 15 minutes"]]],
    ["Fund", [["funding/", "Funding finder", "Loans, grants and accelerators"], ["tools/funding-readiness-score.html", "Funding readiness score", "See what lenders see"], ["tools/business-loan-calculator.html", "Loan calculator", "Payments and full schedule"], ["guides/small-business-funding-options.html", "Funding options guide", "Every route, compared"], ["guides/how-to-get-a-small-business-grant.html", "Grant guide", "Find and win grants"]]],
    ["Grow", [["guides/small-business-marketing-plan.html", "Marketing plan", "A plan you will actually use"], ["guides/how-to-price-products-and-services.html", "Pricing guide", "Charge what you are worth"], ["tools/ltv-cac-calculator.html", "LTV:CAC calculator", "Is your marketing profitable?"], ["guides/how-to-build-a-business-website.html", "Build your website", "From domain to first sale"], ["guides/ai-tools-for-small-business.html", "AI for small business", "Practical, low-cost uses"]]],
    ["Tools", [["tools/", "All 16 free tools", "Calculators, generators, builders"], ["tools/break-even-calculator.html", "Break-even", "Units and revenue to profit"], ["tools/profit-margin-calculator.html", "Profit margin", "Gross and net margin"], ["tools/invoice-generator.html", "Invoice generator", "Print or save as PDF"], ["tools/startup-cost-calculator.html", "Startup costs", "What you need to launch"]]],
    ["Learn", [["guides/", "Guides", "13 in-depth playbooks"], ["videos/", "Video academy", "Curated lessons from experts"], ["news/", "Business news", "Updated automatically"]]],
    ["Community", [["contests/", "Contests and prizes", "Founder Pitch of the Month"], ["careers/", "Careers and expert network", "Work with us"], ["support/", "Support Business4U", "Keep the tools free"], ["advertise/", "Advertise and sponsor", "Reach founders and owners"]]]
  ];

  function header() {
    var h = $("#site-header"); if (!h) return;
    h.className = "site-header";
    var nav = NAV.map(function (g, i) {
      return '<div><button type="button" aria-expanded="false" aria-controls="m' + i + '">' + g[0] + '</button><div class="menu" id="m' + i + '">' +
        g[1].map(function (l) { return '<a href="' + u(l[0]) + '">' + l[1] + '<small>' + l[2] + '</small></a>'; }).join("") + "</div></div>";
    }).join("");
    h.innerHTML = '<a class="skip" href="#main">Skip to content</a><div class="wrap hdr"><a class="logo" href="' + (u("") || "./") + '" aria-label="Business4U.com home">' + ICON.logo + 'Business4U<span>.com</span></a>' +
      '<nav class="nav" id="nav" aria-label="Main">' + nav + '<div><a href="' + u("get-matched/") + '">Get matched</a></div></nav>' +
      '<div class="hdr-actions"><button class="icon-btn" type="button" id="open-search" aria-label="Search (Ctrl+K)">' + ICON.search + '</button>' +
      '<button class="icon-btn" type="button" id="theme" aria-label="Toggle dark mode">' + ICON.moon + '</button>' +
      '<a class="btn btn-sm btn-green" href="' + u("get-matched/") + '">Get matched free</a>' +
      '<button class="icon-btn burger" type="button" id="burger" aria-label="Open menu" aria-expanded="false">' + ICON.menu + "</button></div></div>";
    $$(".nav button", h).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = b.getAttribute("aria-expanded") === "true";
        closeMenus();
        if (!open) { b.setAttribute("aria-expanded", "true"); b.nextElementSibling.classList.add("open"); }
      });
    });
    doc.addEventListener("click", closeMenus);
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenus(); closeSearch(); } });
    $("#burger").addEventListener("click", function () {
      var n = $("#nav"), o = n.classList.toggle("open");
      this.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $("#theme").addEventListener("click", function () {
      var d = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", d); store("b4u-theme", d);
    });
    $("#open-search").addEventListener("click", openSearch);
  }
  function closeMenus() {
    $$(".nav button[aria-expanded=true]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); b.nextElementSibling.classList.remove("open"); });
  }

  function footer() {
    var f = $("#site-footer"); if (!f) return;
    f.className = "site-footer";
    var y = new Date().getFullYear();
    function col(t, links) { return "<div><h4>" + t + "</h4><ul>" + links.map(function (l) { return '<li><a href="' + u(l[0]) + '">' + l[1] + "</a></li>"; }).join("") + "</ul></div>"; }
    f.innerHTML = '<div class="wrap"><div class="ft-grid"><div><a class="logo" href="' + (u("") || "./") + '">' + ICON.logo + 'Business4U<span>.com</span></a>' +
      '<p style="margin:14px 0">Free tools, guides and matched help for founders, freelancers and small business owners.</p>' +
      '<form class="inline-form" data-form="newsletter" data-subject="Newsletter signup"><label class="vh" for="ft-email">Email</label><input id="ft-email" type="email" name="email" required placeholder="you@business.com"><input class="hp" type="text" name="_honey" tabindex="-1" autocomplete="off"><button class="btn btn-hi btn-sm" type="submit">Get the weekly brief</button><p class="form-msg" role="status"></p></form></div>' +
      col("Start", [["guides/how-to-start-a-business.html", "Start a business"], ["tools/business-idea-quiz.html", "Business Match quiz"], ["tools/business-name-generator.html", "Name generator"], ["tools/business-plan-builder.html", "Plan builder"], ["guides/low-cost-business-ideas.html", "Low-cost ideas"]]) +
      col("Fund and grow", [["funding/", "Funding finder"], ["get-matched/", "Get matched"], ["tools/", "All tools"], ["guides/", "Guides"], ["videos/", "Video academy"], ["news/", "News"]]) +
      col("Community", [["contests/", "Contests and prizes"], ["careers/", "Careers"], ["support/", "Support us"], ["advertise/", "Advertise"], ["about/", "About"], ["contact/", "Contact"]]) +
      col("Legal", [["legal/privacy.html", "Privacy policy"], ["legal/terms.html", "Terms of use"], ["legal/disclaimer.html", "Disclaimer"], ["legal/cookies.html", "Cookie policy"], ["legal/editorial-policy.html", "Editorial policy"], ["legal/trademark-copyright.html", "Trademark and copyright"]]) +
      '</div><div class="ft-legal"><p>&copy; ' + y + ' Business4U.com. Original content and tools &copy; Business4U.com. "Business4U" is used descriptively as this website\'s domain name; no trademark rights are claimed in the term and this site is not affiliated with any other business using a similar name. All third-party names, logos and marks belong to their respective owners. <a href="' + u("legal/trademark-copyright.html") + '">Full disclosure</a>.</p>' +
      '<p>Business4U.com provides general information, not legal, tax or financial advice, and is not a lender. This site shows ads served by Google and may earn referral fees from partners. <a href="' + u("legal/disclaimer.html") + '">Disclaimer</a>.</p>' +
      '<p><a href="' + C.contactUrl + '" target="_blank" rel="noopener">Interested in this website, domain name, sponsorship, advertising or partnership? Contact us.</a></p></div></div>';
  }

  /* Ads: insert manual units only when slot IDs exist; otherwise Auto ads handles placement. */
  function ads() {
    $$(".ad-slot").forEach(function (el) {
      var slot = (C.adSlots || {})[el.getAttribute("data-ad")] || "";
      if (!slot) { el.remove(); return; }
      el.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="' + C.adClient + '" data-ad-slot="' + slot + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  /* Toast */
  function toast(msg) {
    var t = $(".toast");
    if (!t) { t = doc.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); doc.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* Send to owner inbox via FormSubmit AJAX */
  function send(data, subject) {
    var payload = {};
    Object.keys(data).forEach(function (k) { payload[k] = data[k]; });
    payload._subject = (subject || "Website form") + " | Business4U.com";
    payload._template = "table";
    payload._captcha = "false";
    payload.page = location.href;
    payload.submitted = new Date().toISOString();
    return fetch("https://formsubmit.co/ajax/" + inbox(), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { if (!r.ok) throw new Error("Network"); return r.json().catch(function () { return {}; }); });
  }

  function formData(form) {
    var o = {};
    $$("input,select,textarea", form).forEach(function (el) {
      if (!el.name || el.type === "submit" || el.type === "button") return;
      if ((el.type === "checkbox" || el.type === "radio") && !el.checked) return;
      if (o[el.name]) o[el.name] += ", " + el.value; else o[el.name] = el.value;
    });
    return o;
  }

  function forms() {
    $$("form[data-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = $(".form-msg", form), btn = $("button[type=submit]", form);
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var data = formData(form);
        if (data._honey) return;
        delete data._honey;
        data.form = form.getAttribute("data-form");
        if (btn) { btn.disabled = true; btn._t = btn.textContent; btn.textContent = "Sending..."; }
        send(data, form.getAttribute("data-subject")).then(function () {
          var ok = form.getAttribute("data-success") ? $(form.getAttribute("data-success")) : null;
          if (ok) { form.style.display = "none"; ok.classList.add("show"); ok.setAttribute("tabindex", "-1"); ok.focus(); }
          else if (msg) { msg.className = "form-msg"; msg.textContent = "Thanks. You're in. Check your inbox soon."; form.reset(); }
        }).catch(function () {
          if (msg) { msg.className = "form-msg err"; msg.textContent = "That didn't send. Check your connection and try again."; }
        }).then(function () { if (btn) { btn.disabled = false; btn.textContent = btn._t; } });
      });
    });
    /* Email links build the address only on click */
    $$("a[data-mail]").forEach(function (a) {
      a.setAttribute("href", "#");
      a.addEventListener("click", function (e) {
        e.preventDefault();
        location.href = "mailto:" + inbox() + "?subject=" + encodeURIComponent(a.getAttribute("data-mail") || "Hello from Business4U.com");
      });
    });
  }

  /* Search */
  var idx = null, sel = 0;
  function openSearch() {
    var m = $("#search-modal");
    if (!m) {
      m = doc.createElement("div"); m.className = "modal"; m.id = "search-modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-label", "Search");
      m.innerHTML = '<div class="modal-box"><label class="vh" for="q">Search Business4U.com</label><input id="q" type="search" placeholder="Search tools, guides, funding..." autocomplete="off"><ul id="q-res"></ul></div>';
      doc.body.appendChild(m);
      m.addEventListener("click", function (e) { if (e.target === m) closeSearch(); });
      var q = $("#q", m);
      q.addEventListener("input", function () { sel = 0; renderSearch(q.value); });
      q.addEventListener("keydown", function (e) {
        var links = $$("#q-res a");
        if (e.key === "ArrowDown") { sel = Math.min(sel + 1, links.length - 1); e.preventDefault(); }
        else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); e.preventDefault(); }
        else if (e.key === "Enter" && links[sel]) { location.href = links[sel].href; return; }
        links.forEach(function (l, i) { l.classList.toggle("sel", i === sel); });
      });
    }
    m.classList.add("open");
    var q2 = $("#q", m); q2.value = ""; q2.focus();
    if (!idx) fetch(u("data/search-index.json")).then(function (r) { return r.json(); }).then(function (d) { idx = d; renderSearch(""); }).catch(function () { idx = []; });
    else renderSearch("");
  }
  function closeSearch() { var m = $("#search-modal"); if (m) m.classList.remove("open"); }
  function renderSearch(q) {
    var out = $("#q-res"); if (!out || !idx) return;
    q = q.toLowerCase().trim();
    var words = q.split(/\s+/).filter(Boolean);
    var res = idx.map(function (it) {
      var hay = (it.t + " " + (it.d || "") + " " + (it.k || "")).toLowerCase(), s = 0;
      words.forEach(function (w) { if (it.t.toLowerCase().indexOf(w) > -1) s += 3; else if (hay.indexOf(w) > -1) s += 1; else s -= 10; });
      return { it: it, s: words.length ? s : 0 };
    }).filter(function (r) { return !words.length || r.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 12);
    out.innerHTML = res.length ? res.map(function (r, i) { return '<li><a class="' + (i === sel ? "sel" : "") + '" href="' + u(r.it.u) + '">' + esc(r.it.t) + "<small>" + esc(r.it.d || "") + "</small></a></li>"; }).join("") : '<li style="padding:14px" class="muted">No matches. Try "loan", "LLC" or "pricing".</li>';
  }
  doc.addEventListener("keydown", function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); } });

  /* Lite YouTube (privacy-enhanced, loads only on click) */
  function yt() {
    $$(".yt[data-id]").forEach(function (b) {
      if (b._ok) return; b._ok = 1;
      var id = b.getAttribute("data-id");
      b.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
      b.addEventListener("click", function () {
        b.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="' + esc(b.getAttribute("aria-label") || "Video") + '" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      });
    });
  }
  window.B4Uutil.yt = yt;

  /* Tip of the day (rotates daily) */
  var TIPS = [
    "Open a separate business bank account on day one. It makes bookkeeping, taxes and lending far easier.",
    "Price from value, then check it against cost. Most new owners undercharge by 20% or more.",
    "Talk to 10 potential customers before you spend money on a product.",
    "Keep three months of operating costs in reserve before you hire.",
    "Send invoices the same day the work is done. Late invoices get paid late.",
    "Track one number weekly: cash in the bank. Profit is an opinion, cash is a fact.",
    "Ask every happy customer for a review within 48 hours.",
    "Write down your break-even number and put it where you can see it.",
    "A one-page plan you update monthly beats a 40-page plan you never open.",
    "Search trademarks before you buy a domain or print anything.",
    "Automate one repetitive task this week: invoicing, follow-ups or scheduling.",
    "Set aside a fixed percentage of every payment for taxes.",
    "Your first marketing channel should be where your customers already spend time.",
    "Raise prices for new customers first; grandfather loyal ones for a period."
  ];
  function tips() {
    var d = new Date(), day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    $$("[data-tip]").forEach(function (el) { el.textContent = TIPS[day % TIPS.length]; });
    $$("[data-year]").forEach(function (el) { el.textContent = d.getFullYear(); });
  }

  /* Cookie notice (Google's certified CMP handles EEA/UK consent when enabled in AdSense) */
  function cookie() {
    if (store("b4u-cookie")) return;
    var c = doc.createElement("div"); c.className = "cookie"; c.setAttribute("role", "region"); c.setAttribute("aria-label", "Cookie notice");
    c.innerHTML = '<p>We use cookies for essential features, analytics and ads served by Google. Read our <a href="' + u("legal/cookies.html") + '">cookie policy</a> and <a href="' + u("legal/privacy.html") + '">privacy policy</a>.</p><button class="btn btn-sm" type="button">OK, got it</button>';
    doc.body.appendChild(c);
    $("button", c).addEventListener("click", function () { store("b4u-cookie", 1); c.remove(); });
  }

  /* Lead slide-in on content pages: once per session, after 40s or 60% scroll */
  function slidein() {
    if (!doc.body.hasAttribute("data-slidein")) return;
    try { if (sessionStorage.getItem("b4u-si")) return; } catch (e) {}
    var shown = false;
    function show() {
      if (shown) return; shown = true;
      try { sessionStorage.setItem("b4u-si", "1"); } catch (e) {}
      var s = doc.createElement("aside"); s.className = "slidein"; s.setAttribute("aria-label", "Get matched");
      s.innerHTML = '<button class="x" type="button" aria-label="Close">&times;</button><h3>Want a hand with this?</h3><p class="small">Tell us what you need in 60 seconds. We match you with vetted funding, formation, accounting or marketing help. Free, no obligation.</p><a class="btn btn-green btn-sm" href="' + u("get-matched/") + '">Get matched free</a>';
      doc.body.appendChild(s);
      requestAnimationFrame(function () { s.classList.add("show"); });
      $(".x", s).addEventListener("click", function () { s.remove(); });
    }
    setTimeout(show, 40000);
    window.addEventListener("scroll", function () {
      var h = doc.documentElement; if ((h.scrollTop + innerHeight) / h.scrollHeight > 0.6) show();
    }, { passive: true });
  }

  /* Home: path picker prints a personalised plan on the receipt */
  var PATHS = {
    start: { label: "Start a business", items: [["tools/business-idea-quiz.html", "Find your best-fit idea", "Business Match quiz, 2 minutes"], ["tools/startup-cost-calculator.html", "Price your launch", "Startup cost calculator"], ["guides/llc-vs-sole-proprietorship-vs-corporation.html", "Pick a legal structure", "LLC vs sole prop vs corporation"], ["tools/business-name-generator.html", "Name it and grab the domain", "Name generator"], ["tools/business-plan-builder.html", "Write a one-page plan", "Plan builder, print-ready"]] },
    fund: { label: "Get funding", items: [["tools/funding-readiness-score.html", "Check your readiness score", "What lenders will look at"], ["funding/", "Shortlist programs", "Loans, grants, accelerators"], ["tools/business-loan-calculator.html", "Test the repayments", "Loan calculator + schedule"], ["guides/how-to-get-a-small-business-grant.html", "Apply for grants", "Grant-writing playbook"], ["get-matched/?need=funding", "Get matched with lenders", "Free, no credit impact"]] },
    grow: { label: "Grow sales", items: [["guides/small-business-marketing-plan.html", "Build a 90-day marketing plan", "Channels, budget, metrics"], ["tools/ltv-cac-calculator.html", "Check unit economics", "LTV:CAC calculator"], ["guides/how-to-price-products-and-services.html", "Fix your pricing", "Pricing playbook"], ["guides/how-to-build-a-business-website.html", "Upgrade your website", "Website guide"], ["get-matched/?need=marketing", "Get matched with marketers", "Vetted specialists"]] },
    run: { label: "Run and manage", items: [["guides/bookkeeping-basics.html", "Set up clean books", "Bookkeeping basics"], ["tools/invoice-generator.html", "Send a professional invoice", "Invoice generator"], ["tools/profit-margin-calculator.html", "Know your margins", "Profit margin calculator"], ["tools/cash-runway-calculator.html", "Forecast your runway", "Cash runway calculator"], ["get-matched/?need=accounting", "Get matched with an accountant", "Bookkeeping and tax help"]] },
    hire: { label: "Hire people", items: [["guides/how-to-hire-your-first-employee.html", "Plan your first hire", "Step-by-step guide"], ["tools/employee-cost-calculator.html", "Know the true cost", "Employee cost calculator"], ["tools/freelance-rate-calculator.html", "Compare contractor rates", "Freelance rate calculator"], ["careers/", "Find talent in our network", "Expert network"], ["get-matched/?need=hiring", "Get matched with HR help", "Payroll and hiring"]] }
  };
  function picker() {
    var box = $("[data-path-picker]"), rc = $("#receipt"); if (!box || !rc) return;
    function print(key, animate) {
      var p = PATHS[key] || PATHS.start;
      $$(".chip", box).forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-path") === key ? "true" : "false"); });
      var d = new Date();
      rc.innerHTML = '<span class="stamp">FREE</span><h2>Your plan: ' + esc(p.label) + '</h2><div class="r-meta"><span>Business4U.com</span><span>' + d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) + "</span></div><ol>" +
        p.items.map(function (it) { return '<li><a href="' + u(it[0]) + '">' + esc(it[1]) + "<small>" + esc(it[2]) + '</small></a><span class="amt">$0.00</span></li>'; }).join("") +
        '</ol><div class="total"><span>Total to you</span><span>$0.00</span></div>';
      if (animate) { rc.classList.remove("printing"); void rc.offsetWidth; rc.classList.add("printing"); }
      store("b4u-path", key);
    }
    $$(".chip", box).forEach(function (c) { c.addEventListener("click", function () { print(c.getAttribute("data-path"), true); }); });
    print(store("b4u-path") || "start", false);
  }

  /* Home lead starter: carries answers into Get Matched */
  function starter() {
    var f = $("#starter"); if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = new URLSearchParams(new FormData(f)).toString();
      location.href = u("get-matched/") + "?" + q;
    });
  }

  /* Data teasers on home */
  function teasers() {
    var n = $("[data-news-teaser]");
    if (n) fetch(u("data/news.json")).then(function (r) { return r.json(); }).then(function (d) {
      var items = (d.items || []).slice(0, 6);
      if (!items.length) return;
      n.innerHTML = items.map(function (it) { return '<li><a href="' + esc(it.u) + '" target="_blank" rel="noopener nofollow">' + esc(it.t) + '</a><span class="src">' + esc(it.s) + (it.d ? ", " + new Date(it.d).toLocaleDateString() : "") + "</span></li>"; }).join("");
    }).catch(function () {});
  }

  function active() {
    var p = location.pathname;
    $$(".nav .menu a").forEach(function (a) { if (a.pathname === p) a.setAttribute("aria-current", "page"); });
  }

  function init() {
    header(); footer(); ads(); forms(); yt(); tips(); cookie(); slidein(); picker(); starter(); teasers(); active();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})();
