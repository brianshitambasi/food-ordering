const express = require('express');
const { getReviewsForFood, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:foodId', getReviewsForFood);
router.post('/', protect, createReview);
router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);

module.exports = router;
