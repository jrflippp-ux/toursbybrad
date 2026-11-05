// "Choose your date": month calendar of open tour days, fed by dates.json
// (published daily from Brad's free/busy). Picking a day writes it into the
// email and WhatsApp enquiry links on this page.
(function () {
  var box = document.getElementById("datepick");
  if (!box) return;
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var data, closed = {}, first, last, view, picked = null;

  function iso(y, m, d) { return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0"); }
  function parse(s) { var p = s.split("-"); return new Date(+p[0], p[1] - 1, +p[2]); }
  function label(s) {
    var d = parse(s);
    return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }

  function setLinks() {
    var text = picked ? " " + label(picked) : "";
    document.querySelectorAll('a[href^="mailto:"], a[href*="wa.me/"]').forEach(function (a) {
      if (!a.dataset.orig) a.dataset.orig = a.getAttribute("href");
      a.setAttribute("href", a.dataset.orig.replace("Hiroshima%3A", "Hiroshima%3A" + encodeURIComponent(text)));
    });
    var out = box.querySelector(".dp-picked");
    out.innerHTML = picked
      ? "<strong>" + label(picked) + "</strong> is open. Book below and the date goes with your message."
      : "Tap an open day to choose it.";
  }

  function render() {
    var y = view.getFullYear(), m = view.getMonth();
    var grid = box.querySelector(".dp-grid");
    box.querySelector(".dp-month").textContent = MONTHS[m] + " " + y;
    box.querySelector(".dp-prev").disabled = (y === first.getFullYear() && m === first.getMonth());
    box.querySelector(".dp-next").disabled = (y === last.getFullYear() && m === last.getMonth());
    var html = DAYS.map(function (d) { return '<span class="dp-dow">' + d.charAt(0) + "</span>"; }).join("");
    var lead = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate();
    for (var i = 0; i < lead; i++) html += "<span></span>";
    for (var d = 1; d <= n; d++) {
      var s = iso(y, m, d), when = new Date(y, m, d);
      var open = when >= first && when <= last && !closed[s];
      html += open
        ? '<button type="button" class="dp-day' + (s === picked ? " is-picked" : "") + '" data-date="' + s +
          '" aria-pressed="' + (s === picked) + '" aria-label="' + label(s) + ', open">' + d + "</button>"
        : '<span class="dp-day is-closed" aria-label="' + label(s) + ', not available">' + d + "</span>";
    }
    grid.innerHTML = html;
  }

  box.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    if (t.classList.contains("dp-prev")) view.setMonth(view.getMonth() - 1);
    else if (t.classList.contains("dp-next")) view.setMonth(view.getMonth() + 1);
    else if (t.dataset.date) { picked = t.dataset.date === picked ? null : t.dataset.date; setLinks(); }
    render();
  });

  fetch("dates.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (j) {
    data = j;
    j.closed.forEach(function (s) { closed[s] = true; });
    var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    first = parse(j.from) > today ? parse(j.from) : today;
    last = parse(j.to);
    view = new Date(first.getFullYear(), first.getMonth(), 1);
    box.hidden = false;
    render(); setLinks();
  }).catch(function () { /* no calendar: the page still works as before */ });
})();
