const express = require('express');
const router = express.Router();
const { getMonthlyAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/monthly', getMonthlyAnalytics);

module.exports = router;
