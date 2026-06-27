const state = { home: [], away: [] };

function render(team) {
  const ballsEl = document.getElementById(team + 'Balls');
  const scoreEl = document.getElementById(team + 'Score');
  const penalties = state[team];
  const total = penalties.length;

  const displayRound = total % 5 === 0 && total > 0
    ? Math.floor(total / 5) - 1
    : Math.floor(total / 5);

  const roundStart = displayRound * 5;
  const roundPenalties = penalties.slice(roundStart, roundStart + 5);

  ballsEl.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const ball = document.createElement('span');
    ball.classList.add('ball');
    if (roundPenalties[i] === 'goal') ball.classList.add('goal');
    else if (roundPenalties[i] === 'miss') ball.classList.add('miss');
    ballsEl.appendChild(ball);
  }

  scoreEl.textContent = penalties.filter(p => p === 'goal').length;
}

function addPenalty(team, result) {
  state[team].push(result);
  render(team);
}

function removePenalty(team) {
  state[team].pop();
  render(team);
}

function askReset() {
  document.getElementById('confirmBox').classList.add('show');
}

function cancelReset() {
  document.getElementById('confirmBox').classList.remove('show');
}

function doReset() {
  state.home = [];
  state.away = [];
  document.getElementById('confirmBox').classList.remove('show');
  render('home');
  render('away');
}

render('home');
render('away');