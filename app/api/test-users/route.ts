import { randomUUID } from "node:crypto";
import { Types } from "mongoose";

import { connectToMongoDB } from "@/src/lib/mongodb";
import User from "@/src/models/User";

export const runtime = "nodejs";

type TestUserInput = {
  name?: string;
  email?: string;
  phone?: string;
};

export async function POST(request: Request) {
  try {
    const input = (await request.json().catch(() => ({}))) as TestUserInput;
    const uniqueId = randomUUID();

    await connectToMongoDB();

    const user = await User.create({
      name: input.name?.trim() || "Temporary Test User",
      email: input.email?.trim().toLowerCase() || `test-${uniqueId}@example.com`,
      phone: input.phone?.trim() || `900${Date.now().toString().slice(-7)}`,
      password: `temporary-${uniqueId}`,
      role: "farmer",
      profile: new Types.ObjectId(),
      profileModel: "FarmerProfile",
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
    });

    const { password, ...safeUser } = user.toObject();
    void password;

    return Response.json({ success: true, user: safeUser }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      return Response.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    console.error("Failed to create test user", error);
    return Response.json(
      { success: false, error: "Failed to create test user" },
      { status: 500 },
    );
  }
}