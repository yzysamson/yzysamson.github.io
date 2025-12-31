function normalizeBookings(data) {
  return data.map(b => ({
    ...b,
    room: ROOMS.find(r => r.id === b.room_id)?.name || ''
  }));
}

async function loadAll(){
  ROOMS = (await sb.from('rooms').select('*').order('id')).data || [];

  const { data, error } = await sb.from('bookings').select('*');
  if (error) {
    console.error(error);
    return;
  }

  BOOKINGS = (data || []).map(b => ({
    ...b,
    room: ROOMS.find(r => r.id === b.room_id)?.name || ''
  }));

  buildLegend();
  buildDays();
  buildSelects();
  render();
  renderSummary();
}


