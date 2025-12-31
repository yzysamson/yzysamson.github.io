console.log("done 32")

let suppressRealtime = false;

/* ===== LEGEND ===== */
function buildLegend() {
  legend.innerHTML = '';

  // ===== All =====
  const all = document.createElement('div');
  all.className = 'legend-item active';
  all.textContent = 'All';

  all.onclick = () => {
    FILTER.clear();
    updateLegendUI();
    render();
  };

  legend.appendChild(all);

  // ===== Sources =====
  SOURCES.forEach(s => {
    const el = document.createElement('div');
    el.className = 'legend-item active';
    el.dataset.source = s; // ✅ 关键

    el.innerHTML = `
      <span class="legend-color src-${norm(s)}"></span>
      ${s}
    `;

    el.onclick = () => {
  if (FILTER.size === 0) {
    // 当前是 All → 变成只选这个
    FILTER.add(s);
  } else {
    // 正常 toggle
    FILTER.has(s) ? FILTER.delete(s) : FILTER.add(s);

    // ⭐ 关键新增：如果已经全选 → 回到 All
    if (FILTER.size === SOURCES.length) {
      FILTER.clear();
    }
  }

  updateLegendUI();
  render();
};


    legend.appendChild(el);
  });
}


/* ===== DAYS ===== */
function buildDays(){
  const [y, m] = monthPicker.value.split('-').map(Number);
  DAYS = [...Array(new Date(y, m, 0).getDate())]
    .map((_, i) =>
      `${y}-${String(m).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`
    );
}

/* ===== CALENDAR RENDER ===== */
function render(){
  let html = '';
  const cols = `88px repeat(${DAYS.length},56px)`;

  html += `<div class="header" style="grid-template-columns:${cols}">
    <div class="room corner">
      <span class="corner-date">ROOM | DATE</span>
    </div>`;

  DAYS.forEach(d => html += `<div class="cell">${d.slice(8)}</div>`);
  html += `</div>`;

  ROOMS.forEach(r => {
    html += `<div class="row" style="grid-template-columns:${cols}">
      <div class="room">${r.name}</div>`;

    let i = 0;
    while (i < DAYS.length) {
      const d = DAYS[i];
      const b = BOOKINGS.find(x =>
        !x.__hidden &&
        x.room === r.name &&
        d >= x.check_in && d < x.check_out &&
        (FILTER.size === 0 || FILTER.has(x.source))
      );

      if (!b) {
        html += `<div class="cell"
          data-room="${r.name}"
          data-date="${d}"
          onclick="onCellClick(this,event)">
        </div>`;
        i++;
        continue;
      }

      const span = (new Date(b.check_out) - new Date(d)) / 86400000;
  html += `
  <div class="bar src-${norm(b.source)}"
       style="grid-column:span ${span}"
        data-booking-id="${b.id}"
       onpointerdown="onBarPointerDown(event, ${b.id})"
       onclick="openEdit(${b.id})">
    <span class="bar-price">${formatRM(b.price)}</span>
  </div>
`;

      i += span;
    }

    html += `</div>`;
  });

  app.innerHTML = html;
}

async function reloadBookings() {
  const { data, error } = await sb.from('bookings').select('*');

  if (error) {
    console.error('reloadBookings error:', error);
    return;
  }

  BOOKINGS = normalizeBookings(data || []);
  render();
  renderSummary();
}


// js/calendar.js

function buildSelects(){
  // Room select
  roomInput.innerHTML = '';
  ROOMS.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.name;
    roomInput.appendChild(opt);
  });

  // Source select
  sourceInput.innerHTML = '';

  
  SOURCES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    sourceInput.appendChild(opt);
  });
}

// js/calendar.js

function onCellClick(el, e){
  // 如果点的是 bar 或 bar 里面，直接 return
  if (e && e.target.closest('.bar')) return;
  const room = el.dataset.room;
  const date = el.dataset.date;

  // clear previous selecting
  document.querySelectorAll('.cell.selecting')
    .forEach(c => c.classList.remove('selecting'));

  // start selecting
  if (!selectState || selectState.room !== room || date <= selectState.checkin){
    selectState = { room, checkin: date };
    el.classList.add('selecting');
    return;
  }

  // end selecting → open modal
  openNew(room, selectState.checkin, date);
  selectState = null;
}

let DRAG_MODE = false;


render();

function setupRealtime() {
  sb.channel('bookings-realtime')
  .on(
  'postgres_changes',
  {
    event: '*',
    schema: 'public',
    table: 'bookings'
  },
  payload => {

    if (window.suppressRealtime) {
      console.log('[Realtime] ignored (local action)');
      return;
    }

    // ⭐⭐ 关键保护：未初始化完成，直接忽略
    if (!window.appInitialized || ROOMS.length === 0 || DAYS.length === 0) {
      console.log('[Realtime] skipped (app not ready)');
      return;
    }

    console.log('[Realtime] apply remote change');

const b = payload.new || payload.old;
if (!b) return;

// ===== 当前月区间 =====
const [y, m] = monthPicker.value.split('-').map(Number);
const monthStart = new Date(y, m - 1, 1);
const monthEnd = new Date(y, m, 0); // 当月最后一天

// ===== booking 区间 =====
const bStart = new Date(b.check_in);
const bEnd = new Date(b.check_out);

// ⭐⭐ 核心：区间是否有重叠
const overlaps =
  bStart <= monthEnd &&
  bEnd >= monthStart;

if (!overlaps) {
  console.log('[Realtime] change not overlapping current month, skip render');
  return;
}

// 只有真正影响当前月，才刷新
reloadBookings();

  }
)
  .subscribe();
}

function updateLegendUI() {
  const items = document.querySelectorAll('.legend-item');

  items.forEach(el => {
    const src = el.dataset.source;

    // All
    if (!src) {
      el.classList.toggle('active', FILTER.size === 0);
      return;
    }

    // Source
    const active =
      FILTER.size === 0 || FILTER.has(src);

    el.classList.toggle('active', active);
  });
}

