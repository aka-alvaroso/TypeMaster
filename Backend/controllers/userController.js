const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const userExists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const savedUser = await prisma.user.create({
      data: { username, email, password: bcrypt.hashSync(password, 10) },
    });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: savedUser });

  } catch (e) {
    console.error('Error al guardar el usuario:', e);
    res.status(500).json({ message: 'Error al guardar el usuario', e });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });

  } catch (e) {
    console.error('Error al autenticar el usuario:', e);
    res.status(500).json({ message: 'Error al autenticar el usuario', e });
  }
};

const updateStats = async (req, res) => {
  try {
    const { email, stats, test } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const t = user.totalTests;
    await prisma.user.update({
      where: { email },
      data: {
        avgAccuracy:    Math.trunc(((user.avgAccuracy * t + stats.accurate) / (t + 1)) * 10) / 10,
        avgScore:       Math.trunc(((user.avgScore * t + stats.score) / (t + 1)) * 10) / 10,
        avgSpeed:       Math.trunc(((user.avgSpeed * t + stats.cpm) / (t + 1)) * 10) / 10,
        bestScore:      Math.max(user.bestScore, stats.score),
        bestSpeed:      Math.max(user.bestSpeed, stats.cpm),
        numCharacters:  user.numCharacters + stats.totalChar,
        numErrors:      user.numErrors + stats.errors,
        numEasyTests:   test.difficulty === 'easy'   ? user.numEasyTests + 1   : user.numEasyTests,
        numMediumTests: test.difficulty === 'medium' ? user.numMediumTests + 1 : user.numMediumTests,
        numHardTests:   test.difficulty === 'hard'   ? user.numHardTests + 1   : user.numHardTests,
        totalTests:     t + 1,
      },
    });

    res.status(200).json({ message: 'Estadísticas actualizadas correctamente' });
  } catch (e) {
    console.error('Error al editar el usuario:', e);
    res.status(500).json({ message: 'Error al editar el usuario', e });
  }
};

const getUserData = async (req, res) => {
  try {
    const { username } = req.headers;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ user });
  } catch (e) {
    console.error('Error al obtener el usuario:', e);
    res.status(500).json({ message: 'Error al obtener el usuario', e });
  }
};

const updateUserData = async (req, res) => {
  try {
    const { username, imageURL, email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const data = {};
    if (imageURL)  data.imageURL = imageURL;
    if (email)     data.email    = email;
    if (password)  data.password = bcrypt.hashSync(password, 10);

    await prisma.user.update({ where: { username }, data });
    res.status(200).json({ message: 'Datos actualizados correctamente' });

  } catch (e) {
    console.error('Error al editar el usuario:', e);
    res.status(500).json({ message: 'Error al editar el usuario', e });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await prisma.user.delete({ where: { email } });
    res.status(204).send();

  } catch (e) {
    console.error('Error al eliminar el usuario:', e);
    res.status(500).json({ message: 'Error al eliminar el usuario', e });
  }
};

module.exports = { registerUser, loginUser, updateStats, getUserData, updateUserData, deleteUser };
