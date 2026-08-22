import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IReview extends Document {
  farmer: Types.ObjectId;

  chc: Types.ObjectId;

  booking: Types.ObjectId;

  rating: number;

  comment?: string;

  isPublished: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    chc: {
      type: Schema.Types.ObjectId,
      ref: "CHCProfile",
      required: true,
    },

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ chc: 1, createdAt: -1 });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);

export default Review;