/* Per-currency price estimator.
   Buttons are built synchronously so the control is never half-present. Rates
   are fetched once per visit; a tap before they land shows a placeholder and
   fills itself in. The US$ figure above is always the authoritative price. */
(function () {
  var rows = document.querySelectorAll('.fx[data-usd]');
  if (!rows.length || !window.Intl) return;

  /* Labels, not bare symbols: A$ and NZ$ both use a dollar sign. */
  var CUR = [
    { code: 'GBP', label: '£',   name: 'British pounds' },
    { code: 'EUR', label: '€',   name: 'euro' },
    { code: 'AUD', label: 'A$',       name: 'Australian dollars' },
    { code: 'NZD', label: 'NZ$',      name: 'New Zealand dollars' },
    { code: 'JPY', label: '¥',   name: 'Japanese yen' }
  ];

  var rates = null, failed = false, built = [];

  /* Round so it reads as an estimate, never as a quote. */
  function tidy(v) {
    if (v >= 100000) return Math.round(v / 1000) * 1000;
    if (v >= 10000) return Math.round(v / 100) * 100;
    if (v >= 1000) return Math.round(v / 10) * 10;
    return Math.round(v / 5) * 5;
  }

  function money(usd, code) {
    var r = rates && rates[code];
    if (!r) return null;
    try {
      return new Intl.NumberFormat('en', {
        style: 'currency', currency: code, maximumFractionDigits: 0
      }).format(tidy(usd * r));
    } catch (e) { return null; }
  }

  function render(row, out, usd) {
    var code = row.getAttribute('data-active');
    if (!code) { out.textContent = ''; return; }
    if (failed) { out.textContent = 'rate unavailable'; return; }
    if (!rates) { out.textContent = '…'; return; }
    var m = money(usd, code);
    out.innerHTML = m
      ? '<span class="fx-approx">≈ </span>' + m +
        '<a class="fx-star" href="book.html#currency" aria-label="Read the currency note">*</a>'
      : 'rate unavailable';
    out.title = "Approximate, at today's rate. You are charged in US dollars.";
  }

  Array.prototype.forEach.call(rows, function (row) {
    var usd = parseFloat(row.getAttribute('data-usd'));
    if (!isFinite(usd)) return;

    var label = document.createElement('span');
    label.className = 'fx-label';
    label.textContent = 'See it in your money *';

    var wrap = document.createElement('div');
    wrap.className = 'fx-flags';

    var out = document.createElement('span');
    out.className = 'fx-out';
    out.setAttribute('aria-live', 'polite');

    CUR.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-btn';
      b.textContent = c.label;
      b.setAttribute('aria-label', 'Show this price in ' + c.name);
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(wrap.querySelectorAll('.fx-btn'), function (o) {
          o.setAttribute('aria-pressed', 'false');
        });
        b.setAttribute('aria-pressed', 'true');
        row.setAttribute('data-active', c.code);
        render(row, out, usd);
      });
      wrap.appendChild(b);
    });

    wrap.appendChild(out);
    row.appendChild(label);
    row.appendChild(wrap);
    built.push({ row: row, out: out, usd: usd });
  });

  function refreshAll() {
    built.forEach(function (b) {
      if (b.row.getAttribute('data-active')) render(b.row, b.out, b.usd);
    });
  }

  var CACHE = 'fxUSD';
  try {
    var hit = JSON.parse(sessionStorage.getItem(CACHE) || 'null');
    if (hit && hit.rates) rates = hit.rates;
  } catch (e) { /* storage blocked; fetch instead */ }

  if (!rates && window.fetch) {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || j.result !== 'success' || !j.rates) failed = true;
        else {
          rates = j.rates;
          try { sessionStorage.setItem(CACHE, JSON.stringify({ rates: rates })); } catch (e) {}
        }
        refreshAll();
      })
      .catch(function () { failed = true; refreshAll(); });
  } else if (!rates) {
    failed = true;
  }
})();
