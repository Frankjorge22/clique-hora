const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const quadraController = require('../controllers/quadraController');
const agendamentoController = require('../controllers/agendamentoController');

const router = express.Router();

// Rotas para usuários
router.post('/usuarios', usuarioController.createUsuario);
router.get('/usuarios', usuarioController.getUsuarios);

// Rotas para quadras
router.post('/quadras', quadraController.createQuadra);
router.get('/quadras', quadraController.getQuadras);

// Rotas para agendamentos
router.post('/agendamentos', agendamentoController.createAgendamento);
router.get('/agendamentos', agendamentoController.getAgendamentos);

module.exports = router;
