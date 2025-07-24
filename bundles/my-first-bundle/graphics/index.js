// You can access the NodeCG api anytime from the `window.nodecg` object
// Or just `nodecg` for short. Like this!:
nodecg.log.info("Here's an example of using NodeCG's logging API!");

// Display the replicant value in the graphics overlay
const displayEl = document.getElementById('display');
const displayText = nodecg.Replicant('displayText', { defaultValue: '' });

// Update the displayed text whenever the replicant changes
displayText.on('change', (newVal) => {
	if (displayEl) {
		displayEl.textContent = newVal;
	}
});

// ----- Mock Simracing HUD Leaderboard -----
const mockLeaderboard = [
  { pos: 1, code: 'SAN', gap: 'Interval' },
  { pos: 2, code: 'GUE', gap: '+0.647' },
  { pos: 3, code: 'GAR', gap: '+0.261' },
  { pos: 4, code: 'BRE', gap: '+0.326' },
  { pos: 5, code: 'LIN', gap: '+0.407' },
  { pos: 6, code: 'MEL', gap: '+0.155' },
  { pos: 7, code: 'WEH', gap: '+0.550' },
  { pos: 8, code: 'CRU', gap: '+1.275' },
  { pos: 9, code: 'CAS', gap: '+0.994' },
  { pos: 10, code: 'WIN', gap: '+0.499' },
  { pos: 11, code: 'REY', gap: '+1.203' },
  { pos: 12, code: 'PAY', gap: '+7.452' },
  { pos: 13, code: 'DES', gap: '+23.556' },
  { pos: 14, code: 'EST', gap: 'OUT' },
  { pos: 15, code: 'TER', gap: 'OUT' },
  { pos: 16, code: 'RIC', gap: 'OUT' },
  { pos: 17, code: 'LEC', gap: 'OUT' },
  { pos: 18, code: 'NOR', gap: 'OUT' },
  { pos: 19, code: 'TSU', gap: 'OUT' },
  { pos: 20, code: 'BOT', gap: 'OUT' },
];

function renderLeaderboard() {
  const lb = document.getElementById('leaderboard');
  if (!lb) return;
  lb.innerHTML = '';

  mockLeaderboard.forEach((driver) => {
    const row = document.createElement('div');
    row.className = 'row';
    
    let gapClass = '';
    if (driver.gap === 'OUT') gapClass = 'out';
    else if (driver.gap === 'Interval') gapClass = 'leader';
    
    row.innerHTML = `
		<span class="pos">${driver.pos}</span>
		<span class="code">${driver.code}</span>
		<span class="gap ${gapClass}">${driver.gap}</span>
	`;
    lb.appendChild(row);
  });
}

renderLeaderboard();
