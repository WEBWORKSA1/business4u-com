/* Business4U.com interactive builders: name generator, invoice, plan builder, Business Match quiz, funding readiness */
(function () {
  "use strict";
  var U = window.B4Uutil, K = window.B4Ucalc;
  var $ = U.$, $$ = U.$$, esc = U.esc;
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

  /* ---------- Business name generator ---------- */
  function namegen() {
    var f = $("#namegen"); if (!f) return;
    var out = $("#names"), favBox = $("#favs"), favs = U.store("b4u-favs") || [], round = 0;
    var PRE = ["Get", "Try", "Go", "My", "Pro", "Smart", "True", "Bright", "Bold", "Next", "Prime", "Clear", "Swift", "Peak", "Nova", "Ever", "Urban", "North", "Blue", "Good"];
    var SUF = ["ly", "ify", "io", "hub", "lab", "works", "co", "base", "nest", "craft", "wise", "spot", "point", "house", "studio", "path", "pilot", "mint", "forge", "loop", "able", "ster", "wave", "field"];
    var IND = {
      general: ["Works", "Group", "Labs", "Hub", "Point", "Way", "Line", "Collective"],
      food: ["Kitchen", "Table", "Bites", "Pantry", "Spoon", "Harvest", "Plate", "Oven"],
      tech: ["Byte", "Logic", "Cloud", "Pixel", "Code", "Signal", "Stack", "Data"],
      retail: ["Market", "Goods", "Supply", "Store", "Corner", "Trade", "Outlet", "Shelf"],
      services: ["Partners", "Solutions", "Pros", "Advisors", "Crew", "Assist", "Experts", "Care"],
      creative: ["Studio", "Canvas", "Ink", "Frame", "Muse", "Atelier", "Lens", "Palette"],
      health: ["Well", "Vital", "Glow", "Balance", "Pulse", "Bloom", "Restore", "Thrive"],
      finance: ["Capital", "Ledger", "Vault", "Fund", "Wealth", "Coin", "Equity", "Trust"],
      home: ["Nest", "Haven", "Hearth", "Build", "Fix", "Room", "Keystone", "Yard"]
    };
    var STY = {
      modern: function (b, w) { return [b + "ly", b + "ify", dropVowel(b), "Go" + b, b + w.toLowerCase()]; },
      classic: function (b, w) { return [b + " & Co.", b + " House", b + " Trading Company", "The " + b + " " + w, b + " Brothers"]; },
      playful: function (b, w) { return [b + "oo", b + "zy", b + "pop", b + "berry", "Happy " + b]; },
      techy: function (b, w) { return [b + "AI", b + "io", b + "Stack", b + "Labs", "Hyper" + b.toLowerCase()]; },
      luxury: function (b, w) { return ["Maison " + b, b + " Reserve", "Noble " + b, b + " Luxe", "Velvet " + b]; },
      local: function (b, w, town) { var t = town ? cap(town.split(/\s+/)[0]) : "Main Street"; return [t + " " + b, b + " of " + t, t + " " + w, t + " " + b + " Co.", b + " " + t]; }
    };
    function dropVowel(b) { var m = b.match(/^(.*)[aeiou]([^aeiou]*)$/i); return m && m[1].length > 2 ? m[1] + m[2] : b + "r"; }
    function join(a, b) { if (/[aeiouy]$/i.test(a) && /^[aeiouy]/i.test(b)) return a + b.slice(1); return a + b; }
    function blend(a, b) { return a.slice(0, Math.ceil(a.length * 0.6)) + b.slice(Math.floor(b.length * 0.4)).toLowerCase(); }
    function seedRand(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
    function slug(n) { return n.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, ""); }
    function gen() {
      var kw = f.kw.value.trim().replace(/[^a-zA-Z\s]/g, ""), ind = IND[f.ind.value] || IND.general, sty = f.sty.value, max = parseInt(f.max.value, 10) || 16, town = f.town.value.trim();
      if (!kw) { out.innerHTML = '<p class="empty">Type a word that describes your business, like "bake", "clean" or "ledger".</p>'; return; }
      var words = kw.split(/\s+/).filter(Boolean).slice(0, 2).map(cap), b = words.join(""), c = [];
      PRE.forEach(function (p) { c.push(p + b); });
      SUF.forEach(function (s) { c.push(join(b, s)); });
      ind.forEach(function (w) { c.push(b + " " + w); c.push(w + " " + b); c.push(blend(b, w)); });
      if (words.length > 1) c.push(words[1] + words[0], words[0] + " & " + words[1]);
      ["modern", "classic", "playful", "techy", "luxury", "local"].forEach(function (k) {
        var arr = STY[k](b, ind[0], town); if (k === sty || sty === "any") { c = arr.concat(arr, c); } else c = c.concat(arr.slice(0, 1));
      });
      var seen = {}, rnd = seedRand(kw + sty + f.ind.value + round), res = [];
      c.forEach(function (n) { var k = slug(n); if (!k || seen[k] || k.length > max || k.length < 4) return; seen[k] = 1; res.push(n); });
      for (var i = res.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = res[i]; res[i] = res[j]; res[j] = t; }
      res = res.slice(0, 48);
      out.innerHTML = res.length ? res.map(card).join("") : '<p class="empty">No names fit that length. Raise the maximum length.</p>';
      $("#ng-count").textContent = res.length + " names generated. Click again for a fresh batch.";
    }
    function card(n) {
      var s = slug(n), on = favs.indexOf(n) > -1;
      return '<div class="name"><b>' + esc(n) + '</b><span class="small muted">' + esc(s) + '.com</span><div class="acts"><button type="button" class="fav' + (on ? " on" : "") + '" data-n="' + esc(n) + '" aria-pressed="' + on + '">' + (on ? "Saved" : "Save") + '</button><button type="button" data-copy="' + esc(n) + '">Copy</button><a href="https://www.namecheap.com/domains/registration/results/?domain=' + encodeURIComponent(s) + '.com" target="_blank" rel="noopener nofollow">Check domain</a></div></div>';
    }
    function renderFavs() {
      U.store("b4u-favs", favs);
      favBox.innerHTML = favs.length ? "<h3>Your shortlist (" + favs.length + ")</h3><p>" + favs.map(esc).join(", ") + '</p><button type="button" class="btn btn-sm btn-ghost" id="copy-favs">Copy shortlist</button> <button type="button" class="btn btn-sm btn-ghost" id="clear-favs">Clear</button>' : "";
    }
    f.addEventListener("submit", function (e) { e.preventDefault(); round++; gen(); });
    doc().addEventListener("click", function (e) {
      var t = e.target;
      if (t.classList.contains("fav")) { var n = t.getAttribute("data-n"), i = favs.indexOf(n); if (i > -1) favs.splice(i, 1); else favs.push(n); t.classList.toggle("on", i < 0); t.textContent = i < 0 ? "Saved" : "Save"; t.setAttribute("aria-pressed", i < 0); renderFavs(); }
      if (t.hasAttribute("data-copy")) K.copy(t.getAttribute("data-copy"), "Name copied");
      if (t.id === "copy-favs") K.copy(favs.join("\n"), "Shortlist copied");
      if (t.id === "clear-favs") { favs = []; renderFavs(); $$(".fav.on").forEach(function (b) { b.classList.remove("on"); b.textContent = "Save"; }); }
    });
    renderFavs();
  }
  function doc() { return document; }

  /* ---------- Invoice generator ---------- */
  function invoice() {
    var f = $("#inv"); if (!f) return;
    var prev = $("#inv-doc"), body = $("#inv-items"), KEY = "b4u-invoice";
    var today = new Date().toISOString().slice(0, 10), due = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    var data = U.store(KEY) || { from: "Your Business Name", fromd: "123 Main Street\nCity, Region\nyou@business.com", to: "Client Name", tod: "Client address\nclient@email.com", no: "INV-1001", date: today, due: due, cur: K.cur(), tax: 0, disc: 0, notes: "Payment due within 30 days. Thank you for your business.", items: [["Consulting services", 10, 120], ["Project setup fee", 1, 250]] };
    ["from", "fromd", "to", "tod", "no", "date", "due", "cur", "tax", "disc", "notes"].forEach(function (k) { if (f[k]) f[k].value = data[k]; });
    function rows() {
      body.innerHTML = data.items.map(function (it, i) {
        return '<tr><td><label class="vh" for="d' + i + '">Description</label><input id="d' + i + '" data-i="' + i + '" data-k="0" value="' + esc(it[0]) + '"></td><td style="width:80px"><label class="vh" for="q' + i + '">Quantity</label><input id="q' + i + '" type="number" step="any" data-i="' + i + '" data-k="1" value="' + it[1] + '"></td><td style="width:110px"><label class="vh" for="r' + i + '">Rate</label><input id="r' + i + '" type="number" step="any" data-i="' + i + '" data-k="2" value="' + it[2] + '"></td><td style="width:40px"><button type="button" class="icon-btn" data-del="' + i + '" aria-label="Remove line">&times;</button></td></tr>';
      }).join("");
    }
    function fmt(n) { try { return new Intl.NumberFormat(undefined, { style: "currency", currency: data.cur }).format(n); } catch (e) { return n.toFixed(2); } }
    function render() {
      ["from", "fromd", "to", "tod", "no", "date", "due", "cur", "notes"].forEach(function (k) { data[k] = f[k].value; });
      data.tax = parseFloat(f.tax.value) || 0; data.disc = parseFloat(f.disc.value) || 0;
      var sub = 0;
      var lines = data.items.map(function (it) { var a = (parseFloat(it[1]) || 0) * (parseFloat(it[2]) || 0); sub += a; return "<tr><td>" + esc(it[0]) + '</td><td class="r">' + esc(it[1]) + '</td><td class="r">' + fmt(parseFloat(it[2]) || 0) + '</td><td class="r">' + fmt(a) + "</td></tr>"; }).join("");
      var taxable = Math.max(sub - data.disc, 0), tax = taxable * data.tax / 100, total = taxable + tax;
      prev.innerHTML = '<div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap"><div><h2 style="margin:0">' + esc(data.from) + '</h2><p style="white-space:pre-line;color:#5A6782;margin:6px 0 0">' + esc(data.fromd) + '</p></div><div style="text-align:right"><h2 style="margin:0;color:#1F7A4D">INVOICE</h2><p style="margin:6px 0 0">' + esc(data.no) + "<br>Issued " + esc(data.date) + "<br>Due " + esc(data.due) + "</p></div></div>" +
        '<div style="margin:26px 0 6px"><strong>Bill to</strong><p style="white-space:pre-line;margin:4px 0 0">' + esc(data.to) + "\n" + esc(data.tod) + "</p></div>" +
        '<table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>' + lines + "</tbody></table>" +
        '<table style="width:auto;margin-left:auto"><tr><td>Subtotal</td><td class="r">' + fmt(sub) + "</td></tr>" + (data.disc ? "<tr><td>Discount</td><td class=\"r\">-" + fmt(data.disc) + "</td></tr>" : "") + (data.tax ? "<tr><td>Tax (" + data.tax + '%)</td><td class="r">' + fmt(tax) + "</td></tr>" : "") + '<tr class="tot"><td>Total due</td><td class="r">' + fmt(total) + "</td></tr></table>" +
        (data.notes ? '<p style="margin-top:20px;color:#5A6782;white-space:pre-line">' + esc(data.notes) + "</p>" : "");
      U.store(KEY, data);
    }
    f.addEventListener("input", function (e) {
      var t = e.target, i = t.getAttribute("data-i");
      if (i !== null) data.items[+i][+t.getAttribute("data-k")] = t.value;
      render();
    });
    f.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return;
      if (t.hasAttribute("data-del")) { data.items.splice(+t.getAttribute("data-del"), 1); rows(); render(); }
      if (t.id === "add-line") { data.items.push(["", 1, 0]); rows(); render(); var ins = $$("input[data-k='0']", body); ins[ins.length - 1].focus(); }
      if (t.id === "inv-print") window.print();
      if (t.id === "inv-new") { var m = (data.no || "INV-1000").match(/^(.*?)(\d+)$/); data.no = m ? m[1] + String(+m[2] + 1).padStart(m[2].length, "0") : data.no + "-2"; f.no.value = data.no; data.items = [["", 1, 0]]; f.date.value = today; f.due.value = due; rows(); render(); U.toast("New invoice started"); }
      if (t.id === "inv-clear") { localStorage.removeItem(KEY); location.reload(); }
    });
    rows(); render();
  }

  /* ---------- One-page business plan builder ---------- */
  function plan() {
    var f = $("#plan"); if (!f) return;
    var prev = $("#plan-doc"), KEY = "b4u-plan", d = U.store(KEY) || {};
    var F = $$("[name]", f).map(function (el) { return el.name; });
    F.forEach(function (k) { if (d[k] != null) f[k].value = d[k]; });
    var SECTIONS = [["problem", "Problem"], ["solution", "Solution"], ["customer", "Target customer"], ["value", "Why customers will choose us"], ["competition", "Competition and alternatives"], ["revenue", "How we make money"], ["channels", "How we reach customers"], ["team", "Team"], ["milestones", "Next 90-day milestones"], ["ask", "Funding or support needed"]];
    function n(k) { return parseFloat(f[k].value) || 0; }
    function render() {
      F.forEach(function (k) { d[k] = f[k].value; }); U.store(KEY, d);
      var mo = n("rev") - n("costs"), pay = mo > 0 ? n("startup") / mo : NaN;
      var nums = '<table><tr><th>Startup costs</th><td>' + K.money(n("startup"), 0) + '</td></tr><tr><th>Monthly revenue goal (month 12)</th><td>' + K.money(n("rev"), 0) + '</td></tr><tr><th>Monthly operating costs</th><td>' + K.money(n("costs"), 0) + '</td></tr><tr><th>Monthly profit at goal</th><td>' + K.money(mo, 0) + '</td></tr><tr><th>Months to recover startup costs</th><td>' + (isFinite(pay) ? pay.toFixed(1) : "Not at this goal") + "</td></tr></table>";
      prev.innerHTML = "<h2 style=\"margin:0\">" + esc(d.name || "Your business name") + '</h2><p style="color:#5A6782;margin:4px 0 18px">' + esc(d.tagline || "One-sentence description of what you do and for whom.") + "</p>" +
        SECTIONS.map(function (s) { return d[s[0]] ? '<h3 style="font-size:1rem;margin:16px 0 4px;color:#1F7A4D">' + s[1] + '</h3><p style="white-space:pre-line;margin:0">' + esc(d[s[0]]) + "</p>" : ""; }).join("") +
        '<h3 style="font-size:1rem;margin:16px 0 4px;color:#1F7A4D">Key numbers</h3>' + nums;
    }
    function md() {
      return "# " + (d.name || "Business plan") + "\n\n" + (d.tagline || "") + "\n\n" + SECTIONS.filter(function (s) { return d[s[0]]; }).map(function (s) { return "## " + s[1] + "\n" + d[s[0]]; }).join("\n\n") +
        "\n\n## Key numbers\n- Startup costs: " + K.money(n("startup"), 0) + "\n- Monthly revenue goal: " + K.money(n("rev"), 0) + "\n- Monthly operating costs: " + K.money(n("costs"), 0) + "\n";
    }
    f.addEventListener("input", render);
    f.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return;
      if (t.id === "plan-print") window.print();
      if (t.id === "plan-md") K.copy(md(), "Plan copied as Markdown");
      if (t.id === "plan-clear") { localStorage.removeItem(KEY); location.reload(); }
    });
    render();
  }

  /* ---------- Business Match quiz ---------- */
  var IDEAS = {
    consult: ["Consulting or coaching", "Sell what you already know to businesses or individuals.", "$500 to $3,000", "2 to 6 weeks", "guides/side-hustle-to-business.html", "tools/freelance-rate-calculator.html"],
    creative: ["Freelance design, writing or video", "Project work for brands and small businesses.", "$500 to $3,000", "1 to 4 weeks", "guides/side-hustle-to-business.html", "tools/freelance-rate-calculator.html"],
    ecom: ["Niche online store", "A focused product line sold through your own store and marketplaces.", "$2,000 to $15,000", "1 to 3 months", "guides/how-to-build-a-business-website.html", "tools/markup-calculator.html"],
    pod: ["Print-on-demand and digital products", "Designs, templates or courses sold without holding inventory.", "$100 to $1,500", "1 to 3 months", "guides/low-cost-business-ideas.html", "tools/profit-margin-calculator.html"],
    clean: ["Cleaning or home-organising service", "Recurring residential or office cleaning with low startup costs.", "$500 to $3,000", "1 to 3 weeks", "guides/how-to-start-a-business.html", "tools/break-even-calculator.html"],
    handy: ["Handyman and home repair", "Small repair and installation jobs for homeowners and landlords.", "$2,000 to $10,000", "2 to 4 weeks", "guides/how-to-start-a-business.html", "tools/startup-cost-calculator.html"],
    food: ["Food business: meal prep, baking or catering", "Home-based or commissary-kitchen food, where local rules allow.", "$2,000 to $25,000", "1 to 3 months", "guides/how-to-start-a-business.html", "tools/break-even-calculator.html"],
    tutor: ["Tutoring or online courses", "Teach a subject, skill or exam prep, in person or online.", "$100 to $1,500", "1 to 3 weeks", "guides/low-cost-business-ideas.html", "tools/freelance-rate-calculator.html"],
    pet: ["Pet sitting, walking or grooming", "Trusted local care for busy pet owners.", "$300 to $5,000", "1 to 3 weeks", "guides/low-cost-business-ideas.html", "tools/break-even-calculator.html"],
    books: ["Bookkeeping or virtual assistant services", "Remote admin and finance support for small businesses.", "$300 to $2,500", "2 to 6 weeks", "guides/bookkeeping-basics.html", "tools/freelance-rate-calculator.html"],
    agency: ["Social media or local marketing agency", "Manage marketing for local businesses on monthly retainers.", "$500 to $3,000", "3 to 8 weeks", "guides/small-business-marketing-plan.html", "tools/ltv-cac-calculator.html"],
    events: ["Event planning or photography", "Weddings, parties, corporate events and portraits.", "$1,500 to $10,000", "1 to 2 months", "guides/how-to-price-products-and-services.html", "tools/markup-calculator.html"],
    fit: ["Personal training or fitness classes", "One-to-one or small-group coaching, in person or online.", "$500 to $5,000", "2 to 6 weeks", "guides/how-to-price-products-and-services.html", "tools/break-even-calculator.html"],
    resale: ["Reselling and vintage", "Buy undervalued goods and resell online.", "$500 to $5,000", "1 to 4 weeks", "guides/low-cost-business-ideas.html", "tools/markup-calculator.html"],
    ai: ["AI automation services for local businesses", "Set up chatbots, workflows and AI tools for owners who lack the time.", "$200 to $2,000", "2 to 6 weeks", "guides/ai-tools-for-small-business.html", "tools/freelance-rate-calculator.html"],
    detail: ["Mobile car detailing", "Bring premium car cleaning to customers' driveways and offices.", "$1,500 to $8,000", "2 to 4 weeks", "guides/how-to-start-a-business.html", "tools/startup-cost-calculator.html"]
  };
  var QS = [
    ["How much can you invest to start?", [["Under $1,000", "consult creative pod tutor pet books agency ai clean"], ["$1,000 to $10,000", "ecom handy events fit resale detail clean food"], ["More than $10,000", "ecom food events handy detail"]]],
    ["How much time can you give it?", [["A few hours a week", "pod resale tutor creative pet"], ["Part-time, 10 to 25 hours", "consult creative tutor books agency ai fit events pet"], ["Full-time", "agency clean handy ecom food detail events consult"]]],
    ["What are you best at?", [["People and communication", "consult tutor fit events agency"], ["Making and fixing things", "handy food clean detail pod"], ["Numbers and organisation", "books ecom resale"], ["Creative work", "creative pod events agency"], ["Technology", "ai agency ecom"]]],
    ["Where do you want to work?", [["From home or online", "consult creative pod books ai tutor ecom agency"], ["Out and about locally", "clean handy pet detail events fit food"], ["Either is fine", "tutor fit agency events resale"]]],
    ["Who would you rather serve?", [["Individuals and families", "clean pet tutor fit food resale pod detail handy"], ["Businesses", "consult books agency ai creative"], ["Both", "events creative ecom handy"]]],
    ["What matters more?", [["Cash coming in fast", "clean pet handy creative tutor detail"], ["Building something that scales", "ecom pod agency ai consult"]]]
  ];
  function quiz() {
    var f = $("#quiz"); if (!f) return;
    f.innerHTML = QS.map(function (q, i) {
      return '<fieldset class="quiz-q" style="border:0;padding:0;margin:0 0 22px"><legend class="lbl" style="margin-bottom:10px;font-size:1.05rem">' + (i + 1) + ". " + esc(q[0]) + '</legend><div class="opts">' + q[1].map(function (o, j) {
        return '<label class="opt"><input type="radio" name="q' + i + '" value="' + j + '" required><span>' + esc(o[0]) + "</span></label>";
      }).join("") + "</div></fieldset>";
    }).join("") + '<button class="btn btn-green" type="submit">Show my matches</button><p class="form-msg" role="status"></p>';
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var score = {}, answered = 0;
      Object.keys(IDEAS).forEach(function (k) { score[k] = 0; });
      QS.forEach(function (q, i) { var el = f["q" + i]; var v = el && el.value; if (v === "" || v == null) return; answered++; q[1][+v][1].split(" ").forEach(function (k) { score[k] += 2; }); });
      if (answered < QS.length) { var m = $(".form-msg", f); m.className = "form-msg err"; m.textContent = "Answer all " + QS.length + " questions to see your matches."; return; }
      var top = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; }).slice(0, 3), max = QS.length * 2;
      var r = $("#quiz-res");
      r.innerHTML = "<h2>Your top matches</h2>" + top.map(function (k, i) {
        var it = IDEAS[k], pctv = Math.min(98, Math.round(score[k] / max * 100));
        return '<div class="card" style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><h3 style="margin:0">' + (i + 1) + ". " + esc(it[0]) + '</h3><span class="badge g">' + pctv + '% match</span></div><p style="margin:8px 0">' + esc(it[1]) + '</p><p class="small muted" style="margin:0 0 10px">Typical startup cost: ' + it[2] + ". Time to first revenue: " + it[3] + '.</p><div class="btn-row"><a class="btn btn-sm btn-ghost" href="' + U.u(it[4]) + '">Read the guide</a><a class="btn btn-sm btn-ghost" href="' + U.u(it[5]) + '">Run the numbers</a></div></div>';
      }).join("") + '<div class="cta-box"><h3>Ready to make it real?</h3><p>Get matched with formation services, funding and mentors for your first choice.</p><a class="btn btn-hi" href="' + U.u("get-matched/?need=formation&idea=" + encodeURIComponent(IDEAS[top[0]][0])) + '">Get matched free</a></div>';
      r.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- Funding readiness score ---------- */
  function readiness() {
    var f = $("#ready"); if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var tib = +f.tib.value, rev = +f.rev.value, cr = +f.credit.value, debt = +f.debt.value, docs = $$("input[name=docs]:checked", f).length, col = f.collateral.checked ? 5 : 0;
      var raw = tib + rev + cr + debt + docs * 2 + col, score = Math.round(raw / 83 * 100);
      var band = score >= 75 ? ["Lender-ready", "You look like the borrowers banks and government-backed programs want. Compare at least three offers."] : score >= 50 ? ["Almost there", "You can likely get funded, but fixing one or two gaps below could lower your rate significantly."] : ["Build first", "Traditional lenders will probably say no today. Focus on the options and steps below, then re-check in 90 days."];
      var opts = [];
      if (tib <= 5) opts.push("Microloans and startup loan programs (for example SBA Microloans, Futurpreneur, Start Up Loans)", "0% crowdfunded loans such as Kiva", "Grants and pitch competitions");
      if (tib >= 10 && rev >= 10 && cr >= 10) opts.push("Bank or credit union term loans", "Government-backed loans (SBA 7(a), Canada Small Business Financing Program)", "Business line of credit");
      if (f.purpose.value === "equipment") opts.push("Equipment financing, where the equipment secures the loan");
      if (f.purpose.value === "inventory" || f.purpose.value === "working") opts.push("Inventory or invoice financing");
      if (cr <= 5) opts.push("Secured or revenue-based options that weigh sales over personal credit");
      if (!opts.length) opts.push("Online lenders and lines of credit", "Community development lenders");
      var fix = [];
      if (cr < 15) fix.push("Raise your personal credit score: pay every bill on time and keep card balances under 30% of limits.");
      if (docs < 4) fix.push("Prepare the missing documents. Six months of bank statements and a current profit and loss statement are requested by almost every lender.");
      if (debt < 8) fix.push("Pay down existing debt so total payments fall below 15% of revenue.");
      if (rev < 10) fix.push("Show consistent monthly revenue; even a few months of steady deposits help.");
      if (tib < 10) fix.push("Time in business matters. Register formally and open a business bank account now so the clock starts.");
      if (!fix.length) fix.push("Keep your books current and request offers from several lenders to compare true APR.");
      var r = $("#ready-res");
      r.innerHTML = '<div class="card"><p class="lbl" style="margin:0">Your funding readiness score</p><div class="score">' + score + '<span style="font-size:1.3rem;color:var(--muted)">/100</span></div><div class="meter"><i style="width:' + score + '%"></i></div><h3>' + band[0] + "</h3><p>" + band[1] + '</p><h3 style="font-size:1.05rem">Options that fit you now</h3><ul>' + opts.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + '</ul><h3 style="font-size:1.05rem">How to raise your score</h3><ul>' + fix.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + '</ul><div class="btn-row"><a class="btn btn-green" href="' + U.u("get-matched/?need=funding&score=" + score) + '">Get matched with funding</a><a class="btn btn-ghost" href="' + U.u("funding/") + '">Browse programs</a></div></div>';
      r.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function init() { namegen(); invoice(); plan(); quiz(); readiness(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
