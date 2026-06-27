const KEY = 'football_multi_state_v3';
let editKlubId = null, editMatchId = null, delMatchId = null, delKlubId = null;
let tempImportData = null; 

// ===================== STATE =====================
function def() {
    return {
        event: { name: 'Piala Indonesia', season: '2026/2027', logo: '' },
        klub: [],
        match: [],
        active: null
    };
}

function get() {
    try {
        const r = localStorage.getItem(KEY);
        if (!r) return def();
        const d = JSON.parse(r);
        if (!d.event || typeof d.event !== 'object') d.event = def().event;
        if (!Array.isArray(d.klub)) d.klub = [];
        if (!Array.isArray(d.match)) d.match = [];
        return d;
    } catch(e) { return def(); }
}

function put(s) { localStorage.setItem(KEY, JSON.stringify(s)); renderAll(); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
function club(s, id) { if (!id) return null; return s.klub.find(k => k.id === id) || null; }
function esc(v) { if(!v) return ''; const d = document.createElement('div'); d.textContent = v; return d.innerHTML; }

// ===================== TAB LOGIC =====================
function switchTab(tabId, btnEl) {
    // Hapus class 'active' dari semua tombol dan konten tab
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Tambahkan class 'active' ke tombol yang diklik dan konten terkait
    btnEl.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// ===================== RENDER =====================
function renderAll() { 
    renderDisplay(); 
    if (document.getElementById('klubListChips')) renderKlubChips(); 
    if (document.getElementById('matchListBody')) renderTable(); 
}

function renderDisplay() {
    const s = get(), ev = s.event;
    const emptyEl = document.getElementById('scEmpty');
    const scorecardEls = document.querySelectorAll('.sc-body, .sc-info, img[data-event="logo"]');

    if (!s.active) {
        setText('[data-event="name"]', ev.name || '');
        setText('[data-event="season"]', ev.season || '');
        setSrc('[data-event="logo"]', ev.logo);
        setText('[data-event="babak"]', '');
        setText('[data-event="kategori"]', '');
        setText('[data-klub-skt="home"]', '');
        setText('[data-klub-name="home"]', '');
        setSrc('[data-klub-logo="home"]', '');
        setText('[data-klub-skt="away"]', '');
        setText('[data-klub-name="away"]', '');
        setSrc('[data-klub-logo="away"]', '');

        if (emptyEl) emptyEl.style.display = 'block';
        scorecardEls.forEach(el => el.style.display = 'none');
        return;
    }

    const m = s.match.find(x => x.id === s.active);
    if (!m) { 
        s.active = null; 
        localStorage.setItem(KEY, JSON.stringify(s)); 
        renderDisplay(); 
        return; 
    }

    const h = club(s, m.home), a = club(s, m.away);

    setText('[data-event="name"]', ev.name || '');
    setText('[data-event="season"]', ev.season || '');
    setSrc('[data-event="logo"]', ev.logo);

    setText('[data-event="babak"]', m.babak || '');
    setText('[data-event="kategori"]', m.kategori || '');

    setText('[data-klub-skt="home"]', h ? (h.skt || h.name) : '???');
    setText('[data-klub-name="home"]', h ? h.name : '');
    setSrc('[data-klub-logo="home"]', h ? h.logo : '');

    setText('[data-klub-skt="away"]', a ? (a.skt || a.name) : '???');
    setText('[data-klub-name="away"]', a ? a.name : '');
    setSrc('[data-klub-logo="away"]', a ? a.logo : '');

    if (emptyEl) emptyEl.style.display = 'none';
    scorecardEls.forEach(el => el.style.display = '');
}

function setText(selector, value) {
    document.querySelectorAll(selector).forEach(el => {
        if (el.textContent !== value) el.textContent = value;
    });
}

function setSrc(selector, value) {
    document.querySelectorAll(selector).forEach(el => {
        const newVal = value || '';
        if (el.getAttribute('src') !== newVal) el.src = newVal;
    });
}

function renderKlubChips() {
    const container = document.getElementById('klubListChips');
    if (!container) return;
    const s = get();
    
    if (!s.klub.length) {
        container.innerHTML = '<div style="color:#333; font-size:0.85rem; font-style:italic; padding: 6px 0;">Belum ada klub. Klik "Tambah Klub".</div>';
        return;
    }
    
    container.innerHTML = s.klub.map(k => `
        <div class="klub-chip">
            ${k.logo ? `<img src="${esc(k.logo)}" alt="">` : ''}
            <span class="chip-skt">${esc(k.skt || '???')}</span>
            <span class="chip-name">${esc(k.name)}</span>
            <button onclick="askDelKlub('${k.id}')" title="Hapus Klub">&times;</button>
        </div>
    `).join('');
}

function renderTable() {
    const tb = document.getElementById('matchListBody');
    if (!tb) return;
    const s = get();
    
    if (!s.match.length) {
        tb.innerHTML = '<tr class="empty-row"><td colspan="7">Belum ada pertandingan. Tambahkan klub terlebih dahulu, lalu buat pertandingan.</td></tr>';
        return;
    }
    
    tb.innerHTML = s.match.map((m, i) => {
        const h = club(s, m.home), a = club(s, m.away);
        const act = s.active === m.id ? ' active' : '';
        return `<tr class="${act}">
            <td style="color:#555; font-size:0.8rem;">${i+1}</td>
            <td><div class="td-team">
                ${h && h.logo ? `<img src="${esc(h.logo)}" alt="">` : ''}
                <div class="td-team-info">
                    <span class="td-skt">${h ? esc(h.skt || h.name) : '???'}</span>
                    <span class="td-name">${h ? esc(h.name) : ''}</span>
                </div>
            </div></td>
            <td class="td-vs">VS</td>
            <td><div class="td-team away-team">
                <div class="td-team-info" style="text-align:right;">
                    <span class="td-skt">${a ? esc(a.skt || a.name) : '???'}</span>
                    <span class="td-name">${a ? esc(a.name) : ''}</span>
                </div>
                ${a && a.logo ? `<img src="${esc(a.logo)}" alt="">` : ''}
            </div></td>
            <td class="td-meta">${esc(m.babak) || '—'}</td>
            <td class="td-meta">${esc(m.kategori) || '—'}</td>
            <td class="td-actions">
                <button class="btn btn-sm" onclick="openEditMatch('${m.id}')">Edit</button>
                <button class="btn btn-sm btn-dark-red" onclick="askDel('${m.id}')">Hapus</button>
                <button class="btn btn-sm btn-green" onclick="useMatch('${m.id}')">Gunakan</button>
            </td>
        </tr>`;
    }).join('');
}

// ===================== POPUP =====================
function open(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', e => { 
    if (e.target.classList.contains('modal-bg') && e.target.classList.contains('open')) { 
        e.target.classList.remove('open'); 
    } 
});

// ===================== EVENT CONFIG =====================
function openEvent() {
    const ev = get().event;
    document.getElementById('eName').value = ev.name || '';
    document.getElementById('eSeason').value = ev.season || '';
    document.getElementById('eLogo').value = ev.logo || '';
    open('mEvent');
}

function saveEvent() {
    const s = get();
    s.event.name = document.getElementById('eName').value.trim();
    s.event.season = document.getElementById('eSeason').value.trim();
    s.event.logo = document.getElementById('eLogo').value.trim();
    put(s); closeModal('mEvent');
}

// ===================== KLUB CRUD =====================
function openKlub(id) {
    editKlubId = id || null;
    document.getElementById('klubTitle').textContent = id ? 'Edit Klub' : 'Tambah Klub';
    if (id) {
        const k = club(get(), id);
        if (k) {
            document.getElementById('kName').value = k.name || '';
            document.getElementById('kSkt').value = k.skt || '';
            document.getElementById('kLogo').value = k.logo || '';
        }
    } else {
        document.getElementById('kName').value = '';
        document.getElementById('kSkt').value = '';
        document.getElementById('kLogo').value = '';
    }
    open('mKlub');
}

function saveKlub() {
    const name = document.getElementById('kName').value.trim();
    const skt = document.getElementById('kSkt').value.trim().toUpperCase();
    const logo = document.getElementById('kLogo').value.trim();
    if (!name && !skt) { document.getElementById('kName').focus(); return; }
    const s = get();
    if (editKlubId) {
        const k = club(s, editKlubId);
        if (k) { k.name = name; k.skt = skt; k.logo = logo; }
    } else {
        s.klub.push({ id: uid(), skt, name, logo });
    }
    put(s); closeModal('mKlub'); editKlubId = null;
}

function askDelKlub(id) {
    const s = get(), k = club(s, id);
    if (!k) return;
    document.getElementById('delPrevKlub').textContent = `[${k.skt || '???'}] ${k.name}`;
    delKlubId = id;
    open('mDelKlub');
}

function doDeleteKlub() {
    if (!delKlubId) return;
    const s = get();
    s.klub = s.klub.filter(k => k.id !== delKlubId);
    s.match = s.match.filter(m => m.home !== delKlubId && m.away !== delKlubId);
    const activeStillExists = s.match.find(m => m.id === s.active);
    if (!activeStillExists) s.active = null;
    delKlubId = null;
    put(s); closeModal('mDelKlub');
}

// ===================== MATCH CRUD =====================
function fillSelects() {
    const s = get();
    ['mHome', 'mAway'].forEach(selId => {
        const sel = document.getElementById(selId);
        if (!sel) return;
        const val = sel.value; 
        sel.innerHTML = '<option value="">-- Pilih Klub --</option>';
        if (s.klub.length === 0) {
            sel.innerHTML = '<option value="">-- Belum ada klub --</option>';
        } else {
            s.klub.forEach(k => {
                const opt = document.createElement('option');
                opt.value = k.id;
                opt.textContent = `[${k.skt || '???'}] ${k.name}`;
                sel.appendChild(opt);
            });
        }
        sel.value = val; 
    });
}

function openMatch() {
    editMatchId = null;
    document.getElementById('matchTitle').textContent = 'Tambah Pertandingan';
    document.getElementById('mHome').value = '';
    document.getElementById('mAway').value = '';
    document.getElementById('mBabak').value = '';
    document.getElementById('mKat').value = '';
    fillSelects();
    open('mMatch');
}

function openEditMatch(id) {
    const s = get(), m = s.match.find(x => x.id === id);
    if (!m) return;
    editMatchId = id;
    document.getElementById('matchTitle').textContent = 'Edit Pertandingan';
    fillSelects();
    document.getElementById('mHome').value = m.home || '';
    document.getElementById('mAway').value = m.away || '';
    document.getElementById('mBabak').value = m.babak || '';
    document.getElementById('mKat').value = m.kategori || '';
    open('mMatch');
}

function saveMatch() {
    const home = document.getElementById('mHome').value;
    const away = document.getElementById('mAway').value;
    const babak = document.getElementById('mBabak').value.trim();
    const kat = document.getElementById('mKat').value.trim();
    if (!home) { document.getElementById('mHome').focus(); return; }
    if (!away) { document.getElementById('mAway').focus(); return; }
    if (home === away) { document.getElementById('mAway').focus(); return; }
    const s = get();
    if (editMatchId) {
        const m = s.match.find(x => x.id === editMatchId);
        if (m) { m.home = home; m.away = away; m.babak = babak; m.kategori = kat; }
    } else {
        s.match.push({ id: uid(), home, away, babak, kategori: kat });
    }
    put(s); closeModal('mMatch'); editMatchId = null;
}

// ===================== DELETE PERTANDINGAN =====================
function askDel(id) {
    const s = get(), m = s.match.find(x => x.id === id);
    if (!m) return;
    const h = club(s, m.home), a = club(s, m.away);
    const ht = h ? (h.skt || h.name) : '???';
    const at = a ? (a.skt || a.name) : '???';
    document.getElementById('delPrev').textContent = `${ht} vs ${at}`;
    delMatchId = id;
    open('mDel');
}

function doDelete() {
    if (!delMatchId) return;
    const s = get();
    s.match = s.match.filter(x => x.id !== delMatchId);
    if (s.active === delMatchId) s.active = null;
    delMatchId = null;
    put(s); closeModal('mDel');
}

// ===================== GUNAKAN (AKTIFKAN DISPLAY) =====================
function useMatch(id) {
    const s = get();
    if (s.match.find(x => x.id === id)) {
        s.active = id;
        put(s);
        // Opsional: Otomatis pindah ke tab pertandingan saat menggunakan match
        // switchTab('tabMatch', document.querySelectorAll('.tab-btn')[1]);
    }
}

// ===================== EXPORT & IMPORT DATA =====================
function exportData() {
    const s = get();
    const fileName = `${s.event.name || 'football_data'}_${new Date().toISOString().slice(0,10)}.json`;
    const dataStr = JSON.stringify(s, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!imported.event || !Array.isArray(imported.klub) || !Array.isArray(imported.match)) {
                alert("Format file tidak valid! Pastikan file adalah hasil export yang benar.");
                return;
            }
            tempImportData = imported;
            document.getElementById('importPreview').innerHTML = `
                Event: <strong>${esc(imported.event.name || '-')}</strong><br>
                Jumlah Klub: <strong>${imported.klub.length}</strong><br>
                Jumlah Pertandingan: <strong>${imported.match.length}</strong>
            `;
            open('mImport');
        } catch (err) {
            alert("Gagal membaca file! Pastikan file berformat JSON yang valid.");
            console.error(err);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function doImport(mode) {
    if (!tempImportData) return;
    const current = get();
    const incoming = tempImportData;
    
    if (mode === 'replace') {
        put(incoming);
    } else if (mode === 'merge') {
        const currentKlubIds = new Set(current.klub.map(k => k.id));
        const currentMatchIds = new Set(current.match.map(m => m.id));
        
        incoming.klub.forEach(k => {
            if (!currentKlubIds.has(k.id)) current.klub.push(k);
        });
        
        incoming.match.forEach(m => {
            if (!currentMatchIds.has(m.id)) current.match.push(m);
        });
        
        if (!current.event.name || current.event.name === def().event.name) {
            current.event = incoming.event;
        }
        
        put(current);
    }
    tempImportData = null;
    closeModal('mImport');
}

// ===================== INIT =====================
renderAll();
window.addEventListener('storage', e => { if (e.key === KEY) renderAll(); });