function norm(s){return s.toLowerCase().replace(/[^a-z]/g,'')}

/*const sb = supabase.createClient(
  'https://pwscsukxfnbzjciuhtwl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2NzdWt4Zm5iempjaXVodHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MzU1MDQsImV4cCI6MjA4MjExMTUwNH0.YQEXs1S3wprPMOarCL_DLXDtsSgY6I7TFM4bp_gLkW8'
);*/

const sb = supabase.createClient(
  'https://pwscsukxfnbzjciuhtwl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2NzdWt4Zm5iempjaXVodHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MzU1MDQsImV4cCI6MjA4MjExMTUwNH0.YQEXs1S3wprPMOarCL_DLXDtsSgY6I7TFM4bp_gLkW8',
  {
    auth: {
      persistSession: true,      // ⭐ 必须
      autoRefreshToken: true,    // ⭐ 必须
      detectSessionInUrl: true,  // ⭐ Magic link 必须
      storage: window.localStorage
    }
  }
);

const SOURCES=[
  'Airbnb','Booking','Agoda','Trip','SLH',
  'Walk-in (Wayne)','Walk-in (Soo)'
];

function formatRM(n){
  const v = Number(n || 0);
  return 'RM ' + v.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
