import mongoose, { Document, Model, Schema } from "mongoose";

export enum ResourceType {
  TRACTOR = "tractor",
  CULTIVATOR = "cultivator",
  PLOUGH = "plough",
  SEED_DRILL = "seed_drill",
  ROTAVATOR = "rotavator",
  SPRAYER = "sprayer",
  FERTILIZER_SPREADER = "fertilizer_spreader",
  HARVESTER = "harvester",
  TROLLEY = "trolley",
  LAND_LEVELER = "land_leveler",
  BALER = "baler",
}

export enum PricingUnit {
  ACRE = "acre",
  HOUR = "hour",
  DAY = "day",
  JOB = "job",
}

export interface IPlatformService extends Document {
  name: string;
  description?: string;

  resourcesRequired: ResourceType[];

  pricingUnit: PricingUnit;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const platformServiceSchema = new Schema<IPlatformService>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
    },

    resourcesRequired: {
      type: [String],
      enum: Object.values(ResourceType),
      required: true,
    },

    pricingUnit: {
      type: String,
      enum: Object.values(PricingUnit),
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const PlatformService: Model<IPlatformService> =
  mongoose.models.PlatformService ||
  mongoose.model<IPlatformService>("PlatformService", platformServiceSchema);

export default PlatformService;
