const prisma = require('../config/db');

const VALID_ORDER_BY = ['bestScore', 'bestSpeed', 'avgScore', 'avgSpeed', 'avgAccuracy', 'totalTests'];

const getRanking = async (req, res) => {
  try {
    const { orderBy } = req.params;

    if (!VALID_ORDER_BY.includes(orderBy)) {
      return res.status(400).json({ error: 'Invalid orderBy' });
    }

    const users = await prisma.user.findMany({
      orderBy: { [orderBy]: 'desc' },
      take: 10,
    });

    res.status(200).json(users);
  } catch (e) {
    console.error('Error al obtener ranking:', e);
    res.status(500).json({ error: 'Error al obtener ranking' });
  }
};

module.exports = { getRanking };
