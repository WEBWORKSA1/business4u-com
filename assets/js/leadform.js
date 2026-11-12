/* Business4U.com Get Matched: multi-step lead form with branching, prefill, scoring and duplicate guard */
(function () {
  "use strict";
  var U = window.B4Uutil, $ = U.$, $$ = U.$$;
  var f = $("#match"); if (!f) return;
  var steps = $$(".step", f), bar = $(".progress i", f), label = $("#step-label"), cur = 0;
  var NEED = { funding: "Funding or a business loan", formation: "Registering or forming a business", website: "Website or online store", marketing: "Marketing and customers", accounting: "Bookkeeping, accounting or tax", insurance: "Business insurance", legal: "Legal help or contracts", hiring: "Hiring, payroll or HR", mentor: "Mentor or business plan help" };

  /* Prefill from URL */
  var q = new URLSearchParams(location.search);
  if (q.get("need") && NEED[q.get("need")]) { var r = f.querySelector('input[name=need][value="' + q.get("need") + '"]'); if (r) r.checked = true; }
  if (q.get("when") && f.timeline) f.timeline.value = q.get("when");
  if (q.get("score")) f.readiness_score.value = q.get("score");
  if (q.get("idea")) f.idea.value = q.get("idea");

  function need() { var c = f.querySelector("input[name=need]:checked"); return c ? c.value : ""; }
  function branch() {
    var isF = need() === "funding";
    $$(".if-funding", f).forEach(function (b) { b.hidden = !isF; $$("select,input,textarea", b).forEach(function (el) { el.disabled = !isF; }); });
    $$(".if-other", f).forEach(function (b) { b.hidden = isF; $$("select,input,textarea", b).forEach(function (el) { el.disabled = isF; }); });
  }
  function show(i) {
    steps.forEach(function (s, j) { s.classList.toggle("on", j === i); });
    cur = i; bar.style.width = ((i + 1) / steps.length * 100) + "%";
    label.textContent = "Step " + (i + 1) + " of " + steps.length;
    var h = $("h2", steps[i]); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    var top = f.getBoundingClientRect().top + scrollY - 90; if (scrollY > top) scrollTo({ top: top, behavior: "smooth" });
  }
  function valid(i) {
    var els = $$("input,select,textarea", steps[i]).filter(function (el) { return !el.disabled; });
    for (var k = 0; k < els.length; k++) { if (!els[k].checkValidity()) { els[k].reportValidity(); return false; } }
    return true;
  }
  f.addEventListener("change", function (e) { if (e.target.name === "need") branch(); });
  f.addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t) return;
    if (t.hasAttribute("data-next")) { e.preventDefault(); if (valid(cur)) { branch(); show(Math.min(cur + 1, steps.length - 1)); } }
    if (t.hasAttribute("data-back")) { e.preventDefault(); show(Math.max(cur - 1, 0)); }
  });

  function score(d) {
    var s = 0;
    s += { idea: 5, new: 12, est1: 20, est3: 25 }[d.stage] || 0;
    s += { r0: 0, r1: 8, r2: 15, r3: 20, r4: 25 }[d.monthly_revenue] || 0;
    s += { asap: 25, "30d": 20, "90d": 10, research: 2 }[d.timeline] || 0;
    if (d.need === "funding") s += { a1: 5, a2: 10, a3: 15, a4: 20, a5: 25, a6: 25 }[d.amount] || 0; else s += { b1: 5, b2: 12, b3: 20, b4: 25 }[d.budget] || 0;
    return Math.min(100, s);
  }

  f.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!valid(cur)) return;
    var d = {};
    $$("input,select,textarea", f).forEach(function (el) {
      if (!el.name || el.disabled || el.name === "_honey") return;
      if ((el.type === "radio" || el.type === "checkbox") && !el.checked) return;
      var v = el.tagName === "SELECT" && el.selectedIndex > -1 ? el.options[el.selectedIndex].text + " [" + el.value + "]" : el.value;
      d[el.name] = d[el.name] ? d[el.name] + ", " + v : v;
    });
    if (f._honey.value) return;
    var raw = {}; $$("select", f).forEach(function (el) { raw[el.name] = el.value; });
    raw.stage = (f.querySelector("input[name=stage]:checked") || {}).value; raw.need = need();
    var sc = score(raw); d.lead_score = sc; d.need = NEED[raw.need] || raw.need;
    var key = "b4u-lead-" + (d.email || "").toLowerCase() + raw.need, last = U.store(key);
    var subject = (sc >= 70 ? "[HOT] " : sc >= 45 ? "[WARM] " : "") + "New lead: " + (NEED[raw.need] || "General") + " | " + (raw.country || "");
    var btn = $("button[type=submit]", f), msg = $(".form-msg", f);
    function done() { f.hidden = true; var ok = $("#lead-ok"); ok.classList.add("show"); $("#ok-need").textContent = (NEED[raw.need] || "your request").toLowerCase(); recs(raw.need); ok.focus(); U.store(key, Date.now()); }
    if (last && Date.now() - last < 6e5) { done(); return; }
    btn.disabled = true; btn.textContent = "Sending...";
    U.send(d, subject).then(done).catch(function () { msg.className = "form-msg err"; msg.textContent = "We couldn't send that. Check your connection and try again."; btn.disabled = false; btn.textContent = "Get my matches"; });
  });

  function recs(n) {
    var R = {
      funding: [["tools/funding-readiness-score.html", "Check your funding readiness score"], ["tools/business-loan-calculator.html", "Model repayments"], ["funding/", "Browse funding programs"]],
      formation: [["guides/llc-vs-sole-proprietorship-vs-corporation.html", "Compare business structures"], ["tools/business-name-generator.html", "Shortlist names"], ["guides/how-to-start-a-business.html", "Follow the launch checklist"]],
      website: [["guides/how-to-build-a-business-website.html", "Website guide"], ["tools/business-name-generator.html", "Find a domain-ready name"], ["guides/small-business-marketing-plan.html", "Plan your launch marketing"]],
      marketing: [["guides/small-business-marketing-plan.html", "90-day marketing plan"], ["tools/ltv-cac-calculator.html", "LTV:CAC calculator"], ["guides/ai-tools-for-small-business.html", "AI tools for marketing"]],
      accounting: [["guides/bookkeeping-basics.html", "Bookkeeping basics"], ["tools/invoice-generator.html", "Invoice generator"], ["tools/profit-margin-calculator.html", "Profit margin calculator"]],
      hiring: [["guides/how-to-hire-your-first-employee.html", "Hire your first employee"], ["tools/employee-cost-calculator.html", "Employee cost calculator"], ["careers/", "Our expert network"]]
    };
    var list = R[n] || [["guides/", "Browse guides"], ["tools/", "Free tools"], ["videos/", "Video academy"]];
    $("#ok-recs").innerHTML = list.map(function (l) { return '<li><a href="' + U.u(l[0]) + '">' + U.esc(l[1]) + "</a></li>"; }).join("");
  }
  branch(); show(0);
})();
