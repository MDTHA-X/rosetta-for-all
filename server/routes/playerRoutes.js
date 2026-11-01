// server/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const PlayerController = require('../controllers/playerController');
const { requireTournamentAdmin } = require('../middleware/auth');

router.get('/', PlayerController.getByTournament);
router.post('/', requireTournamentAdmin, PlayerController.create);
router.put('/:id', requireTournamentAdmin, PlayerController.update);
router.put('/', requireTournamentAdmin, PlayerController.update);
router.delete('/:id', requireTournamentAdmin, PlayerController.delete);
router.delete('/', requireTournamentAdmin, PlayerController.delete);

module.exports = router;
