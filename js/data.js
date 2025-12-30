function normalizeBookings(data) {
  return data.map(b => ({
    ...b,
    room: ROOMS.find(r => r.id === b.room_id)?.name || ''
  }));
}

async function loadAll(){
  ROOMS = (await sb.from('rooms').select('*').order('id')).data || [];

  const { data } = await sb.from('bookings').select('*');
  BOOKINGS = normalizeBookings(data || []);

  buildLegend();
  buildDays();
  buildSelects();
  render();
  renderSummary();
}

