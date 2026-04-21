import { model, Schema } from 'mongoose';
import { IReview } from './review.interface';

const reviewSchema = new Schema<IReview>(
  {
    task: { type: Schema.Types.ObjectId, required: true, ref: 'Task' },
    rating: { type: Number, required: true },
    review: { type: String },
  },
  { timestamps: true },
);

const Review = model<IReview>('Review', reviewSchema);
export default Review;
