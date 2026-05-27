const rooms = new Map();

const ROOM_TTL_MS = 10 * 60 * 1000;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEFAULT_LIVES = 3;

function generateCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function createRoom({ hostUsername, mode = 'race', difficulty = 'easy', length = 'medium', type = 'text', language = 'es', duration = 60 }) {
  const code = generateCode();
  const room = {
    code,
    host: hostUsername,
    mode,
    settings: { difficulty, length, type, language, duration },
    players: [],
    status: 'waiting',
    textId: null,
    text: null,
    startedAt: null,
    createdAt: Date.now(),
    _timeout: null,
    _gameTimer: null,   // Score Attack: server-side end timer
    _tickInterval: null, // Score Attack: tick interval
  };
  scheduleTimeout(room);
  rooms.set(code, room);
  return room;
}

function scheduleTimeout(room) {
  if (room._timeout) clearTimeout(room._timeout);
  room._timeout = setTimeout(() => {
    if (room.status === 'waiting') rooms.delete(room.code);
  }, ROOM_TTL_MS);
}

function getRoom(code) { return rooms.get(code) ?? null; }

function deleteRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  if (room._timeout)     clearTimeout(room._timeout);
  if (room._gameTimer)   clearTimeout(room._gameTimer);
  if (room._tickInterval) clearInterval(room._tickInterval);
  rooms.delete(code);
}

function addPlayer(code, { username, socketId }) {
  const room = rooms.get(code);
  if (!room) return null;
  if (room.players.find(p => p.username === username)) return room;
  room.players.push({
    username,
    socketId,
    ready: false,
    progress: 0,
    finished: false,
    eliminated: false,
    position: null,
    stats: null,
    lives: DEFAULT_LIVES, // Survival
    score: 0,             // Score Attack
  });
  return room;
}

function removePlayer(code, socketId) {
  const room = rooms.get(code);
  if (!room) return null;
  room.players = room.players.filter(p => p.socketId !== socketId);
  if (room.players.length === 0) { deleteRoom(code); return null; }
  return room;
}

function setReady(code, socketId, value) {
  const room = rooms.get(code);
  if (!room) return null;
  const p = room.players.find(p => p.socketId === socketId);
  if (p) p.ready = value;
  return room;
}

function allReady(room) {
  return room.players.length >= 2 && room.players.every(p => p.ready);
}

function updateProgress(code, socketId, pct) {
  const room = rooms.get(code);
  if (!room) return null;
  const p = room.players.find(p => p.socketId === socketId);
  if (p && !p.finished && !p.eliminated) p.progress = pct;
  return room;
}

function finishPlayer(code, socketId, stats) {
  const room = rooms.get(code);
  if (!room) return null;
  const finishedCount = room.players.filter(p => p.finished).length;
  const p = room.players.find(p => p.socketId === socketId);
  if (p && !p.finished && !p.eliminated) {
    p.finished = true;
    p.position = finishedCount + 1;
    p.stats = stats;
  }
  return room;
}

// Score Attack: add partial score when player completes a text
function addScore(code, socketId, stats) {
  const room = rooms.get(code);
  if (!room) return null;
  const p = room.players.find(p => p.socketId === socketId);
  if (p) {
    p.score += stats.score ?? 0;
    p.progress = 0; // reset progress for new text
  }
  return room;
}

// Survival: decrement lives, return true if eliminated
function recordError(code, socketId) {
  const room = rooms.get(code);
  if (!room) return { room: null, eliminated: false };
  const p = room.players.find(p => p.socketId === socketId);
  if (!p || p.eliminated || p.lives <= 0) return { room, eliminated: false };
  p.lives -= 1;
  if (p.lives <= 0) {
    p.eliminated = true;
    const aliveCount = room.players.filter(q => !q.eliminated).length;
    if (aliveCount === 1) {
      // Last survivor: assign position 1
      const survivor = room.players.find(q => !q.eliminated);
      if (survivor && !survivor.finished) {
        const finishedCount = room.players.filter(q => q.finished).length;
        survivor.finished = true;
        survivor.position = finishedCount + 1;
      }
    }
    // Assign position to eliminated player (worst among remaining)
    const nowEliminated = room.players.filter(q => q.eliminated).length;
    p.position = room.players.length - nowEliminated + 1;
    return { room, eliminated: true, aliveCount };
  }
  return { room, eliminated: false };
}

function allFinishedOrEliminated(room) {
  return room.players.length > 0 && room.players.every(p => p.finished || p.eliminated);
}

// Score Attack: assign final positions by score
function assignScoreAttackPositions(room) {
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  sorted.forEach((p, i) => {
    p.position = i + 1;
    p.finished = true;
    p.stats = { score: p.score, speed: 0, accuracy: 0, errors: 0, totalChar: 0, time: room.settings.duration };
  });
}

function sanitize(room) {
  return {
    code: room.code,
    host: room.host,
    mode: room.mode,
    settings: room.settings,
    status: room.status,
    players: room.players.map(p => ({
      username: p.username,
      ready: p.ready,
      progress: p.progress,
      finished: p.finished,
      eliminated: p.eliminated,
      position: p.position,
      stats: p.stats,
      lives: p.lives,
      score: p.score,
    })),
  };
}

module.exports = {
  createRoom, getRoom, deleteRoom, addPlayer, removePlayer,
  setReady, allReady, updateProgress, finishPlayer,
  addScore, recordError, allFinishedOrEliminated, assignScoreAttackPositions,
  sanitize,
};
