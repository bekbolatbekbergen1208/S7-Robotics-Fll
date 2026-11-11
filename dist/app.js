const grid = document.getElementById('team-grid');
const members = [
  'Bekbergen Bekbolat',
  'Kaldarbekov Arman',
  'Mendullayev Arlan',
  'Kairbulatova Ainara',
  'Sergey Ulpan',
  'Mussiraliyev Mansur',
  'Kassym Kabilgaly',
  'Tuleshov Dariy',
];
for (const [index, name] of members.entries()) {
  if (!grid) break;
  const card = document.createElement('article');
  card.className = 'member';
  card.innerHTML = `<div class="portrait"><span>${String(index + 1).padStart(2,'0')}</span><svg viewBox="0 0 90 110" aria-hidden="true"><circle cx="45" cy="33" r="19"/><path d="M12 101v-9a33 33 0 0 1 66 0v9"/></svg></div><h3>${name}</h3>`;
  grid.appendChild(card);
}
