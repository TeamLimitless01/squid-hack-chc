import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export type UserRole = "farmer" | "chc" | "driver";

export type ProfileModel =
  | "FarmerProfile"
  | "CHCProfile"
  | "DriverProfile";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;

  role: UserRole;

  profile: Types.ObjectId;
  profileModel: ProfileModel;

  profileImage?: string;

  address?: string;
  city?: string;
  state?: string;

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["farmer", "chc", "driver"],
      required: true,
    },

    profile: {
      type: Schema.Types.ObjectId,
      refPath: "profileModel",
      required: true,
    },

    profileModel: {
      type: String,
      enum: ["FarmerProfile", "CHCProfile", "DriverProfile"],
      required: true,
    },

    profileImage: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },

    city: {
      type: String,
      default: null,
    },

    state: {
      type: String,
      default: null,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ location: "2dsphere" });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;