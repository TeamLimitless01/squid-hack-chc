import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export interface ICHCProfile extends Document {
  centerName: string;

  registrationNumber?: string;

  description?: string;

  verificationStatus:
    | "pending"
    | "verified"
    | "rejected";

  rating: number;

  createdAt: Date;
  updatedAt: Date;
}

const chcProfileSchema = new Schema<ICHCProfile>(
  {
    centerName: {
      type: String,
      required: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    verificationStatus: {
      type: String,
      enum: [
        "pending",
        "verified",
        "rejected",
      ],
      default: "pending",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const CHCProfile: Model<ICHCProfile> =
  mongoose.models.CHCProfile ||
  mongoose.model<ICHCProfile>(
    "CHCProfile",
    chcProfileSchema
  );

export default CHCProfile;