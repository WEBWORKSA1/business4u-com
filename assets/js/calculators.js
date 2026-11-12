/* Business4U.com calculator engine + shared tool helpers */
(function () {
  "use strict";
  var U = window.B4Uutil || {};
  var $ = U.$, $$ = U.$$, esc = U.esc;
  var CURS = { USD: "en-US", CAD: "en-CA", GBP: "en-GB", EUR: "en-IE", INR: "en-IN", AUD: "en-AU" };
  var cur = (U.store && U.store("b4u-cur")) || "USD";
  if (!CURS[cur]) cur = "USD";
  function sym() { try { return new Intl.NumberFormat(CURS[cur], { style: "currency", currency: cur }).formatToParts(0).filter(function (p) { return p.type === "currency"; })[0].value; } catch (e) { return "$"; } }
  function ok(n) { return typeof n === "number" && isFinite(n); }
  function money(n, dp) { if (!ok(n)) return "—"; return new Intl.NumberFormat(CURS[cur], { style: "currency", currency: cur, minimumFractionDigits: dp == null ? (Math.abs(n) < 1000 ? 2 : 0) : dp, maximumFractionDigits: dp == null ? (Math.abs(n) < 1000 ? 2 : 0) : dp }).format(n); }
  function pct(n) { return ok(n) ? (Math.round(n * 10) / 10).toLocaleString(CURS[cur]) + "%" : "—"; }
  function num(n, d) { return ok(n) ? n.toLocaleString(CURS[cur], { maximumFractionDigits: d == null ? 2 : d }) : "—"; }
  function curSelect(onchange) {
    var s = '<label class="cur">Currency <select>' + Object.keys(CURS).map(function (c) { return "<option" + (c === cur ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select></label>";
    var w = document.createElement("div"); w.innerHTML = s; var el = w.firstChild;
    el.querySelector("select").addEventListener("change", function () { cur = this.value; U.store("b4u-cur", cur); onchange(); });
    return el;
  }
  window.B4Ucalc = { money: money, pct: pct, num: num, sym: sym, cur: function () { return cur; }, curSelect: curSelect };

  /* Input tuple: [id, label, type(money|pct|num|sel), default, hint, options]; ["#", heading] = group heading */
  var D = {
    "break-even": {
      inputs: [["fixed", "Fixed costs per month", "money", 8000, "Rent, salaries, software, insurance: costs that don't change with sales"], ["price", "Selling price per unit", "money", 50], ["vc", "Variable cost per unit", "money", 20, "Materials, packaging, shipping and payment fees per sale"], ["target", "Target monthly profit (optional)", "money", 0]],
      calc: function (v) {
        var cm = v.price - v.vc;
        if (cm <= 0) return { big: ["Break-even units per month", "Not reachable"], rows: [], verdict: "Your price must be higher than your variable cost per unit, otherwise every sale loses money." };
        var units = v.fixed / cm, t = (v.fixed + v.target) / cm;
        var r = { big: ["Break-even units per month", num(Math.ceil(units), 0)], rows: [["Break-even revenue per month", money(units * v.price)], ["Contribution margin per unit", money(cm)], ["Contribution margin ratio", pct(cm / v.price * 100)], ["Units per day (30-day month)", num(units / 30, 1)]] };
        if (v.target > 0) r.rows.push(["Units needed for target profit", num(Math.ceil(t), 0)], ["Revenue needed for target profit", money(t * v.price)]);
        r.verdict = "Every unit sold after " + num(Math.ceil(units), 0) + " adds " + money(cm) + " of profit.";
        return r;
      }
    },
    "profit-margin": {
      inputs: [["rev", "Revenue", "money", 120000, "Total sales for the period"], ["cogs", "Cost of goods sold", "money", 54000, "Direct costs to make or deliver what you sold"], ["opex", "Operating expenses", "money", 38000, "Rent, wages, marketing, software, admin"], ["tax", "Income tax rate", "pct", 21]],
      calc: function (v) {
        if (v.rev <= 0) return { big: ["Net profit margin", "—"], rows: [], verdict: "Enter revenue above zero." };
        var g = v.rev - v.cogs, op = g - v.opex, tx = Math.max(op, 0) * v.tax / 100, net = op - tx, nm = net / v.rev * 100;
        var verdict = nm < 0 ? "You're losing money after expenses. Check pricing first, then the largest operating cost." : nm < 10 ? "Thin but positive. A 5% price increase would lift net margin noticeably; test it on new customers." : nm < 20 ? "Healthy for most small businesses. Protect it by reviewing costs quarterly." : "Strong margin. Consider reinvesting part of it in growth.";
        return { big: ["Net profit margin", pct(nm)], rows: [["Gross profit", money(g)], ["Gross margin", pct(g / v.rev * 100)], ["Operating profit", money(op)], ["Operating margin", pct(op / v.rev * 100)], ["Estimated income tax", money(tx)], ["Net profit", money(net)]], verdict: verdict };
      }
    },
    "markup": {
      inputs: [["cost", "Unit cost", "money", 40, "What one unit costs you, all-in"], ["mk", "Markup", "pct", 60, "Percentage added on top of cost"], ["tm", "Target gross margin", "pct", 45, "Percentage of the selling price you keep as gross profit"]],
      calc: function (v) {
        var p1 = v.cost * (1 + v.mk / 100), m1 = v.mk / (100 + v.mk) * 100;
        var p2 = v.tm < 100 ? v.cost / (1 - v.tm / 100) : NaN, mk2 = v.tm < 100 ? v.tm / (100 - v.tm) * 100 : NaN;
        return { big: ["Price at " + num(v.mk, 1) + "% markup", money(p1)], rows: [["Profit per unit at that markup", money(p1 - v.cost)], ["Equivalent gross margin", pct(m1)], ["Price for " + num(v.tm, 1) + "% margin", money(p2)], ["Markup needed for that margin", pct(mk2)], ["Profit per unit at target margin", money(p2 - v.cost)]], verdict: "Markup is measured against cost; margin is measured against price. A 50% markup is only a 33.3% margin." };
      }
    },
    "business-loan": {
      inputs: [["amt", "Loan amount", "money", 50000], ["apr", "Interest rate (APR)", "pct", 9.5], ["term", "Term in months", "num", 60], ["fee", "Origination fee", "pct", 2, "Upfront fee deducted from the loan, if any"]],
      calc: function (v) {
        var n = Math.max(1, Math.round(v.term)), r = v.apr / 1200;
        var pmt = r ? v.amt * r / (1 - Math.pow(1 + r, -n)) : v.amt / n;
        var total = pmt * n, interest = total - v.amt, fee = v.amt * v.fee / 100, net = v.amt - fee;
        var lo = 0, hi = 1, mid = 0;
        for (var i = 0; i < 80; i++) { mid = (lo + hi) / 2; var pv = mid ? pmt * (1 - Math.pow(1 + mid, -n)) / mid : pmt * n; if (pv > net) lo = mid; else hi = mid; }
        var bal = v.amt, rows = "";
        for (var m = 1; m <= n && m <= 600; m++) { var it = bal * r, pr = pmt - it; bal = Math.max(0, bal - pr); rows += "<tr><td>" + m + "</td><td>" + money(pmt, 2) + "</td><td>" + money(pr, 2) + "</td><td>" + money(it, 2) + "</td><td>" + money(bal, 2) + "</td></tr>"; }
        return { big: ["Monthly payment", money(pmt, 2)], rows: [["Total interest", money(interest)], ["Origination fee", money(fee)], ["Total cost of borrowing", money(interest + fee)], ["Total repaid", money(total)], ["Cash you actually receive", money(net)], ["True APR including fee", pct(mid * 1200)]],
          verdict: "Lenders like total debt payments to stay under roughly a third of monthly cash flow. Check this payment against your runway.",
          extra: '<details class="sched-d"><summary>Show the full repayment schedule</summary><div class="sched"><table><thead><tr><th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>' + rows + "</tbody></table></div></details>" };
      }
    },
    "startup-cost": {
      inputs: [["#", "One-time launch costs"], ["reg", "Registration, licences and permits", "money", 600], ["equip", "Equipment and tools", "money", 5000], ["inv", "Opening inventory", "money", 3000], ["brand", "Website, logo and branding", "money", 1500], ["dep", "Deposits and fit-out", "money", 2500], ["pro", "Legal and accounting setup", "money", 900], ["oth1", "Other one-time costs", "money", 1000],
        ["#", "Monthly operating costs"], ["rent", "Rent and utilities", "money", 1600], ["pay", "Payroll (including yours)", "money", 3000], ["soft", "Software and subscriptions", "money", 150], ["mkt", "Marketing", "money", 600], ["oth2", "Insurance and other", "money", 350],
        ["#", "Safety net"], ["rev", "Expected monthly revenue at first", "money", 2500], ["months", "Months of reserve", "num", 6], ["cont", "Contingency buffer", "pct", 10]],
      calc: function (v) {
        var one = v.reg + v.equip + v.inv + v.brand + v.dep + v.pro + v.oth1, mo = v.rent + v.pay + v.soft + v.mkt + v.oth2;
        var burn = Math.max(mo - v.rev, 0), reserve = burn * v.months, total = (one + reserve) * (1 + v.cont / 100);
        var parts = [["equipment", v.equip], ["inventory", v.inv], ["deposits and fit-out", v.dep], ["branding", v.brand], ["payroll reserve", v.pay * v.months]].sort(function (a, b) { return b[1] - a[1]; });
        return { big: ["Total startup capital needed", money(total)], rows: [["One-time launch costs", money(one)], ["Monthly operating costs", money(mo)], ["Net monthly burn after revenue", money(burn)], ["Reserve for " + num(v.months, 0) + " months", money(reserve)], ["Contingency", money((one + reserve) * v.cont / 100)]], verdict: "Your biggest cost driver is " + parts[0][0] + ". Leasing or buying used there is usually the fastest way to cut the total." };
      }
    },
    "cash-runway": {
      inputs: [["cash", "Cash in the bank", "money", 60000], ["rev", "Monthly revenue", "money", 9000], ["exp", "Monthly expenses", "money", 16000], ["g", "Monthly revenue growth", "pct", 4], ["eg", "Monthly expense growth", "pct", 1]],
      calc: function (v) {
        var c = v.cash, r = v.rev, e = v.exp, run = null, pos = null, c12 = null;
        for (var m = 1; m <= 120; m++) {
          var net = r - e;
          if (net >= 0 && pos === null) pos = m;
          if (c + net < 0 && run === null) { run = m - 1 + c / -net; }
          c += net; if (m === 12) c12 = c;
          r *= 1 + v.g / 100; e *= 1 + v.eg / 100;
          if (run !== null) break;
        }
        var burn = v.exp - v.rev, zero = "";
        if (run !== null) { var d = new Date(); d.setMonth(d.getMonth() + Math.floor(run)); zero = d.toLocaleDateString(undefined, { month: "long", year: "numeric" }); }
        return { big: ["Cash runway", run === null ? (pos ? "Cash-flow positive" : "10+ years") : num(run, 1) + " months"], rows: [["Current net burn per month", burn > 0 ? money(burn) : "None (profitable)"], ["Estimated zero-cash month", zero || "Not within 10 years"], ["Cash after 12 months", c12 === null ? "Runs out first" : money(c12)], ["Month you turn cash-flow positive", pos === 1 ? "Already" : pos ? "Month " + pos : "Not within forecast"]],
          verdict: run !== null && run < 6 ? "Under 6 months of runway: start fundraising or cutting costs now. Lenders and investors take 2 to 4 months." : "Re-run this monthly with real numbers. Runway is the clock every other decision depends on." };
      }
    },
    "roi": {
      inputs: [["inv", "Amount invested", "money", 10000], ["ret", "Total value returned", "money", 16500, "Revenue or value created by the investment, including any resale value"], ["yrs", "Period in years", "num", 2]],
      calc: function (v) {
        if (v.inv <= 0) return { big: ["Return on investment", "—"], rows: [], verdict: "Enter an investment above zero." };
        var gain = v.ret - v.inv, roi = gain / v.inv * 100, ann = v.yrs > 0 && v.ret > 0 ? (Math.pow(v.ret / v.inv, 1 / v.yrs) - 1) * 100 : NaN;
        return { big: ["Return on investment", pct(roi)], rows: [["Net gain", money(gain)], ["Annualized return", pct(ann)], ["Value multiple", num(v.ret / v.inv, 2) + "x"]], verdict: ann > 15 ? "Strong annualized return. Check whether it repeats or was a one-off." : "Compare the annualized figure with your cost of borrowing. If a loan costs more, the investment destroys value." };
      }
    },
    "freelance-rate": {
      inputs: [["inc", "Take-home income goal per year", "money", 80000], ["exp", "Business expenses per year", "money", 9000, "Software, equipment, insurance, workspace, training"], ["tax", "Tax rate on profit", "pct", 28], ["hpw", "Billable hours per week", "num", 25, "Most freelancers bill 50% to 70% of the hours they work"], ["wks", "Working weeks per year", "num", 46], ["buf", "Profit and slow-month buffer", "pct", 15]],
      calc: function (v) {
        var pre = v.tax < 100 ? v.inc / (1 - v.tax / 100) : NaN, rev = (pre + v.exp) * (1 + v.buf / 100), hrs = v.hpw * v.wks, rate = hrs > 0 ? rev / hrs : NaN;
        return { big: ["Minimum hourly rate", money(rate, 0)], rows: [["Day rate (" + num(v.hpw / 5, 1) + " billable hrs)", money(rate * v.hpw / 5, 0)], ["Monthly revenue target", money(rev / 12, 0)], ["Annual revenue target", money(rev, 0)], ["Billable hours per year", num(hrs, 0)]], verdict: "Quote projects at this rate times your estimated hours, then add 20% for revisions and admin you didn't plan for." };
      }
    },
    "employee-cost": {
      inputs: [["sal", "Annual salary", "money", 52000], ["ptax", "Employer payroll taxes", "pct", 9, "Social security, Medicare, unemployment, CPP/EI or NI"], ["ben", "Benefits per month", "money", 450, "Health, dental, retirement match"], ["bonus", "Bonus or commission", "pct", 3], ["eq", "Equipment, software and training per year", "money", 2500], ["ovh", "Workspace overhead", "pct", 5], ["hpw", "Hours per week", "num", 40]],
      calc: function (v) {
        var taxes = v.sal * v.ptax / 100, bonus = v.sal * v.bonus / 100, ben = v.ben * 12, ovh = v.sal * v.ovh / 100, total = v.sal + taxes + bonus + ben + v.eq + ovh;
        return { big: ["True annual cost", money(total, 0)], rows: [["Per month", money(total / 12, 0)], ["Fully loaded hourly cost", money(total / (v.hpw * 52), 2)], ["Cost as a multiple of salary", num(total / v.sal, 2) + "x"], ["Payroll taxes", money(taxes, 0)], ["Benefits", money(ben, 0)], ["Bonus, equipment and overhead", money(bonus + v.eq + ovh, 0)]], verdict: "The hire pays for itself when the revenue or time they free up exceeds " + money(total / 12, 0) + " a month." };
      }
    },
    "ltv-cac": {
      inputs: [["aov", "Average order value", "money", 85], ["freq", "Purchases per customer per year", "num", 4], ["gm", "Gross margin", "pct", 55], ["life", "Customer lifespan in years", "num", 3], ["spend", "Marketing and sales spend", "money", 6000, "For one period, such as a month"], ["newc", "New customers in that period", "num", 60]],
      calc: function (v) {
        var gp = v.aov * v.freq * v.gm / 100, ltv = gp * v.life, cac = v.newc > 0 ? v.spend / v.newc : NaN, ratio = ltv / cac, pb = gp > 0 ? cac / (gp / 12) : NaN;
        var verdict = !ok(ratio) ? "Enter new customers above zero." : ratio < 1 ? "You pay more to win a customer than they're worth. Cut the weakest channel or raise prices." : ratio < 3 ? "Profitable but tight. Most investors look for at least 3:1." : ratio > 5 ? "Very efficient. You may be under-investing in growth." : "Healthy. You can scale spend on the channels producing this ratio.";
        return { big: ["LTV to CAC ratio", ok(ratio) ? num(ratio, 1) + " : 1" : "—"], rows: [["Customer lifetime value", money(ltv)], ["Customer acquisition cost", money(cac)], ["CAC payback period", ok(pb) ? num(pb, 1) + " months" : "—"], ["Gross profit per customer per year", money(gp)]], verdict: verdict };
      }
    },
    "business-valuation": {
      inputs: [["rev", "Annual revenue", "money", 650000], ["sde", "Seller's discretionary earnings (SDE)", "money", 160000, "Net profit + owner's salary + one-off and non-cash expenses"], ["ml", "SDE multiple, low", "num", 2], ["mh", "SDE multiple, high", "num", 3.5], ["rm", "Revenue multiple", "num", 0.6, "Used as a cross-check"], ["assets", "Inventory and assets sold on top", "money", 25000]],
      calc: function (v) {
        var lo = v.sde * v.ml + v.assets, hi = v.sde * v.mh + v.assets, rv = v.rev * v.rm + v.assets, mid = (lo + hi) / 2, blend = mid * 0.7 + rv * 0.3;
        return { big: ["Estimated value range", money(lo, 0) + " to " + money(hi, 0)], rows: [["SDE-based midpoint", money(mid, 0)], ["Revenue-based cross-check", money(rv, 0)], ["Blended estimate", money(blend, 0)], ["SDE margin", pct(v.rev > 0 ? v.sde / v.rev * 100 : NaN)]], verdict: "Owner-operated businesses are often priced at roughly 1.5x to 4x SDE. Lower owner dependence, recurring revenue and clean books push you toward the top." };
      }
    },
    "sales-tax": {
      inputs: [["mode", "What do you want to do?", "sel", "add", "", [["add", "Add tax to a price"], ["remove", "Remove tax from a total"]]], ["amt", "Amount", "money", 100], ["rate", "Tax rate (sales tax, GST, HST or VAT)", "pct", 13]],
      calc: function (v) {
        var r = v.rate / 100, net, tax, gross;
        if (v.mode === "remove") { gross = v.amt; net = v.amt / (1 + r); tax = gross - net; } else { net = v.amt; tax = v.amt * r; gross = net + tax; }
        return { big: [v.mode === "remove" ? "Price before tax" : "Total including tax", money(v.mode === "remove" ? net : gross, 2)], rows: [["Net amount", money(net, 2)], ["Tax", money(tax, 2)], ["Gross amount", money(gross, 2)]], verdict: "Rates vary by city, state, province and product type. Confirm the rate with your tax authority before you invoice." };
      }
    }
  };

  function build(el) {
    var id = el.getAttribute("data-calc"), def = D[id]; if (!def) return;
    var params = new URLSearchParams(location.search);
    el.className = "calc";
    var fields = def.inputs.map(function (f) {
      if (f[0] === "#") return "<h3>" + esc(f[1]) + "</h3>";
      var val = params.has(f[0]) ? params.get(f[0]) : f[3], fid = id + "-" + f[0], hint = f[4] ? '<span class="hint">' + esc(f[4]) + "</span>" : "";
      if (f[2] === "sel") return '<div class="field"><label for="' + fid + '">' + esc(f[1]) + '</label><select id="' + fid + '" name="' + f[0] + '">' + f[5].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === val ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>" + hint + "</div>";
      var inp = '<input id="' + fid + '" name="' + f[0] + '" type="number" inputmode="decimal" step="any" value="' + esc(val) + '">';
      if (f[2] === "money") inp = '<div class="money"><b data-sym>' + esc(sym()) + "</b>" + inp + "</div>";
      if (f[2] === "pct") inp = '<div class="pct">' + inp + "<b>%</b></div>";
      return '<div class="field"><label for="' + fid + '">' + esc(f[1]) + "</label>" + inp + hint + "</div>";
    }).join("");
    el.innerHTML = '<form class="calc-in" novalidate onsubmit="return false"></form><div class="calc-out" aria-live="polite"><div class="out"></div><div class="calc-tools no-print"><button type="button" class="btn btn-sm" data-act="copy">Copy results</button><button type="button" class="btn btn-sm btn-ghost" data-act="link">Copy share link</button><button type="button" class="btn btn-sm btn-ghost" data-act="print">Print</button><button type="button" class="btn btn-sm btn-ghost" data-act="reset">Reset</button></div></div>';
    var form = $("form", el), out = $(".out", el);
    form.appendChild(curSelect(run));
    form.insertAdjacentHTML("beforeend", fields);
    function vals() {
      var v = {};
      def.inputs.forEach(function (f) { if (f[0] === "#") return; var x = form.elements[f[0]]; v[f[0]] = f[2] === "sel" ? x.value : (parseFloat(x.value) || 0); });
      return v;
    }
    var last = null;
    function run() {
      $$("[data-sym]", form).forEach(function (b) { b.textContent = sym(); });
      var r = def.calc(vals()); last = r;
      out.innerHTML = '<div class="res big"><span>' + esc(r.big[0]) + "</span><strong>" + esc(r.big[1]) + "</strong></div>" +
        r.rows.map(function (x) { return '<div class="res"><span>' + esc(x[0]) + "</span><strong>" + esc(x[1]) + "</strong></div>"; }).join("") +
        (r.verdict ? '<p class="verdict">' + esc(r.verdict) + "</p>" : "") + (r.extra || "");
    }
    form.addEventListener("input", run);
    form.addEventListener("change", run);
    el.addEventListener("click", function (e) {
      var a = e.target.getAttribute && e.target.getAttribute("data-act"); if (!a) return;
      if (a === "print") window.print();
      if (a === "reset") { def.inputs.forEach(function (f) { if (f[0] !== "#") form.elements[f[0]].value = f[3]; }); run(); }
      if (a === "copy" && last) copy(document.title.split("|")[0].trim() + "\n" + last.big[0] + ": " + last.big[1] + "\n" + last.rows.map(function (x) { return x[0] + ": " + x[1]; }).join("\n") + "\n" + location.href.split("?")[0], "Results copied");
      if (a === "link") { var p = new URLSearchParams(); def.inputs.forEach(function (f) { if (f[0] !== "#") p.set(f[0], form.elements[f[0]].value); }); copy(location.href.split("?")[0] + "?" + p.toString(), "Share link copied"); }
    });
    run();
  }
  function copy(t, msg) {
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { U.toast(msg); }, function () { U.toast("Copy failed. Select and copy manually."); });
    else U.toast("Copy not supported in this browser");
  }
  window.B4Ucalc.copy = copy;

  /* Related tools list */
  var TOOLS = [
    ["break-even-calculator.html", "Break-even calculator"], ["profit-margin-calculator.html", "Profit margin calculator"], ["markup-calculator.html", "Markup and margin calculator"], ["business-loan-calculator.html", "Business loan calculator"], ["startup-cost-calculator.html", "Startup cost calculator"], ["cash-runway-calculator.html", "Cash runway calculator"], ["roi-calculator.html", "ROI calculator"], ["freelance-rate-calculator.html", "Freelance rate calculator"], ["employee-cost-calculator.html", "Employee cost calculator"], ["ltv-cac-calculator.html", "LTV:CAC calculator"], ["business-valuation-calculator.html", "Business valuation calculator"], ["sales-tax-calculator.html", "Sales tax, GST and VAT calculator"], ["business-name-generator.html", "Business name generator"], ["invoice-generator.html", "Invoice generator"], ["business-plan-builder.html", "One-page business plan builder"], ["business-idea-quiz.html", "Business Match idea quiz"], ["funding-readiness-score.html", "Funding readiness score"]
  ];
  function related() {
    var box = $("[data-related]"); if (!box) return;
    var here = location.pathname.split("/").pop();
    var list = TOOLS.filter(function (t) { return t[0] !== here; });
    var start = Math.abs(here.length * 7) % list.length, pick = [];
    for (var i = 0; i < 6; i++) pick.push(list[(start + i * 3) % list.length]);
    box.innerHTML = '<h3 style="font-size:1.05rem">More free tools</h3><ul class="list-links">' + pick.map(function (t) { return '<li><a href="' + U.u("tools/" + t[0]) + '">' + esc(t[1]) + "</a></li>"; }).join("") + '</ul><p style="margin:12px 0 0"><a href="' + U.u("tools/") + '">See all tools</a></p>';
  }

  function init() { $$("[data-calc]").forEach(build); related(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
