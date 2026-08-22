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
      centerName,
      registrationNumber,
      description,
    } = body;

    // Basic validation
    if (!name || !email || !phone || !password || !centerName) {
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
       lng = location.coordinates[0];
       lat = location.coordinates[1];
    }

    // Create User and CHCProfile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "chc",
        profileModel: "CHCProfile",
        profileId: "", 
        address,
        city,
        state,
        lat,
        lng,
        chcProfile: {
          create: {
            centerName,
            registrationNumber: registrationNumber || null,
            description: description || null,
          }
        }
      },
      include: {
        chcProfile: true
      }
    });
    
    // Update profileId to point to the newly created profile's ID
    if (user.chcProfile) {
      await prisma.user.update({
        where: { id: user.id },
        data: { profileId: user.chcProfile.id }
      });
    }

    return NextResponse.json(
      {
        message: "CHC registered successfully",
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
    console.error("CHC registration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
