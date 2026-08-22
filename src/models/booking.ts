import mongoose, { Document, Model, Schema, Types } from "mongoose";

// --------------------------------------------------
// BOOKING STATUS
// Farmer <-> CHC request lifecycle
// --------------------------------------------------

export enum BookingStatus {
  REQUESTED = "requested",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

// --------------------------------------------------
// TRIP STATUS
// Driver journey to farmer
// --------------------------------------------------

export enum TripStatus {
  NOT_STARTED = "not_started",
  STARTED = "started",
  ARRIVED = "arrived",
}

// --------------------------------------------------
// WORK STATUS
// Actual agricultural work
// --------------------------------------------------

export enum WorkStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

// --------------------------------------------------
// ASSIGNED RESOURCE
// --------------------------------------------------

export interface IAssignedResource {
  equipment: Types.ObjectId;
  resourceType: string;
}

// --------------------------------------------------
// ADDITIONAL CHARGE
// --------------------------------------------------

export interface IAdditionalCharge {
  reason: string;
  amount: number;
}

// --------------------------------------------------
// VENDOR PROPOSAL
// --------------------------------------------------

export interface IVendorProposal {
  // Original CHC service price
  basePrice: number;

  // Additional charges negotiated with farmer
  additionalCharges: IAdditionalCharge[];

  // Final amount proposed by CHC
  finalAmount: number;

  // When CHC submitted proposal
  proposedAt?: Date;

  // Farmer approval
  farmerApproved: boolean;

  // When farmer approved
  farmerApprovedAt?: Date;
}

// --------------------------------------------------
// BOOKING INTERFACE
// --------------------------------------------------

export interface IBooking extends Document {
  // ----------------------------------------------
  // BASIC BOOKING
  // ----------------------------------------------

  farmer: Types.ObjectId;

  chcService: Types.ObjectId;

  chc: Types.ObjectId;

  bookingDate: Date;

  area: number;

  bookingStatus: BookingStatus;

  // ----------------------------------------------
  // VENDOR PROPOSAL
  // ----------------------------------------------

  vendorProposal?: IVendorProposal | null;

  // ----------------------------------------------
  // TRIP
  // ----------------------------------------------

  trip: {
    status: TripStatus;

    started: boolean;

    startTime?: Date;

    startingPoint?: {
      type: "Point";
      coordinates: [number, number];
    };

    destination?: {
      type: "Point";
      coordinates: [number, number];
    };
  };

  // ----------------------------------------------
  // WORK
  // ----------------------------------------------

  work: {
    status: WorkStatus;

    started: boolean;

    startWorkTime?: Date;

    endWorkTime?: Date;

    workCompleteTime?: Date;
  };

  // ----------------------------------------------
  // ASSIGNMENT
  // ----------------------------------------------

  assignedDriver?: Types.ObjectId;

  assignedResources: IAssignedResource[];

  // ----------------------------------------------
  // PAYMENT
  // ----------------------------------------------

  payment?: Types.ObjectId | null;

  createdAt: Date;

  updatedAt: Date;
  workImages:any;
}

// --------------------------------------------------
// ASSIGNED RESOURCE SCHEMA
// --------------------------------------------------

const assignedResourceSchema = new Schema<IAssignedResource>(
  {
    equipment: {
      type: Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },

    resourceType: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

// --------------------------------------------------
// ADDITIONAL CHARGE SCHEMA
// --------------------------------------------------

const additionalChargeSchema = new Schema<IAdditionalCharge>(
  {
    reason: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

// --------------------------------------------------
// VENDOR PROPOSAL SCHEMA
// --------------------------------------------------

const vendorProposalSchema = new Schema<IVendorProposal>(
  {
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    additionalCharges: {
      type: [additionalChargeSchema],
      default: [],
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    proposedAt: {
      type: Date,
    },

    farmerApproved: {
      type: Boolean,
      default: false,
    },

    farmerApprovedAt: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

// --------------------------------------------------
// BOOKING SCHEMA
// --------------------------------------------------

const bookingSchema = new Schema<IBooking>(
  {
    // ----------------------------------------------
    // FARMER
    // ----------------------------------------------

    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ----------------------------------------------
    // CHC SERVICE
    // ----------------------------------------------

    chcService: {
      type: Schema.Types.ObjectId,
      ref: "CHCService",
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
    // BOOKING DATE
    // ----------------------------------------------

    bookingDate: {
      type: Date,
      required: true,
    },

    // ----------------------------------------------
    // FARM AREA
    // ----------------------------------------------

    area: {
      type: Number,
      required: true,
      min: 0,
    },

    // ----------------------------------------------
    // BOOKING STATUS
    // ----------------------------------------------

    bookingStatus: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.REQUESTED,
    },

    // ----------------------------------------------
    // VENDOR PROPOSAL
    // ----------------------------------------------

    vendorProposal: {
      type: vendorProposalSchema,
      default: null,
    },

    // ----------------------------------------------
    // TRIP
    // ----------------------------------------------

    trip: {
      status: {
        type: String,
        enum: Object.values(TripStatus),
        default: TripStatus.NOT_STARTED,
      },

      started: {
        type: Boolean,
        default: false,
      },

      startTime: {
        type: Date,
      },

      // Driver's actual starting location
      startingPoint: {
        type: {
          type: String,
          enum: ["Point"],
        },

        coordinates: {
          type: [Number],
        },
      },

      // Farmer's field location
      destination: {
        type: {
          type: String,
          enum: ["Point"],
        },

        coordinates: {
          type: [Number],
        },
      },
    },

    // ----------------------------------------------
    // WORK
    // ----------------------------------------------

    work: {
      status: {
        type: String,
        enum: Object.values(WorkStatus),
        default: WorkStatus.NOT_STARTED,
      },

      started: {
        type: Boolean,
        default: false,
      },

      startWorkTime: {
        type: Date,
      },

      endWorkTime: {
        type: Date,
      },

      workCompleteTime: {
        type: Date,
      },
    },
    workImages: {
      type: [String],
      default: [],
    },

    // ----------------------------------------------
    // DRIVER
    // ----------------------------------------------

    assignedDriver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ----------------------------------------------
    // EQUIPMENT / RESOURCES
    // ----------------------------------------------

    assignedResources: {
      type: [assignedResourceSchema],
      default: [],
    },

    // ----------------------------------------------
    // PAYMENT
    // ----------------------------------------------

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

// --------------------------------------------------
// INDEXES
// --------------------------------------------------

bookingSchema.index({
  farmer: 1,
  createdAt: -1,
});

bookingSchema.index({
  chc: 1,
  bookingStatus: 1,
});

bookingSchema.index({
  assignedDriver: 1,
  bookingStatus: 1,
});

bookingSchema.index({
  bookingDate: 1,
});

// --------------------------------------------------
// MODEL
// --------------------------------------------------

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
