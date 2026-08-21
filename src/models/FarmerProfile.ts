import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export interface IFarmerProfile extends Document {
  farmSize: {
    value: number;
    unit: "acre" | "hectare";
  };

  crops: string[];

  farmingType?:
    | "small"
    | "medium"
    | "large"
    | "commercial";

  creditScore: number;
  creditLimit: number;

  createdAt: Date;
  updatedAt: Date;
}

const farmerProfileSchema = new Schema<IFarmerProfile>(
  {
    farmSize: {
      value: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        enum: ["acre", "hectare"],
        default: "acre",
      },
    },

    crops: {
      type: [String],
      default: [],
    },

    farmingType: {
      type: String,
      enum: ["small", "medium", "large", "commercial"],
    },

    creditScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const FarmerProfile: Model<IFarmerProfile> =
  mongoose.models.FarmerProfile ||
  mongoose.model<IFarmerProfile>("FarmerProfile", farmerProfileSchema);

export default FarmerProfile;