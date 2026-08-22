import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum EquipmentType {
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

export enum EquipmentStatus {
	AVAILABLE = "available",
	IN_USE = "in_use",
	MAINTENANCE = "maintenance",
	INACTIVE = "inactive",
}

export interface IEquipment extends Omit<Document, "model"> {
	chc: Types.ObjectId;

	name: string;

	type: EquipmentType;

	brand?: string;

	model?: string;

	registrationNumber?: string;

	purchaseYear?: number;

	status: EquipmentStatus;

	location: {
		type: "Point";
		coordinates: [number, number];
	};

	usageHours: number;

	fuelLevel?: number;

	createdAt: Date;
	updatedAt: Date;
}

const equipmentSchema = new Schema<IEquipment>(
	{
		chc: {
			type: Schema.Types.ObjectId,
			ref: "CHCProfile",
			required: true,
		},

		name: {
			type: String,
			required: true,
			trim: true,
		},

		type: {
			type: String,
			enum: Object.values(EquipmentType),
			required: true,
		},

		brand: {
			type: String,
			trim: true,
		},

		model: {
			type: String,
			trim: true,
		},

		registrationNumber: {
			type: String,
			trim: true,
			unique: true,
			sparse: true,
		},

		purchaseYear: {
			type: Number,
			min: 1900,
			max: new Date().getFullYear(),
		},

		status: {
			type: String,
			enum: Object.values(EquipmentStatus),
			default: EquipmentStatus.AVAILABLE,
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

		usageHours: {
			type: Number,
			default: 0,
			min: 0,
		},

		fuelLevel: {
			type: Number,
			min: 0,
			max: 100,
		},
	},
	{
		timestamps: true,
	},
);

equipmentSchema.index({ location: "2dsphere" });

const Equipment: Model<IEquipment> =
	mongoose.models.Equipment ||
	mongoose.model<IEquipment>("Equipment", equipmentSchema);

export default Equipment;
