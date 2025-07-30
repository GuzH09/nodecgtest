module.exports = function (nodecg) {
  // Replicants shared with graphics
  const leaderboardRep = nodecg.Replicant('leaderboard', { defaultValue: [] });
  const currentLapRep  = nodecg.Replicant('currentLap', { defaultValue: 1 });

  // Configuration
  const LAP_START = 1; // inclusive
  const LAP_END   = 10; // inclusive
  const DELAY_MS  = 3000;  // 5 s between requests

  // Fetch function – fall back to node-fetch if global fetch is absent
  let fetchFn;
  try {
    fetchFn = global.fetch ? global.fetch.bind(global) : require('node-fetch');
  } catch (err) {
    nodecg.log.error('Unable to initialise fetch', err);
    return;
  }

  function parseLapTime(timeStr) {
    const [minPart, secPart] = timeStr.split(':');
    return parseInt(minPart, 10) * 60 + parseFloat(secPart);
  }

  // Keep cumulative total times per driver across laps
  const cumulativeTimes = new Map(); // driverId -> total seconds

  function buildLeaderboard(timings) {
    if (!Array.isArray(timings) || timings.length === 0) return [];

    // ------------------ Update cumulative totals ------------------
    timings.forEach(({ driverId, time }) => {
      const prevTotal = cumulativeTimes.get(driverId) || 0;
      cumulativeTimes.set(driverId, prevTotal + parseLapTime(time));
    });

    // Convert to array for sorting
    const driverTotals = Array.from(cumulativeTimes.entries()).map(([driverId, total]) => ({ driverId, total }));

    // Sort by total accumulated time (ascending)
    driverTotals.sort((a, b) => a.total - b.total);

    const leaderTotal = driverTotals[0].total;

    // Build leaderboard objects
    return driverTotals.map(({ driverId, total }, index) => {
      const pos = index + 1;
      const code = driverId.slice(0, 3).toUpperCase();
      const gap = pos === 1 ? 'Interval' : `+${(total - leaderTotal).toFixed(3)}`;
      return { pos, code, gap };
    });
  }

  async function fetchLapAndUpdate(lapNumber) {
    const url = `https://api.jolpi.ca/ergast/f1/2025/4/laps/${lapNumber}/`;
    try {
      const res = await fetchFn(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const timings = json?.MRData?.RaceTable?.Races?.[0]?.Laps?.[0]?.Timings ?? [];

      const leaderboard = buildLeaderboard(timings);
      leaderboardRep.value = leaderboard;
      currentLapRep.value  = lapNumber;

      nodecg.log.info(`Updated leaderboard for lap ${lapNumber}`);
    } catch (err) {
      nodecg.log.error(`Failed to fetch lap ${lapNumber}:`, err);
    }
  }

  function startSimulation() {
    let lap = LAP_START;
    const step = async () => {
      await fetchLapAndUpdate(lap);
      lap += 1;
      if (lap <= LAP_END) {
        setTimeout(step, DELAY_MS);
      }
    };
    step();
  }

  // Start simulation when the bundle loads
  startSimulation();
};
