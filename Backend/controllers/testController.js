const prisma = require('../config/db');

const saveTest = async (req, res) => {
  try {
    const { id, text, player, date, charResults, settings, results } = req.body;

    if (!id || !text || !player || !date || !charResults || !settings || !results) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const savedTest = await prisma.test.create({
      data: {
        id,
        text,
        player,
        date,
        charResults,
        mode:         settings.mode,
        type:         settings.type,
        difficulty:   settings.difficulty,
        language:     settings.language ?? null,
        score:        results.score,
        speed:        results.speed,
        accuracy:     results.accuracy,
        numCharacters: results.numCharacters,
        numErrors:    results.numErrors,
        time:         results.time,
      },
    });

    res.status(201).json(savedTest);
  } catch (e) {
    console.error('Error al guardar el test:', e);
    res.status(500).json({ message: 'Error al guardar el test', e });
  }
};

const getUserTests = async (req, res) => {
  try {
    const { username } = req.params;
    const tests = await prisma.test.findMany({
      where: { player: username },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tests);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener tests', error: e.message });
  }
};

const getTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await prisma.test.findUnique({ where: { id } });
    res.status(200).json(test);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener test', error: e.message });
  }
};

const getGlobalStats = async (req, res) => {
  try {
    const [totalTests, timeAgg, accuracyAgg, users] = await Promise.all([
      prisma.test.count(),
      prisma.test.aggregate({ _sum: { time: true } }),
      prisma.test.aggregate({ _avg: { accuracy: true } }),
      prisma.user.count(),
    ]);

    const totalSeconds = timeAgg._sum.time ?? 0;
    const totalHours   = Math.round(totalSeconds / 3600);
    const avgAccuracy  = accuracyAgg._avg.accuracy != null
      ? Math.round(accuracyAgg._avg.accuracy)
      : null;

    res.json({ totalTests, totalHours, avgAccuracy, totalUsers: users });
  } catch (e) {
    console.error('Error al obtener estadísticas globales:', e);
    res.status(500).json({ message: 'Error al obtener estadísticas globales' });
  }
};

module.exports = { saveTest, getUserTests, getTest, getGlobalStats };
