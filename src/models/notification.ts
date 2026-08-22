import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum NotificationType {
  BOOKING_CREATED = "booking_created",
  BOOKING_ACCEPTED = "booking_accepted",
  BOOKING_REJECTED = "booking_rejected",
  BOOKING_CANCELLED = "booking_cancelled",
  BOOKING_COMPLETED = "booking_completed",
  PAYMENT_SUCCESS = "payment_success",
  PAYMENT_FAILED = "payment_failed",
  DRIVER_ASSIGNED = "driver_assigned",
  REVIEW_RECEIVED = "review_received",
  SYSTEM = "system",
}

export interface INotification extends Document {
  recipient: Types.ObjectId;

  type: NotificationType;

  title: string;

  message: string;

  booking?: Types.ObjectId;

  payment?: Types.ObjectId;

  isRead: boolean;

  readAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;