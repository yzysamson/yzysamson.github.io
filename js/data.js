async function loadAll(){
  ROOMS=(await sb.from('rooms').select('*').order('id')).data||[];
  BOOKINGS = (await sb.from('bookings').select('*')).data || [];
  BOOKINGS.forEach(b=>delete b.__hidden);

  buildLegend();
  buildDays();
  buildSelects();
  render();
  renderSummary();
}
