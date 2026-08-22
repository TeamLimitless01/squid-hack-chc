import mongoose, { Document, Model, Schema, Types } from "mongoose";

// --------------------------------------------------
// PAYMENT STATUS
// --------------------------------------------------

export enum PaymentStatus {
  CREATED = "created",
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

// --------------------------------------------------
// PAYMENT METHOD
// --------------------------------------------------

export enum PaymentMethod {
  UPI = "upi",
  CARD = "card",
  NETBANKING = "netbanking",
  WALLET = "wallet",
  EMI = "emi",
  OTHER = "other",
}

// --------------------------------------------------
// PAYMENT INTERFACE
// --------------------------------------------------

export interface IPayment extends Document {
  // ----------------------------------------------
  // REFERENCES
  // ----------------------------------------------

  booking: Types.ObjectId;

  farmer: Types.ObjectId;

  chc: Types.ObjectId;

  // ----------------------------------------------
  // AMOUNT
  // ----------------------------------------------

  amount: number;

  currency: string;

  // ----------------------------------------------
  // PAYMENT STATUS
  // ----------------------------------------------

  status: PaymentStatus;

  method?: PaymentMethod;

  // ----------------------------------------------
  // RAZORPAY
  // ----------------------------------------------

  razorpayOrderId: string;

  razorpayPaymentId?: string;

  razorpaySignature?: string;

  // ----------------------------------------------
  // PAYMENT TIMING
  // ----------------------------------------------

  paidAt?: Date;

  // ----------------------------------------------
  // FAILURE
  // ----------------------------------------------

  failureReason?: string;

  // ----------------------------------------------
  // REFUND
  // ----------------------------------------------

  refundAmount: number;

  refundedAt?: Date;

  // ----------------------------------------------
  // WEBHOOK
  // ----------------------------------------------

  webhookReceived: boolean;

  webhookEvent?: string;

  webhookReceivedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

// --------------------------------------------------
// PAYMENT SCHEMA
// --------------------------------------------------

const paymentSchema = new Schema<IPayment>(
  {
    // ----------------------------------------------
    // BOOKING
    // ----------------------------------------------

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },

    // ----------------------------------------------
    // FARMER
    // ----------------------------------------------

    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ----------------------------------------------
    // CHC
    // ----------------------------------------------

    chc: {
      type: Schema.Types.ObjectId,
      ref: "CHCProfile",
      required: true,
    },

    // ----------------------------------------------
    // AMOUNT
    // ----------------------------------------------

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    // ----------------------------------------------
    // STATUS
    // ----------------------------------------------

    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.CREATED,
    },

    // ----------------------------------------------
    // PAYMENT METHOD
    // ----------------------------------------------

    method: {
      type: String,
      enum: Object.values(PaymentMethod),
    },

    // ----------------------------------------------
    // RAZORPAY ORDER
    // ----------------------------------------------

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ----------------------------------------------
    // RAZORPAY PAYMENT
    // ----------------------------------------------

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // ----------------------------------------------
    // RAZORPAY SIGNATURE
    // ----------------------------------------------

    razorpaySignature: {
      type: String,
    },

    // ----------------------------------------------
    // PAYMENT SUCCESS TIME
    // ----------------------------------------------

    paidAt: {
      type: Date,
    },

    // ----------------------------------------------
    // FAILURE
    // ----------------------------------------------

    failureReason: {
      type: String,
      trim: true,
    },

    // ----------------------------------------------
    // REFUND
    // ----------------------------------------------

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundedAt: {
      type: Date,
    },

    // ----------------------------------------------
    // WEBHOOK
    // ----------------------------------------------

    webhookReceived: {
      type: Boolean,
      default: false,
    },

    webhookEvent: {
      type: String,
      trim: true,
    },

    webhookReceivedAt: {
      type: Date,
    },
  },

  {
    timestamps: true,
  },
);

// --------------------------------------------------
// INDEXES
// --------------------------------------------------

paymentSchema.index({
  farmer: 1,
  createdAt: -1,
});

paymentSchema.index({
  chc: 1,
  createdAt: -1,
});

paymentSchema.index({
  status: 1,
});

// --------------------------------------------------
// MODEL
// --------------------------------------------------

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
