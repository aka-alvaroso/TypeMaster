const prisma = require('../config/db');

const getUserMatches = async (req, res) => {
  try {
    const { username } = req.params;

    const matchPlayers = await prisma.matchPlayer.findMany({
      where: { username },
      include: {
        match: {
          include: { players: true },
        },
      },
      orderBy: { match: { createdAt: 'desc' } },
    });

    const matches = matchPlayers.map(mp => ({
      id: mp.match.id,
      mode: mp.match.mode,
      createdAt: mp.match.createdAt,
      position: mp.position,
      score: mp.score,
      speed: mp.speed,
      accuracy: mp.accuracy,
      time: mp.time,
      players: mp.match.players
        .sort((a, b) => a.position - b.position)
        .map(p => ({ username: p.username, position: p.position, score: p.score, speed: p.speed })),
    }));

    res.json(matches);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener partidas', error: e.message });
  }
};

module.exports = { getUserMatches };
