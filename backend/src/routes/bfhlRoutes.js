const express = require('express');
const router = express.Router();

const { processData } = require('../controllers/bfhlController');

router.post('/', processData);

module.exports = router;