// server/routes/roundRoutes.js
const express = require('express');
const router = express.Router();
const RoundController = require('../controllers/roundController');
const { requireTournamentAdmin } = require('../middleware/auth');

router.get('/', RoundController.getByTournament);
router.post('/generate', requireTournamentAdmin, RoundController.generate);
router.post('/complete', requireTournamentAdmin, RoundController.complete);
router.post('/reopen', requireTournamentAdmin, RoundController.reopen);
router.delete('/:round_id', requireTournamentAdmin, RoundController.delete);
router.delete('/', requireTournamentAdmin, RoundController.delete);
router.post('/pairings/result', requireTournamentAdmin, RoundController.setPairingResult);

module.exports = router;

