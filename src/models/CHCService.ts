import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICHCService extends Document {
	chc: Types.ObjectId;

	service: Types.ObjectId;

	price: number;

	isActive: boolean;

	createdAt: Date;
	updatedAt: Date;
}

const chcServiceSchema = new Schema<ICHCService>(
	{
		chc: {
			type: Schema.Types.ObjectId,
			ref: "CHCProfile",
			required: true,
		},

		service: {
			type: Schema.Types.ObjectId,
			ref: "PlatformService",
			required: true,
		},

		price: {
			type: Number,
			required: true,
			min: 0,
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

chcServiceSchema.index(
	{ chc: 1, service: 1 },
	{ unique: true },
);

const CHCService: Model<ICHCService> =
	mongoose.models.CHCService ||
	mongoose.model<ICHCService>("CHCService", chcServiceSchema);

export default CHCService;
 