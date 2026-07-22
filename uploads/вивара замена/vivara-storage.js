const KEY = 'vivara_submissions_v1';

export function loadSubmissions() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
}

export function saveSubmission(record) {
  const list = loadSubmissions();
  list.push({ id: 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), createdAt: new Date().toISOString(), ...record });
  localStorage.setItem(KEY, JSON.stringify(list));
}

// Merge records that share a phone/contact so one person's заявка + анкета show as one row
export function mergeByContact(list) {
  const norm = (v) => (v || '').replace(/\D/g, '').slice(-10);
  const groups = [];
  list.forEach((rec) => {
    const key = norm(rec.phone || rec.contact);
    let group = key ? groups.find((g) => g.key === key) : null;
    if (!group) { group = { key: key || rec.id, items: [] }; groups.push(group); }
    group.items.push(rec);
  });
  return groups.map((g) => {
    const items = g.items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return {
      id: items[0].id,
      name: items.map((i) => i.name).find(Boolean) || '—',
      phone: items.map((i) => i.phone || i.contact).find(Boolean) || '—',
      email: items.map((i) => i.email).find(Boolean) || null,
      types: items.map((i) => i.type),
      firstAt: items[0].createdAt,
      lastAt: items[items.length - 1].createdAt,
      items,
    };
  }).sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
}
