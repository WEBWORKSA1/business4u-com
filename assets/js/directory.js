/* Business4U.com directories: funding finder, video academy, news desk */
(function () {
  "use strict";
  var U = window.B4Uutil, $ = U.$, $$ = U.$$, esc = U.esc;
  function load(p) { return fetch(U.u(p), { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(p); return r.json(); }); }

  /* Funding finder */
  var fb = $("#funding");
  if (fb) load("data/funding.json").then(function (data) {
    var f = $("#ff"), out = $("#ff-out"), cnt = $("#ff-count");
    var q = new URLSearchParams(location.search);
    if (q.get("country")) f.country.value = q.get("country");
    function run() {
      var c = f.country.value, t = f.type.value, s = f.q.value.toLowerCase().trim();
      var list = data.filter(function (x) {
        return (!c || x.c === c || (c !== "Global" && x.c === "Global")) && (!t || x.t === t) && (!s || (x.n + " " + x.p + " " + x.d + " " + x.c).toLowerCase().indexOf(s) > -1);
      });
      cnt.textContent = list.length + " program" + (list.length === 1 ? "" : "s") + " shown";
      if (!list.length) { out.innerHTML = '<div class="empty">No programs match those filters. Clear the search or choose "All countries".</div>'; return; }
      var html = "";
      list.forEach(function (x, i) {
        html += '<div class="dir-card"><div class="meta"><span class="badge">' + esc(x.c) + '</span><span class="badge g">' + esc(x.t) + "</span></div><h3>" + esc(x.n) + '</h3><p class="small muted" style="margin:0">' + esc(x.p) + "</p>" + (x.a ? '<p class="amt">' + esc(x.a) + "</p>" : "") + "<p>" + esc(x.d) + '</p><a class="go" href="' + esc(x.u) + '" target="_blank" rel="noopener nofollow">Visit official site</a></div>';
        if ((i + 1) % 9 === 0) html += '<div class="dir-card" style="background:var(--ink);color:#fff;border-color:var(--ink)"><h3 style="color:#fff">Not sure which fits?</h3><p style="color:#C9D4E6">Tell us your amount, stage and location. We match you with lenders and programs you are likely to qualify for.</p><a class="btn btn-hi btn-sm" href="' + U.u("get-matched/?need=funding") + '">Get matched free</a></div>';
      });
      out.innerHTML = html;
    }
    f.addEventListener("input", run); f.addEventListener("change", run);
    $("#ff-total").textContent = data.length;
    run();
  }).catch(function () { $("#ff-out").innerHTML = '<div class="empty">The directory could not load. Refresh the page to try again.</div>'; });

  /* Video academy */
  var vb = $("#videos");
  if (vb) load("data/videos.json").then(function (data) {
    var cats = ["All"].concat(data.map(function (v) { return v.c; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
    var bar = $("#v-cats"), out = $("#v-out"), active = "All";
    bar.innerHTML = cats.map(function (c) { return '<button type="button" class="chip" aria-pressed="' + (c === "All") + '" data-c="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");
    function run() {
      var list = data.filter(function (v) { return active === "All" || v.c === active; });
      out.innerHTML = list.map(function (v) {
        return '<div class="vid"><button class="yt" type="button" data-id="' + esc(v.id) + '" aria-label="Play: ' + esc(v.t) + '"></button><h3>' + esc(v.t) + "</h3><p>" + esc(v.s) + ". " + esc(v.d) + ' <a href="https://www.youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener">Watch on YouTube</a></p></div>';
      }).join("");
      U.yt();
    }
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-c]"); if (!b) return;
      active = b.getAttribute("data-c");
      $$("[data-c]", bar).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      run();
    });
    run();
  });

  /* News desk */
  var nb = $("#news");
  if (nb) load("data/news.json").then(function (d) {
    var items = d.items || [], out = $("#n-out"), src = $("#n-src"), upd = $("#n-upd");
    upd.textContent = d.updated ? "Last updated " + new Date(d.updated).toLocaleString() + "." : "The first automatic update is on its way.";
    if (!items.length) return;
    var sources = items.map(function (i) { return i.s; }).filter(function (s, i, a) { return s && a.indexOf(s) === i; }).sort();
    src.innerHTML = '<option value="">All sources</option>' + sources.map(function (s) { return "<option>" + esc(s) + "</option>"; }).join("");
    src.hidden = false;
    function run() {
      var s = src.value, list = items.filter(function (i) { return !s || i.s === s; });
      out.innerHTML = list.map(function (i) { return '<li><a href="' + esc(i.u) + '" target="_blank" rel="noopener nofollow">' + esc(i.t) + '</a><span class="src">' + esc(i.s || "") + (i.d ? ", " + new Date(i.d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "") + "</span></li>"; }).join("");
    }
    src.addEventListener("change", run); run();
  }).catch(function () {});
})();
