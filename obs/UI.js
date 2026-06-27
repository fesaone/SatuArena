const KEY_UI = 'ui_sync_state';
  const app = document.getElementById('app');
  const syncEl = document.getElementById('syncToggle');

  const isOn = () => syncEl.classList.contains('on');

  /* ---- Capture & Save ---- */
  function capture() {
    const activeTab = (app.querySelector('.tab.active') || {}).dataset?.tab || 'tab-ringkasan';
    const collapses = {};
    app.querySelectorAll('.panel').forEach(p => {
      collapses[p.id] = [...p.querySelectorAll('.acc.open')].map(a => a.dataset.acc);
    });
    // Simpan juga state mini-toggle & button grid
    const toggles = {};
    app.querySelectorAll('.mini-toggle').forEach(t => {
      toggles[t.dataset.toggle] = t.classList.contains('on');
    });
    const btnGrids = {};
    app.querySelectorAll('.panel').forEach(p => {
      btnGrids[p.id] = [...p.querySelectorAll('.grid')].map(g => {
        const activeBtn = g.querySelector('.btn.on');
        return activeBtn ? [...g.children].indexOf(activeBtn) : -1;
      });
    });
    return { activeTab, collapses, toggles, btnGrids };
  }

  function save() {
    if (!isOn()) return;
    sessionStorage.setItem(KEY_UI, JSON.stringify(capture()));
  }

  /* ---- Apply State ---- */
  function apply(s) {
    if (!s) return;

    // Tab
    app.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === s.activeTab));
    app.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === s.activeTab));

    requestAnimationFrame(() => {
      // Collapse per panel
      app.querySelectorAll('.panel').forEach(p => {
        const saved = s.collapses[p.id] || [];
        p.querySelectorAll('.acc').forEach(a => {
          const body = a.querySelector('.acc-body');
          const shouldOpen = saved.includes(a.dataset.acc);
          a.classList.toggle('open', shouldOpen);
          body.style.maxHeight = shouldOpen ? body.scrollHeight + 'px' : '0px';
        });
      });

      // Mini toggles
      if (s.toggles) {
        Object.entries(s.toggles).forEach(([KEY_UI, val]) => {
          const el = app.querySelector(`.mini-toggle[data-toggle="${KEY_UI}"]`);
          if (el) el.classList.toggle('on', val);
        });
      }

      // Button grids per panel
      if (s.btnGrids) {
        Object.entries(s.btnGrids).forEach(([panelId, indices]) => {
          const panel = document.getElementById(panelId);
          if (!panel) return;
          const grids = panel.querySelectorAll('.grid');
          indices.forEach((idx, i) => {
            if (grids[i] && idx >= 0) {
              grids[i].querySelectorAll('.btn').forEach((b, j) => b.classList.toggle('on', j === idx));
            }
          });
        });
      }
    });
  }

  /* ---- Reset ---- */
  function reset() {
    app.querySelector('.tab').classList.add('active');
    app.getElementById('tab-ringkasan').classList.add('active');
    app.querySelectorAll('.acc').forEach(a => {
      a.classList.remove('open');
      a.querySelector('.acc-body').style.maxHeight = '0px';
    });
    app.querySelectorAll('.mini-toggle').forEach(t => t.classList.remove('on'));
    app.querySelectorAll('.grid').forEach(g => {
      g.querySelectorAll('.btn').forEach((b, i) => b.classList.toggle('on', i === 0));
    });
  }

  /* ---- Recalculate open collapse heights (after content change) ---- */
  function recalcHeights() {
    app.querySelectorAll('.acc.open').forEach(a => {
      const body = a.querySelector('.acc-body');
      body.style.maxHeight = body.scrollHeight + 'px';
    });
  }

  /* ---- Event Delegation ---- */

  // Tab
  app.querySelector('.tabs').addEventListener('click', e => {
    const t = e.target.closest('.tab');
    if (!t) return;
    app.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    app.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.tab).classList.add('active');
    save();
  });

  // Collapse
  app.addEventListener('click', e => {
    const head = e.target.closest('.acc-head');
    if (!head) return;
    const acc = head.parentElement;
    const body = acc.querySelector('.acc-body');
    const opening = !acc.classList.contains('open');
    acc.classList.toggle('open', opening);
    body.style.maxHeight = opening ? body.scrollHeight + 'px' : '0px';
    save();
  });

  // Button grid
  app.addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn || btn.closest('.acc-head') || btn.closest('.box-footer')) return;
    const grid = btn.closest('.grid');
    if (!grid) return;
    grid.querySelectorAll('.btn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    save();
  });

  // Mini toggle (pengaturan notifikasi)
  app.addEventListener('click', e => {
    const mt = e.target.closest('.mini-toggle');
    if (!mt) return;
    mt.classList.toggle('on');
    save();
  });

  // Form input
  app.addEventListener('input', e => {
    if (e.target.matches('.input, .textarea')) {
      // Perbarui height collapse yang sedang terbuka (karena konten berubah)
      recalcHeights();
      save();
    }
  });

  // Sync toggle
  syncEl.addEventListener('click', () => {
    syncEl.classList.toggle('on');
    if (isOn()) {
      save();
    } else {
      sessionStorage.removeItem(KEY_UI);
      app.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      app.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      app.querySelectorAll('.btn').forEach(b => b.classList.remove('on'));
      reset();
    }
  });

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', () => {
    if (!isOn()) return;
    const raw = sessionStorage.getItem(KEY_UI);
    if (raw) {
      try { apply(JSON.parse(raw)); } catch { save(); }
    } else {
      save();
    }
  });