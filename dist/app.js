const grid = document.getElementById('team-grid');
for (let i = 1; grid && i <= 8; i++) {
  const card = document.createElement('article');
  card.className = 'member';
  card.innerHTML = `<div class="portrait"><span>${String(i).padStart(2,'0')}</span><svg viewBox="0 0 90 110" aria-hidden="true"><circle cx="45" cy="33" r="19"/><path d="M12 101v-9a33 33 0 0 1 66 0v9"/></svg></div><h3>Team member ${String(i).padStart(2,'0')}</h3><p>Photo & introduction coming soon</p>`;
  grid.appendChild(card);
}
