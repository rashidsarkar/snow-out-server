import express from 'express';
import ReviewController from './review.controller';

const router = express.Router();

router.post('/', ReviewController.createReview);
router.get('/', ReviewController.getAllReviews);
router.get('/top-providers', ReviewController.getTopRatedProviders);
router.get('/:id', ReviewController.getSingleReview);

// avg rating (from body)
router.post('/provider-rating', ReviewController.getProviderAvgRating);

export const reviewRoutes = router;
