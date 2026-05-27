const prisma = require('../config/db');
const rm = require('./roomManager');

const lastProgress = new Map(); // rate limiting progress events

function registerEvents(io, socket) {
  const username = socket.data.username;

  // ─── Room management ──────────────────────────────────────────────────────

  socket.on('room:create', ({ mode, difficulty, length, type, language, duration } = {}, cb) => {
    const room = rm.createRoom({ hostUsername: username, mode, difficulty, length, type, language, duration });
    rm.addPlayer(room.code, { username, socketId: socket.id });
    socket.join(room.code);
    cb?.({ code: room.code, room: rm.sanitize(room) });
  });

  socket.on('room:join', ({ code } = {}, cb) => {
    const upper = code?.toUpperCase?.();
    const room = rm.getRoom(upper);
    if (!room) return cb?.({ error: 'room_not_found' });

    const alreadyIn = room.players.some(p => p.username === username);
    if (alreadyIn) {
      socket.join(upper);
      return cb?.({ room: rm.sanitize(room) });
    }

    if (room.status !== 'waiting') return cb?.({ error: 'game_started' });
    if (room.players.length >= 8) return cb?.({ error: 'room_full' });

    rm.addPlayer(upper, { username, socketId: socket.id });
    socket.join(upper);
    io.to(upper).emit('room:playerJoined', { players: rm.sanitize(room).players });
    cb?.({ room: rm.sanitize(room) });
  });

  socket.on('room:ready', ({ code } = {}) => {
    const room = rm.setReady(code, socket.id, true);
    if (!room) return;
    io.to(code).emit('room:update', { players: rm.sanitize(room).players });

    if (rm.allReady(room) && room.status === 'waiting') {
      room.status = 'countdown';
      startCountdown(io, room).catch(e => console.error('[startCountdown]', e));
    }
  });

  socket.on('room:unready', ({ code } = {}) => {
    const room = rm.setReady(code, socket.id, false);
    if (!room) return;
    io.to(code).emit('room:update', { players: rm.sanitize(room).players });
  });

  // ─── In-game: shared ──────────────────────────────────────────────────────

  socket.on('game:progress', ({ code, pct } = {}) => {
    if (typeof pct !== 'number') return;
    const now = Date.now();
    if (now - (lastProgress.get(socket.id) ?? 0) < 50) return;
    lastProgress.set(socket.id, now);

    const room = rm.updateProgress(code, socket.id, Math.min(100, Math.max(0, pct)));
    if (!room || room.status !== 'playing') return;
    socket.to(code).emit('game:opponentProgress', { players: rm.sanitize(room).players });
  });

  // ─── Race: finish ─────────────────────────────────────────────────────────

  socket.on('game:finish', ({ code, stats } = {}, cb) => {
    const room = rm.finishPlayer(code, socket.id, stats);
    if (!room) return;

    const player = room.players.find(p => p.socketId === socket.id);
    io.to(code).emit('game:playerFinished', { players: rm.sanitize(room).players });

    if (rm.allFinishedOrEliminated(room) && room.status === 'playing') {
      room.status = 'finished';
      io.to(code).emit('game:ended', { players: rm.sanitize(room).players });
      saveMatch(room).catch(e => console.error('[saveMatch]', e));
    }

    cb?.({ position: player?.position });
  });

  // ─── Score Attack: player finished a text, gets a new one ─────────────────

  socket.on('game:textDone', ({ code, stats } = {}, cb) => {
    const room = rm.getRoom(code);
    if (!room || room.status !== 'playing' || room.mode !== 'score_attack') return;

    rm.addScore(code, socket.id, stats);
    const sanitized = rm.sanitize(room);

    // Broadcast updated scores to room
    io.to(code).emit('game:scoreUpdate', { players: sanitized.players });

    // Send a new text to this player only
    fetchRandomText(room.settings).then(text => {
      if (text) socket.emit('game:newText', { text: text.content });
    }).catch(e => console.error('[game:textDone] fetch text', e));

    cb?.({ ok: true });
  });

  // ─── Survival: player made an error ───────────────────────────────────────

  socket.on('game:error', ({ code } = {}) => {
    const { room, eliminated, aliveCount } = rm.recordError(code, socket.id);
    if (!room) return;

    const sanitized = rm.sanitize(room);
    io.to(code).emit('game:livesUpdate', { players: sanitized.players });

    if (eliminated) {
      const p = room.players.find(p => p.socketId === socket.id);
      socket.emit('game:eliminated', { position: p?.position });
      io.to(code).emit('game:playerEliminated', { username, players: sanitized.players });

      if (aliveCount === 1 && room.status === 'playing') {
        room.status = 'finished';
        io.to(code).emit('game:ended', { players: sanitized.players });
        saveMatch(room).catch(e => console.error('[saveMatch survival]', e));
      } else if (aliveCount === 0 && room.status === 'playing') {
        room.status = 'finished';
        io.to(code).emit('game:ended', { players: sanitized.players });
        saveMatch(room).catch(e => console.error('[saveMatch survival all elim]', e));
      }
    }
  });

  // ─── Survival: player finished the text (with lives remaining) ────────────

  socket.on('game:finish', ({ code, stats } = {}, cb) => {
    // Already registered above — this fires for Race & Survival
    // For Survival the handler above handles it; this duplicate registration is fine
    // because Socket.IO merges handlers. Keep race logic there.
    void code; void stats; void cb;
  });

  // ─── Disconnect ───────────────────────────────────────────────────────────

  socket.on('disconnecting', () => {
    lastProgress.delete(socket.id);
    for (const roomCode of socket.rooms) {
      if (roomCode === socket.id) continue;
      const room = rm.getRoom(roomCode);
      if (!room) continue;
      const wasPlaying = room.status === 'playing';
      const updatedRoom = rm.removePlayer(roomCode, socket.id);
      if (!updatedRoom) continue;

      io.to(roomCode).emit('room:playerLeft', { players: rm.sanitize(updatedRoom).players });

      if (wasPlaying && rm.allFinishedOrEliminated(updatedRoom) && updatedRoom.status === 'playing') {
        updatedRoom.status = 'finished';
        io.to(roomCode).emit('game:ended', { players: rm.sanitize(updatedRoom).players });
        saveMatch(updatedRoom).catch(e => console.error('[saveMatch disconnect]', e));
      }
    }
  });
}

// ─── Game start ─────────────────────────────────────────────────────────────

async function startCountdown(io, room) {
  const text = await fetchRandomText(room.settings);
  if (!text) {
    io.to(room.code).emit('room:error', { message: 'no_text_available' });
    room.status = 'waiting';
    return;
  }

  room.text = text.content;
  room.textId = text.id;

  for (let i = 3; i >= 1; i--) {
    io.to(room.code).emit('game:countdown', { count: i });
    await sleep(1000);
  }

  room.status = 'playing';
  room.startedAt = Date.now();
  room.players.forEach(p => {
    p.progress = 0; p.finished = false; p.position = null;
    p.stats = null; p.score = 0; p.eliminated = false;
    p.lives = 3;
  });

  const payload = { text: room.text, startedAt: room.startedAt };
  if (room.mode === 'score_attack') payload.duration = room.settings.duration;

  io.to(room.code).emit('game:start', payload);

  if (room.mode === 'score_attack') startScoreAttackTimer(io, room);
}

function startScoreAttackTimer(io, room) {
  const duration = room.settings.duration ?? 60;
  let remaining = duration;

  room._tickInterval = setInterval(() => {
    remaining -= 1;
    io.to(room.code).emit('game:tick', { remaining });

    if (remaining <= 0) {
      clearInterval(room._tickInterval);
      room._tickInterval = null;

      if (room.status !== 'playing') return;
      room.status = 'finished';
      rm.assignScoreAttackPositions(room);
      io.to(room.code).emit('game:ended', { players: rm.sanitize(room).players });
      saveMatch(room).catch(e => console.error('[saveMatch score_attack]', e));
    }
  }, 1000);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchRandomText(settings) {
  const candidates = await prisma.text.findMany({
    where: {
      difficulty: settings.difficulty,
      length: settings.length,
      type: settings.type,
      ...(settings.language ? { language: settings.language } : {}),
    },
    select: { id: true },
  });
  if (candidates.length === 0) return null;
  const randomId = candidates[Math.floor(Math.random() * candidates.length)].id;
  return prisma.text.findUnique({ where: { id: randomId } });
}

async function saveMatch(room) {
  await prisma.match.create({
    data: {
      mode: room.mode,
      textId: room.textId ?? '',
      text: room.text ?? '',
      players: {
        create: room.players.map(p => ({
          username: p.username,
          position: p.position ?? room.players.length,
          score: p.stats?.score ?? p.score ?? 0,
          speed: p.stats?.speed ?? 0,
          accuracy: p.stats?.accuracy ?? 0,
          time: p.stats?.time ?? room.settings.duration ?? 0,
        })),
      },
    },
  });

  await Promise.allSettled(room.players.map(p => updateUserStats(p, room.settings.difficulty)));
}

async function updateUserStats(player, difficulty) {
  const stats = player.stats;
  if (!stats) return;
  const { score, speed: cpm, accuracy: accurate, errors, totalChar } = stats;
  if (!cpm && !score) return;

  const user = await prisma.user.findUnique({ where: { username: player.username } });
  if (!user) return;

  const t = user.totalTests;
  await prisma.user.update({
    where: { username: player.username },
    data: {
      avgAccuracy:    Math.trunc(((user.avgAccuracy * t + (accurate ?? 0)) / (t + 1)) * 10) / 10,
      avgScore:       Math.trunc(((user.avgScore * t + (score ?? 0)) / (t + 1)) * 10) / 10,
      avgSpeed:       Math.trunc(((user.avgSpeed * t + (cpm ?? 0)) / (t + 1)) * 10) / 10,
      bestScore:      Math.max(user.bestScore, score ?? 0),
      bestSpeed:      Math.max(user.bestSpeed, cpm ?? 0),
      numCharacters:  user.numCharacters + (totalChar ?? 0),
      numErrors:      user.numErrors + (errors ?? 0),
      numEasyTests:   difficulty === 'easy'   ? user.numEasyTests + 1   : user.numEasyTests,
      numMediumTests: difficulty === 'medium' ? user.numMediumTests + 1 : user.numMediumTests,
      numHardTests:   difficulty === 'hard'   ? user.numHardTests + 1   : user.numHardTests,
      totalTests:     t + 1,
    },
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { registerEvents };
