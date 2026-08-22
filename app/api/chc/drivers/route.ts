import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hashPassword } from "@/src/lib/auth";
import prisma from "@/src/lib/db";

async function getCHCSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; profileId?: string } | undefined;
  if (!user || user.role !== "chc" || !user.profileId) return null;
  return user as { role: string; profileId: string };
}

export async function GET() {
  const user = await getCHCSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const drivers = await prisma.driverProfile.findMany({
    where: { assignedCHCId: user.profileId },
    include: { user: { select: { id: true, name: true, email: true, phone: true, isActive: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ drivers });
}

export async function POST(request: Request) {
  const user = await getCHCSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");
    const licenseNumber = String(body.licenseNumber || "").trim().toUpperCase();
    const licenseType = String(body.licenseType || "").trim() || null;
    const licenseExpiry = body.licenseExpiry ? new Date(body.licenseExpiry) : null;
    const experienceYears = body.experienceYears === "" || body.experienceYears === undefined ? 0 : Number(body.experienceYears);

    if (!name || !email || !phone || !password || !licenseNumber) {
      return NextResponse.json({ error: "Name, email, phone, password, and license number are required" }, { status: 400 });
    }
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    if (licenseExpiry && Number.isNaN(licenseExpiry.getTime())) return NextResponse.json({ error: "Enter a valid license expiry date" }, { status: 400 });
    if (!Number.isInteger(experienceYears) || experienceYears < 0) return NextResponse.json({ error: "Enter valid experience years" }, { status: 400 });

    const passwordHash = await hashPassword(password);
    const driver = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          name, email, phone, password: passwordHash, role: "driver", profileModel: "DriverProfile", profileId: "",
          driverProfile: { create: { licenseNumber, licenseType, licenseExpiry, experienceYears, assignedCHCId: user.profileId } },
        },
        include: { driverProfile: true },
      });
      if (!createdUser.driverProfile) throw new Error("Driver profile was not created");
      await transaction.user.update({ where: { id: createdUser.id }, data: { profileId: createdUser.driverProfile.id } });
      return transaction.driverProfile.findUnique({ where: { id: createdUser.driverProfile.id }, include: { user: { select: { id: true, name: true, email: true, phone: true, isActive: true } } } });
    });

    return NextResponse.json({ driver }, { status: 201 });
  } catch (error: unknown) {
    const errorCode = error && typeof error === "object" && "code" in error ? error.code : undefined;
    if (errorCode === "P2002") return NextResponse.json({ error: "That email, phone, or license number is already in use" }, { status: 409 });
    console.error("Driver creation error:", error);
    return NextResponse.json({ error: "Unable to add driver" }, { status: 500 });
  }
}
