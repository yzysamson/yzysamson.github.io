async function loadAll(){
  ROOMS=(await sb.from('rooms').select('*').order('id')).data||[];
  BOOKINGS = (await sb.from('bookings').select('*')).data || [];

// ⭐ 关键：补 room 名字（给 render 用）
BOOKINGS.forEach(b => {
  const r = ROOMS.find(r => r.id === b.room_id);
  b.room = r ? r.name : '';
});

  BOOKINGS.forEach(b=>delete b.__hidden);

  buildLegend();
  buildDays();
  buildSelects();
  render();
  renderSummary();
}
