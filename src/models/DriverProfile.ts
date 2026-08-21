import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export interface IDriverProfile extends Document {
  licenseNumber: string;

  licenseType?: string;

  licenseExpiry?: Date;

  experienceYears: number;

  assignedCHC?: Types.ObjectId;

  availabilityStatus:
    | "available"
    | "busy"
    | "offline";

  rating: number;

  createdAt: Date;
  updatedAt: Date;
}

const driverProfileSchema =
  new Schema<IDriverProfile>(
    {
      licenseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      licenseType: {
        type: String,
        trim: true,
      },

      licenseExpiry: {
        type: Date,
      },

      experienceYears: {
        type: Number,
        default: 0,
        min: 0,
      },

      assignedCHC: {
        type: Schema.Types.ObjectId,
        ref: "CHCProfile",
        default: null,
      },

      availabilityStatus: {
        type: String,
        enum: [
          "available",
          "busy",
          "offline",
        ],
        default: "available",
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

const DriverProfile: Model<IDriverProfile> =
  mongoose.models.DriverProfile ||
  mongoose.model<IDriverProfile>(
    "DriverProfile",
    driverProfileSchema
  );

export default DriverProfile;