// Game configuration and state variables
const GOAL_CANS = 20;        // Default total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;           // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the timer
let timeLeft = 30;           // Timer starts at 30 seconds
let activeGoalCans = GOAL_CANS;
let activeSpawnSpeed = 1000;

const DIFFICULTY_SETTINGS = {
  Easy: { goal: 15, time: 45, spawnRate: 1200 },
  Normal: { goal: 20, time: 30, spawnRate: 900 },
  Hard: { goal: 30, time: 20, spawnRate: 700 }
};

const MILESTONE_MESSAGES = [
  { score: 10, message: 'Great job! Halfway there!' },
  { score: 20, message: 'Amazing! You reached 20 cans!' },
  { score: 30, message: 'Unstoppable! 30 cans collected!' }
];

let triggeredMilestones = new Set();

function getSelectedDifficulty() {
  return document.querySelector('input[name="difficulty"]:checked')?.value || 'Normal';
}

// Random names for leaderboard
const names = ["WaterCollector", "TankHolder", "CanCarrier", "DropCatcher", "WellFiller", "HydrationHero", "AquaSeeker", "StreamSaver", "RainHarvester", "FlowGuardian", "PureProvider", "ThirstQuencher", "ReservoirRanger", "SpringSupplier", "OasisBuilder"];

// Arrays for end game messages
const winningMessages = [
  "Amazing! You collected enough water for a community!",
  "Victory! Your efforts will help provide clean water.",
  "Well done! You've made a real difference.",
  "Champion! Water crisis averted in your game!",
  "Fantastic! You're a water hero!"
];

const losingMessages = [
  "Try again! Every click brings us closer to clean water.",
  "Keep going! The world needs more water warriors like you.",
  "Not quite there! Practice makes perfect.",
  "Better luck next time! Your efforts matter.",
  "Almost! Give it another shot."
];

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();
updateGoalText();
displayLeaderboard();

// Updates the score display
function updateScore() {
  document.getElementById('current-cans').textContent = currentCans;
}

function showAchievement(message) {
  const achievementEl = document.getElementById('achievements');
  achievementEl.textContent = message;
  achievementEl.style.opacity = '1';
  setTimeout(() => {
    achievementEl.style.opacity = '0';
    setTimeout(() => { achievementEl.textContent = ''; }, 500);
  }, 2000);
}

function checkMilestone() {
  const milestone = MILESTONE_MESSAGES.find(m => m.score === currentCans);
  if (milestone && !triggeredMilestones.has(milestone.score)) {
    triggeredMilestones.add(milestone.score);
    showAchievement(milestone.message);
  }
}

// Updates the timer display
function updateTimer() {
  document.getElementById('timer').textContent = timeLeft;
  if (gameActive) {
    updateGoalText();
  }
}

// Updates the instruction text with the current difficulty and goal
function updateGoalText() {
  const difficulty = getSelectedDifficulty();
  const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.Normal;

  if (!gameActive) {
    activeGoalCans = settings.goal;
    timeLeft = settings.time;
  }

  const displayGoal = gameActive ? activeGoalCans : settings.goal;
  const displayTime = gameActive ? timeLeft : settings.time;

  document.getElementById('game-instructions').textContent =
    `Mode: ${difficulty} — collect ${displayGoal} cans in ${displayTime} seconds!`;
}

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Use a template literal to create the wrapper and water-can element
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;

  // Add click event listener to the water can
  const canWrapper = randomCell.querySelector('.water-can-wrapper');
  canWrapper.addEventListener('click', () => {
    if (!gameActive) return;

    currentCans++;
    updateScore();
    checkMilestone();

    // Remove clicked can immediately (DOM interaction feedback)
    canWrapper.remove();

    // Add a quick sparkle effect on click
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    randomCell.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 350);
  });
}

// Timer function to decrement time
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active

  const selected = getSelectedDifficulty();
  const settings = DIFFICULTY_SETTINGS[selected] || DIFFICULTY_SETTINGS.Normal;
  activeGoalCans = settings.goal;
  timeLeft = settings.time;
  activeSpawnSpeed = settings.spawnRate;

  gameActive = true;
  currentCans = 0;

  updateScore();
  updateTimer();
  updateGoalText();
  document.getElementById('game-message').textContent = '';
  createGrid(); // Set up the game grid

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  triggeredMilestones.clear();
  document.getElementById('achievements').textContent = '';

  spawnInterval = setInterval(spawnWaterCan, activeSpawnSpeed);
  startTimer();
}

// Ends the game and displays a message
function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop the timer

  // Determine win or lose
  let message;
  const isWin = currentCans >= activeGoalCans;
  if (isWin) {
    message = winningMessages[Math.floor(Math.random() * winningMessages.length)];
    showWaterEffect();
  } else {
    message = losingMessages[Math.floor(Math.random() * losingMessages.length)];
  }

  // Display the message
  document.getElementById('game-message').textContent = message;

  // Add to leaderboard
  addToLeaderboard(currentCans);
}

// Shows water effect when winning
function showWaterEffect() {
  for (let i = 0; i < 30; i++) {
    const drop = document.createElement('div');
    drop.className = 'water-drop';
    drop.style.left = Math.random() * 100 + '%';
    drop.style.animationDelay = Math.random() * 2 + 's';
    drop.style.animationDuration = (2 + Math.random() * 2) + 's';
    document.body.appendChild(drop);
    setTimeout(() => drop.remove(), 5000);
  }
}

// Adds score to leaderboard
function addToLeaderboard(score) {
  const name = names[Math.floor(Math.random() * names.length)];
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  displayLeaderboard();
}

// Displays the leaderboard
function displayLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}

// Set up difficulty change handler
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
difficultyRadios.forEach(radio => radio.addEventListener('change', updateGoalText));

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
