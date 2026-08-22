import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { hashPassword } from "@/src/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      address,
      city,
      state,
      location,
      farmSizeValue,
      farmSizeUnit,
      crops,
      farmingType,
    } = body;

    // Basic validation
    if (!name || !email || !phone || !password || !farmSizeValue) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    
    let lat = 0;
    let lng = 0;
    if (location && location.coordinates && location.coordinates.length === 2) {
       // MongoDB was [lng, lat]
       lng = location.coordinates[0];
       lat = location.coordinates[1];
    }

    // Create User and FarmerProfile in a transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "farmer",
        profileModel: "FarmerProfile",
        profileId: "", // Will update this after creating profile if needed, or Prisma handles it
        address,
        city,
        state,
        lat,
        lng,
        farmerProfile: {
          create: {
            farmSizeValue: Number(farmSizeValue),
            farmSizeUnit: farmSizeUnit || "acre",
            crops: crops || [],
            farmingType: farmingType || null,
          }
        }
      },
      include: {
        farmerProfile: true
      }
    });
    
    // Update profileId to point to the newly created profile's ID
    if (user.farmerProfile) {
      await prisma.user.update({
        where: { id: user.id },
        data: { profileId: user.farmerProfile.id }
      });
    }
    
    return NextResponse.json(
      {
        message: "Farmer registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Farmer registration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
