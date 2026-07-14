const Review = require('../models/Review');
const Food = require('../models/Food');

// @desc    Get all reviews for a food
// @route   GET /api/reviews/:foodId
// @access  Public
const getReviewsForFood = async (req, res) => {
  const reviews = await Review.find({ food: req.params.foodId }).populate('user', 'name');
  res.json(reviews);
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { foodId, rating, comment } = req.body;
    
    console.log('Creating review for foodId:', foodId);
    console.log('Rating:', rating);
    console.log('Comment:', comment);

    if (!foodId) {
      res.status(400);
      throw new Error('Food ID is required');
    }

    const food = await Food.findById(foodId);
    if (!food) {
      res.status(404);
      throw new Error('Food not found');
    }

    // Check if user already reviewed this food
    const alreadyReviewed = await Review.findOne({ user: req.user._id, food: foodId });
    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this food');
    }

    const review = await Review.create({
      user: req.user._id,
      food: foodId,
      rating: parseInt(rating) || 0,
      comment: comment || '',
    });

    // Update food rating
    const reviews = await Review.find({ food: foodId });
    food.numReviews = reviews.length;
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    food.rating = totalRating / reviews.length;
    await food.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Update a review (only the owner)
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  const { rating, comment } = req.body;
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }
  review.rating = rating || review.rating;
  review.comment = comment || review.comment;
  await review.save();

  // Recalculate food rating
  const food = await Food.findById(review.food);
  const reviews = await Review.find({ food: food._id });
  food.numReviews = reviews.length;
  const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  food.rating = totalRating / reviews.length;
  await food.save();

  res.json(review);
};

// @desc    Delete a review (owner or admin)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  // Allow owner or admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }
  await review.remove();

  // Recalculate food rating
  const food = await Food.findById(review.food);
  const reviews = await Review.find({ food: food._id });
  food.numReviews = reviews.length;
  const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  food.rating = reviews.length > 0 ? totalRating / reviews.length : 0;
  await food.save();

  res.json({ message: 'Review removed' });
};

module.exports = { getReviewsForFood, createReview, updateReview, deleteReview };
