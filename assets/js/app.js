/* ==========================================================================
   Tese Vale x Gerdau — interatividade e gráficos
   Sem dependências externas. Todos os gráficos são SVG gerados aqui.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Tokens lidos do CSS ---------- */
  var css = getComputedStyle(document.documentElement);
  var C = {
    vale:    css.getPropertyValue('--vale').trim()    || '#3987e5',
    gerdau:  css.getPropertyValue('--gerdau').trim()  || '#d95926',
    s3:      css.getPropertyValue('--serie-3').trim() || '#199e70',
    ink:     '#ffffff',
    ink2:    '#c3c2b7',
    ink3:    '#898781',
    grid:    '#2c2c2a',
    axis:    '#383835',
    surface: '#1a1a19',
    neutral: '#4a4a46'
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- Utilitários SVG ---------- */
  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function svgRoot(w, h) {
    var s = el('svg', {
      viewBox: '0 0 ' + w + ' ' + h,
      width: '100%', height: h,
      role: 'img', 'aria-hidden': 'true'
    });
    return s;
  }
  function label(x, y, text, opts) {
    opts = opts || {};
    return el('text', {
      x: x, y: y,
      fill: opts.fill || C.ink3,
      'font-size': opts.size || 11,
      'font-weight': opts.weight || 400,
      'text-anchor': opts.anchor || 'start',
      'dominant-baseline': opts.baseline || 'auto',
      'font-family': opts.mono ? '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit',
      'letter-spacing': opts.tracking || null
    }, text);
  }
  function fmt(n, d) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 })
            .replace('-', '\u2212');
  }

  /* ---------- Tooltip ---------- */
  function attachTip(host) {
    var tip = document.createElement('div');
    tip.className = 'tip';
    host.appendChild(tip);
    return {
      show: function (x, y, title, val) {
        tip.innerHTML = '<span class="tip-title">' + title + '</span><span class="tip-val">' + val + '</span>';
        tip.style.left = x + 'px';
        tip.style.top = y + 'px';
        tip.setAttribute('data-show', 'true');
      },
      hide: function () { tip.removeAttribute('data-show'); }
    };
  }

  function legend(host, items) {
    var wrap = document.createElement('div');
    wrap.className = 'legend';
    items.forEach(function (it) {
      var d = document.createElement('span');
      d.className = 'legend-item';
      d.innerHTML = '<span class="legend-swatch' + (it.line ? ' line' : '') + '" style="background:' + it.color + '"></span>' + it.label;
      wrap.appendChild(d);
    });
    host.insertBefore(wrap, host.firstChild);
  }

  /* ======================================================================
     GRÁFICO 1 — Ramp-up de Simandou (linhas)
     ====================================================================== */
  function chartSimandou(host, W) {
    var H = 250, m = { t: 16, r: 46, b: 34, l: 40 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;

    var anos = [2026, 2027, 2028, 2029, 2030];
    var lento = [15, 45, 85, 115, 120];   // 48 meses (RBC)
    var rapido = [30, 85, 120, 120, 120]; // 30 meses (premissa anterior)
    var yMax = 130;

    var x = function (i) { return m.l + (iw * i) / (anos.length - 1); };
    var y = function (v) { return m.t + ih - (ih * v) / yMax; };

    var s = svgRoot(W, H);

    // Grade
    [0, 30, 60, 90, 120].forEach(function (v) {
      s.appendChild(el('line', { x1: m.l, x2: m.l + iw, y1: y(v), y2: y(v), stroke: C.grid, 'stroke-width': 1 }));
      s.appendChild(label(m.l - 9, y(v) + 4, fmt(v), { anchor: 'end', size: 10 }));
    });
    s.appendChild(label(m.l - 9, y(120) - 14, 'Mt/ano', { anchor: 'end', size: 9, tracking: '.08em' }));

    // Eixo x
    anos.forEach(function (a, i) {
      s.appendChild(label(x(i), H - 12, String(a), { anchor: 'center', size: 10 }));
    });

    function path(data) {
      return data.map(function (v, i) { return (i ? 'L' : 'M') + x(i) + ' ' + y(v); }).join(' ');
    }

    // Área entre as curvas = o "atraso"
    var band = path(rapido) + ' ' + lento.slice().reverse().map(function (v, i) {
      return 'L' + x(lento.length - 1 - i) + ' ' + y(v);
    }).join(' ') + ' Z';
    s.appendChild(el('path', { d: band, fill: C.vale, 'fill-opacity': 0.10, stroke: 'none' }));

    // Linha 30 meses (cenário antigo) — tracejada, papel secundário
    s.appendChild(el('path', { d: path(rapido), fill: 'none', stroke: C.ink3, 'stroke-width': 2, 'stroke-dasharray': '5 4', 'stroke-linecap': 'round' }));
    // Linha 48 meses (cenário RBC) — a que importa
    s.appendChild(el('path', { d: path(lento), fill: 'none', stroke: C.vale, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

    var tip = attachTip(host);
    [[lento, C.vale, 'Ramp-up de 48 meses'], [rapido, C.ink3, 'Ramp-up de 30 meses']].forEach(function (serie) {
      serie[0].forEach(function (v, i) {
        var c = el('circle', { cx: x(i), cy: y(v), r: 4.5, fill: serie[1], stroke: C.surface, 'stroke-width': 2 });
        var hit = el('circle', { cx: x(i), cy: y(v), r: 14, fill: 'transparent', style: 'cursor:pointer' });
        hit.addEventListener('mouseenter', function () {
          tip.show(x(i) / W * host.clientWidth, y(v) / H * H, serie[2] + ' · ' + anos[i], fmt(v) + ' Mt');
        });
        hit.addEventListener('mouseleave', tip.hide);
        s.appendChild(c); s.appendChild(hit);
      });
    });

    // Rótulo direto no fim de cada linha
    s.appendChild(label(x(4) + 10, y(120) - 2, '120 Mt', { fill: C.ink, size: 11, weight: 600 }));

    host.appendChild(s);
    legend(host, [
      { color: C.vale, label: '48 meses (RBC, atual)', line: true },
      { color: C.ink3, label: '30 meses (premissa anterior)', line: true }
    ]);
  }

  /* ======================================================================
     GRÁFICO 2 — Projeções de preço do minério (lollipop horizontal)
     ====================================================================== */
  function chartPrecos(host, W) {
    var dados = [
      { n: 'BTG Pactual', v: 85, tipo: 'proj' },
      { n: 'Platts IODEX · ago/26', v: 95.25, tipo: 'obs' },
      { n: 'Futuro 62% · set/26', v: 99.37, tipo: 'obs' },
      { n: 'Genial', v: 102.5, tipo: 'proj' },
      { n: 'S&P Global', v: 104, tipo: 'proj' }
    ];
    var estreito = W < 480;
    var m = estreito
      ? { t: 14, r: 56, b: 28, l: 8 }
      : { t: 14, r: 52, b: 30, l: Math.min(150, W * 0.42) };
    var rowH = estreito ? 48 : 34;
    var H = m.t + dados.length * rowH + m.b;
    var iw = W - m.l - m.r;
    var min = 75, max = 110;
    var x = function (v) { return m.l + (iw * (v - min)) / (max - min); };
    var ticks = estreito ? [80, 95, 110] : [80, 90, 100, 110];

    var s = svgRoot(W, H);

    ticks.forEach(function (v) {
      s.appendChild(el('line', { x1: x(v), x2: x(v), y1: m.t, y2: m.t + dados.length * rowH - 8, stroke: C.grid, 'stroke-width': 1 }));
      s.appendChild(label(x(v), H - 10, (estreito ? '' : 'US$ ') + v, { anchor: 'middle', size: 10 }));
    });

    var tip = attachTip(host);
    dados.forEach(function (d, i) {
      var cy = m.t + i * rowH + rowH / 2 - 4 + (estreito ? 8 : 0);
      var col = d.tipo === 'proj' ? C.vale : C.s3;
      if (estreito) s.appendChild(label(m.l, cy - 15, d.n, { anchor: 'start', size: 11, fill: C.ink2 }));
      else s.appendChild(label(m.l - 12, cy + 4, d.n, { anchor: 'end', size: 11.5, fill: C.ink2 }));
      s.appendChild(el('line', { x1: x(min), x2: x(d.v), y1: cy, y2: cy, stroke: C.axis, 'stroke-width': 1.5 }));
      s.appendChild(el('circle', { cx: x(d.v), cy: cy, r: 6, fill: col, stroke: C.surface, 'stroke-width': 2 }));
      s.appendChild(label(x(d.v) + 13, cy + 4, fmt(d.v, d.v % 1 ? 2 : 0), { fill: C.ink, size: 11, weight: 600, mono: true }));

      var hit = el('rect', { x: m.l, y: cy - 15, width: iw, height: 30, fill: 'transparent', style: 'cursor:pointer' });
      hit.addEventListener('mouseenter', function () {
        tip.show(x(d.v) / W * host.clientWidth, cy, d.n, 'US$ ' + fmt(d.v, d.v % 1 ? 2 : 0) + '/t');
      });
      hit.addEventListener('mouseleave', tip.hide);
      s.appendChild(hit);
    });

    host.appendChild(s);
    legend(host, [
      { color: C.vale, label: 'Projeção de casa de análise' },
      { color: C.s3, label: 'Preço observado' }
    ]);
  }

  /* ======================================================================
     GRÁFICO 3 — Curva de custo (área escalonada)
     ====================================================================== */
  function chartCurva(host, W) {
    var H = W < 520 ? 300 : 280, m = { t: 20, r: 16, b: W < 520 ? 66 : 46, l: 44 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;

    var estreito = W < 520;
    var prod = [
      { n: 'Vale', curto: 'Vale', vol: 340, custo: 50, destaque: true },
      { n: 'Rio Tinto', curto: 'Rio Tinto', vol: 330, custo: 53 },
      { n: 'BHP', curto: 'BHP', vol: 290, custo: 55 },
      { n: 'Fortescue', curto: 'FMG', vol: 190, custo: 62 },
      { n: 'Demais\nseaborne', curto: 'Outros', vol: 350, custo: 85 },
      { n: 'Doméstico\nChina', curto: 'China', vol: 250, custo: 110 }
    ];
    var total = prod.reduce(function (a, p) { return a + p.vol; }, 0);
    var yMax = 125, preco = 99;

    var x = function (v) { return m.l + (iw * v) / total; };
    var y = function (v) { return m.t + ih - (ih * v) / yMax; };

    var s = svgRoot(W, H);

    [0, 25, 50, 75, 100, 125].forEach(function (v) {
      s.appendChild(el('line', { x1: m.l, x2: m.l + iw, y1: y(v), y2: y(v), stroke: C.grid, 'stroke-width': 1 }));
      s.appendChild(label(m.l - 9, y(v) + 4, String(v), { anchor: 'end', size: 10 }));
    });
    s.appendChild(label(m.l - 9, y(125) - 12, 'US$/t', { anchor: 'end', size: 9, tracking: '.08em' }));

    var tip = attachTip(host);
    var acc = 0;
    prod.forEach(function (p) {
      var x0 = x(acc), x1 = x(acc + p.vol);
      var w = Math.max(x1 - x0 - 2, 1); // 2px de respiro entre blocos
      var col = p.destaque ? C.vale : C.neutral;
      var r = el('rect', { x: x0, y: y(p.custo), width: w, height: m.t + ih - y(p.custo), fill: col, rx: 2, style: 'cursor:pointer' });
      r.addEventListener('mouseenter', function () {
        tip.show((x0 + w / 2) / W * host.clientWidth, y(p.custo), p.n.replace('\n', ' '), 'US$ ' + p.custo + '/t · ' + fmt(p.vol) + ' Mt');
      });
      r.addEventListener('mouseleave', tip.hide);
      s.appendChild(r);

      // Rótulo por bloco: horizontal quando cabe, inclinado quando não cabe
      var tint = p.destaque ? C.ink : C.ink3;
      var peso = p.destaque ? 600 : 400;
      if (!estreito && w > 52) {
        p.n.split('\n').forEach(function (linha, k) {
          s.appendChild(label(x0 + w / 2, H - 26 + k * 12, linha, {
            anchor: 'middle', size: 9.5, fill: tint, weight: peso
          }));
        });
      } else {
        var lx = x0 + w / 2, ly = H - m.b + 22;
        var t = label(0, 0, p.curto, { anchor: 'end', size: 9.5, fill: tint, weight: peso });
        t.setAttribute('transform', 'translate(' + lx + ',' + ly + ') rotate(-52)');
        s.appendChild(t);
      }
      acc += p.vol;
    });

    // Linha de preço
    s.appendChild(el('line', { x1: m.l, x2: m.l + iw, y1: y(preco), y2: y(preco), stroke: C.ink, 'stroke-width': 2 }));
    s.appendChild(el('rect', { x: m.l + 6, y: y(preco) - 21, width: 168, height: 18, rx: 4, fill: C.surface, 'fill-opacity': .92 }));
    s.appendChild(label(m.l + 12, y(preco) - 8, 'Preço de referência: US$ 99/t', { fill: C.ink, size: 10.5, weight: 600 }));

    s.appendChild(label(m.l + iw / 2, H - 5, 'Volume acumulado da oferta global →', { anchor: 'middle', size: 9.5, tracking: '.06em' }));

    host.appendChild(s);
    legend(host, [
      { color: C.vale, label: 'Vale — primeiro quartil' },
      { color: C.neutral, label: 'Demais produtores' },
      { color: C.ink, label: 'Preço de referência', line: true }
    ]);
  }

  /* ======================================================================
     GRÁFICO 4 — Desembolsos de Brumadinho (barras)
     ====================================================================== */
  function chartPassivo(host, W) {
    var dados = [{ a: '2026', v: 900 }, { a: '2027', v: 700 }, { a: '2028', v: 300 }];
    var H = 220, m = { t: 26, r: 16, b: 40, l: 46 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var yMax = 1000;
    var bw = Math.min(96, iw / dados.length - 26);

    var x = function (i) { return m.l + (iw * (i + 0.5)) / dados.length - bw / 2; };
    var y = function (v) { return m.t + ih - (ih * v) / yMax; };

    var s = svgRoot(W, H);
    [0, 250, 500, 750, 1000].forEach(function (v) {
      s.appendChild(el('line', { x1: m.l, x2: m.l + iw, y1: y(v), y2: y(v), stroke: C.grid, 'stroke-width': 1 }));
      s.appendChild(label(m.l - 9, y(v) + 4, fmt(v), { anchor: 'end', size: 10 }));
    });
    s.appendChild(label(m.l - 9, y(1000) - 12, 'US$ mi', { anchor: 'end', size: 9, tracking: '.08em' }));

    var tip = attachTip(host);
    dados.forEach(function (d, i) {
      var h = m.t + ih - y(d.v);
      var r = el('rect', { x: x(i), y: y(d.v), width: bw, height: h, fill: C.vale, rx: 4, style: 'cursor:pointer' });
      // Cantos arredondados apenas no topo: máscara com retângulo reto na base
      s.appendChild(r);
      s.appendChild(el('rect', { x: x(i), y: y(d.v) + 4, width: bw, height: h - 4, fill: C.vale }));
      r.addEventListener('mouseenter', function () {
        tip.show((x(i) + bw / 2) / W * host.clientWidth, y(d.v), 'Desembolso em ' + d.a, 'US$ ' + fmt(d.v) + ' milhões');
      });
      r.addEventListener('mouseleave', tip.hide);

      s.appendChild(label(x(i) + bw / 2, y(d.v) - 9, fmt(d.v), { anchor: 'middle', fill: C.ink, size: 12, weight: 600, mono: true }));
      s.appendChild(label(x(i) + bw / 2, H - 14, d.a, { anchor: 'middle', size: 11, fill: C.ink2 }));
    });

    // Seta de tendência
    s.appendChild(label(m.l + iw, m.t - 8, '−67% até 2028', { anchor: 'end', fill: C.s3, size: 11, weight: 600 }));

    host.appendChild(s);
  }

  /* ======================================================================
     GRÁFICO 5 — Composição do EBITDA da Gerdau (barra empilhada)
     ====================================================================== */
  function chartGerdauMix(host, W) {
    var na = 2.6, resto = 0.8, tot = 3.4;
    var H = 150, m = { t: 34, r: 16, b: 26, l: 16 };
    var iw = W - m.l - m.r;
    var barH = 46, y0 = m.t;

    var s = svgRoot(W, H);
    var wNA = (iw * na) / tot - 1;
    var wR = (iw * resto) / tot - 1;

    var tip = attachTip(host);

    var r1 = el('rect', { x: m.l, y: y0, width: wNA, height: barH, fill: C.gerdau, rx: 4, style: 'cursor:pointer' });
    r1.addEventListener('mouseenter', function () { tip.show((m.l + wNA / 2) / W * host.clientWidth, y0, 'América do Norte', 'R$ 2,6 bi · 76%'); });
    r1.addEventListener('mouseleave', tip.hide);
    s.appendChild(r1);

    var r2 = el('rect', { x: m.l + wNA + 2, y: y0, width: wR, height: barH, fill: C.neutral, rx: 4, style: 'cursor:pointer' });
    r2.addEventListener('mouseenter', function () { tip.show((m.l + wNA + 2 + wR / 2) / W * host.clientWidth, y0, 'Demais operações', 'R$ 0,8 bi · 24% (por diferença)'); });
    r2.addEventListener('mouseleave', tip.hide);
    s.appendChild(r2);

    s.appendChild(label(m.l + 14, y0 + barH / 2 + 6, 'R$ 2,6 bi', { fill: '#fff', size: 15, weight: 600 }));
    s.appendChild(label(m.l + 14, y0 - 12, 'AMÉRICA DO NORTE · 76%', { fill: C.ink3, size: 9.5, tracking: '.1em', mono: true }));

    if (wR > 74) {
      s.appendChild(label(m.l + wNA + 16, y0 + barH / 2 + 5, 'R$ 0,8 bi', { fill: C.ink2, size: 12, weight: 600 }));
    }
    s.appendChild(label(m.l, y0 + barH + 22, 'EBITDA ajustado consolidado do 2T26: R$ 3,4 bilhões', { fill: C.ink3, size: 11 }));

    host.appendChild(s);
    legend(host, [
      { color: C.gerdau, label: 'América do Norte (reportado)' },
      { color: C.neutral, label: 'Demais operações (por diferença)' }
    ]);
  }

  /* ======================================================================
     GRÁFICO 6 — Momento operacional (barras divergentes agrupadas)
     ====================================================================== */
  function chartMomento(host, W) {
    var grupos = [
      { n: 'EBITDA ajustado', vale: -3, gerdau: 33.9 },
      { n: 'Lucro líquido', vale: -43, gerdau: 70 }
    ];
    var H = 250, m = { t: 20, r: 20, b: 42, l: 20 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var lim = 80;
    var y = function (v) { return m.t + ih / 2 - (ih / 2) * (v / lim); };

    var s = svgRoot(W, H);
    // Zero
    s.appendChild(el('line', { x1: m.l, x2: m.l + iw, y1: y(0), y2: y(0), stroke: C.axis, 'stroke-width': 1.5 }));
    [-40, 40].forEach(function (v) {
      s.appendChild(el('line', { x1: m.l, x2: m.l + iw, y1: y(v), y2: y(v), stroke: C.grid, 'stroke-width': 1 }));
    });

    var gw = iw / grupos.length;
    var bw = Math.min(52, gw / 2 - 18);
    var tip = attachTip(host);

    grupos.forEach(function (g, i) {
      var cx = m.l + gw * i + gw / 2;
      [['vale', C.vale, 'Vale', -1], ['gerdau', C.gerdau, 'Gerdau', 1]].forEach(function (co) {
        var v = g[co[0]];
        var bx = cx + co[3] * (bw / 2 + 3) - bw / 2;
        var top = v >= 0 ? y(v) : y(0);
        var h = Math.abs(y(v) - y(0));
        var r = el('rect', { x: bx, y: top, width: bw, height: h, fill: co[1], rx: 3, style: 'cursor:pointer' });
        r.addEventListener('mouseenter', function () {
          tip.show((bx + bw / 2) / W * host.clientWidth, top, co[2] + ' · ' + g.n, (v > 0 ? '+' : '') + fmt(v, v % 1 ? 1 : 0) + '% a/a');
        });
        r.addEventListener('mouseleave', tip.hide);
        s.appendChild(r);
        s.appendChild(label(bx + bw / 2, v >= 0 ? top - 9 : top + h + 17,
          (v > 0 ? '+' : '') + fmt(v, v % 1 ? 1 : 0) + '%',
          { anchor: 'middle', fill: C.ink, size: 12, weight: 600, mono: true }));
      });
      s.appendChild(label(cx, H - 12, g.n, { anchor: 'middle', size: 11.5, fill: C.ink2 }));
    });

    host.appendChild(s);
    legend(host, [
      { color: C.vale, label: 'Vale · VALE3' },
      { color: C.gerdau, label: 'Gerdau · GGBR4' }
    ]);
  }

  /* ---------- Registro e renderização responsiva ---------- */
  var charts = {
    simandou: chartSimandou,
    precos: chartPrecos,
    curva: chartCurva,
    passivo: chartPassivo,
    'gerdau-mix': chartGerdauMix,
    momento: chartMomento
  };

  function renderAll() {
    document.querySelectorAll('[data-chart]').forEach(function (host) {
      var fn = charts[host.getAttribute('data-chart')];
      if (!fn) return;
      var w = host.clientWidth || host.parentElement.clientWidth;
      if (!w) return;
      if (host.dataset.renderedAt === String(w)) return;
      host.innerHTML = '';
      fn(host, Math.max(w, 280));
      host.dataset.renderedAt = String(w);
    });
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderAll, 150);
  });

  /* ======================================================================
     ABAS
     ====================================================================== */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab[role="tab"]'));
  function selectTab(btn) {
    tabs.forEach(function (t) {
      var on = t === btn;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    renderAll();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus(); selectTab(next);
    });
  });

  /* ======================================================================
     SIMULADOR
     ====================================================================== */
  var BASE = { minerio: 99, premio: 0, selic: 13.75 };

  // Vale — EBITDA em US$ bi
  function ebitdaVale(indice) {
    var realizado = indice * 0.88;
    var custo = 50;          // caixa all-in entregue na China
    var volume = 340;        // Mt, ponto médio do guidance 2026
    var metaisBasicos = 2.8; // US$ bi, não sensibilizado
    return ((realizado - custo) * volume) / 1000 + metaisBasicos;
  }

  // Gerdau — EBITDA em R$ bi
  function ebitdaGerdau(premio, selic) {
    var na = 10.4;                                   // R$ 2,6 bi anualizado
    var deltaNA = (premio * 4.4 * 5.20) / 1000;      // Mt × US$/t × câmbio
    var brasil = 3.2 * (1 + 0.06 * (13.75 - selic)); // elasticidade de 6% por p.p.
    return na + deltaNA + brasil;
  }

  var BASE_V = ebitdaVale(BASE.minerio);
  var BASE_G = ebitdaGerdau(BASE.premio, BASE.selic);

  var sMin = document.getElementById('s-minerio');
  var sPre = document.getElementById('s-premio');
  var sSel = document.getElementById('s-selic');

  if (sMin) {
    var oMin = document.getElementById('o-minerio');
    var oPre = document.getElementById('o-premio');
    var oSel = document.getElementById('o-selic');
    var outV = document.getElementById('out-vale');
    var outG = document.getElementById('out-gerdau');
    var dV = document.getElementById('d-vale');
    var dG = document.getElementById('d-gerdau');
    var mark = document.getElementById('tiltMark');
    var txt = document.getElementById('tiltText');

    function setDelta(node, pct) {
      node.textContent = (pct > 0 ? '+' : '') + fmt(pct, 1) + '%';
      node.className = pct > 0.5 ? 'up' : pct < -0.5 ? 'down' : 'flat';
    }

    function update() {
      var minerio = +sMin.value, premio = +sPre.value, selic = +sSel.value;

      oMin.textContent = 'US$ ' + minerio + '/t';
      oPre.textContent = (premio > 0 ? '+' : '') + 'US$ ' + premio + '/t';
      oSel.textContent = fmt(selic, 2) + '%';

      var v = ebitdaVale(minerio);
      var g = ebitdaGerdau(premio, selic);

      outV.innerHTML = fmt(v, 1) + '<small>US$ bi</small>';
      outG.innerHTML = fmt(g, 1) + '<small>R$ bi</small>';

      var pv = ((v / BASE_V) - 1) * 100;
      var pg = ((g / BASE_G) - 1) * 100;
      setDelta(dV, pv);
      setDelta(dG, pg);

      // Inclinação: diferença relativa, limitada a ±60 p.p.
      var diff = Math.max(-60, Math.min(60, pg - pv));
      mark.style.left = (50 + (diff / 60) * 46) + '%';

      var msg;
      if (diff > 22) {
        msg = '<b>A tese pende claramente para a Gerdau.</b> Neste cenário o prêmio tarifário e/ou o alívio de juros mais do que compensam o que a Vale perde no preço da commodity — é o cenário-central desta análise para 2026–27.';
      } else if (diff > 7) {
        msg = '<b>Leve vantagem para a Gerdau.</b> A divergência existe, mas não é grande o suficiente para justificar concentração: uma carteira com as duas continua fazendo sentido.';
      } else if (diff < -22) {
        msg = '<b>A tese se inverte a favor da Vale.</b> Minério nesta faixa recoloca a mineradora como o ativo dominante da cadeia — e o dividendo deixa de ser o único argumento de compra.';
      } else if (diff < -7) {
        msg = '<b>Leve vantagem para a Vale.</b> O preço do minério compensa a perda relativa de posicionamento; a recomendação de MANTER passaria a ser revisitada.';
      } else {
        msg = 'As duas teses se <b>equilibram</b>. Nesta região a escolha depende do objetivo do investidor — renda corrente (Vale) ou valorização de médio prazo (Gerdau) — e não do cenário macro.';
      }
      txt.innerHTML = msg;
    }

    [sMin, sPre, sSel].forEach(function (s) { s.addEventListener('input', update); });
    document.getElementById('s-reset').addEventListener('click', function () {
      sMin.value = BASE.minerio; sPre.value = BASE.premio; sSel.value = BASE.selic;
      update();
    });
    update();
  }

  /* ======================================================================
     NAVEGAÇÃO: barra de progresso, scroll-spy, revelação
     ====================================================================== */
  var progress = document.getElementById('progress');
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('#navLinks a'));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';

    var mark = h.scrollTop + window.innerHeight * 0.34;
    var current = -1;
    sections.forEach(function (sec, i) { if (sec.offsetTop <= mark) current = i; });
    navAnchors.forEach(function (a, i) {
      if (i === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Revelação em rolagem
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(function (n) { io.observe(n); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (n) { n.classList.add('is-in'); });
  }

  /* ---------- Início ---------- */
  renderAll();
  onScroll();
  window.addEventListener('load', renderAll);
})();
