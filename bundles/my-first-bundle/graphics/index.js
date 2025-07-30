// Graphics overlay for the simulated F1 leaderboard.
// Now animates ranking changes and listens to Replicants only.

nodecg.log.info('Graphics overlay loaded');

/* ---------------------------------------------------------------------------
 * Replicants
 * -------------------------------------------------------------------------*/
const leaderboardRep = nodecg.Replicant('leaderboard');
const currentLapRep  = nodecg.Replicant('currentLap');

/* ---------------------------------------------------------------------------
 * DOM helpers
 * -------------------------------------------------------------------------*/
const displayEl = document.getElementById('display');
let prevLeaderboard = [];

function renderLeaderboard(drivers = []) {
  const lb = document.getElementById('leaderboard');
  if (!lb) return;

  lb.innerHTML = '';
  const prevMap = new Map(prevLeaderboard.map((d) => [d.code, d.pos]));

  drivers.forEach((driver) => {
    const row = document.createElement('div');
    row.className = 'row';

    const prevPos = prevMap.get(driver.code);
    if (prevPos !== undefined && prevPos !== driver.pos) {
      // Position changed – add animation class
      const movementClass = prevPos > driver.pos ? 'up' : 'down';
      row.classList.add(movementClass);
    }

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

  // Save for next diff
  prevLeaderboard = drivers;
}

/* ---------------------------------------------------------------------------
 * Replicant listeners
 * -------------------------------------------------------------------------*/
leaderboardRep.on('change', (newVal) => {
  if (Array.isArray(newVal)) {
    renderLeaderboard(newVal);
  }
});

currentLapRep.on('change', (lap) => {
  if (displayEl && typeof lap === 'number') {
    displayEl.textContent = `Lap ${lap}`;
  }
});
