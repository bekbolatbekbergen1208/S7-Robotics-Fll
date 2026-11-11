const grid = document.getElementById('team-grid');
const members = [
  { name: 'Bekbergen Bekbolat', photo: 'bekbolat' },
  { name: 'Kaldarbekov Arman', photo: 'arman' },
  { name: 'Mendullayev Arlan', photo: 'arlan' },
  { name: 'Kairbulatova Ainara', photo: 'ainara' },
  { name: 'Sergey Ulpan', photo: 'ulpan' },
  { name: 'Mussiraliyev Mansur', photo: 'mansur' },
  { name: 'Tuleshov Dariy', photo: 'dariy' },
];
for (const { name, photo } of members) {
  if (!grid) break;
  const card = document.createElement('article');
  card.className = 'member';
  card.innerHTML = `<div class="portrait"><img src="assets/team/${photo}.jpg?v=3" alt=""></div><h3>${name.split(' ').map(part => '<span>' + part + '</span>').join(' ')}</h3>`;
  grid.appendChild(card);
}
