import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { LicenseType } from "@/generated/prisma/client";
import { hashPassword } from "@/src/lib/auth";

function parseLicenseType(value: unknown): LicenseType | null {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();
  return Object.values(LicenseType).includes(normalized as LicenseType)
    ? (normalized as LicenseType)
    : null;
}

async function getCHCSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { role?: string; profileId?: string }
    | undefined;
  if (!user || user.role !== "chc" || !user.profileId) return null;
  return user as { role: string; profileId: string };
}

const driverInclude = {
  user: { select: { name: true, email: true, phone: true } },
} as const;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCHCSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  const driver = await prisma.driverProfile.findFirst({
    where: { id, assignedCHCId: user.profileId },
    include: driverInclude,
  });
  if (!driver)
    return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  return NextResponse.json({ driver });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCHCSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const phone = String(body.phone || "").trim();
    const licenseNumber = String(body.licenseNumber || "")
      .trim()
      .toUpperCase();
    const licenseType = parseLicenseType(body.licenseType);
    const licenseExpiry = body.licenseExpiry
      ? new Date(body.licenseExpiry)
      : null;
    const experienceYears =
      body.experienceYears === "" || body.experienceYears === undefined
        ? 0
        : Number(body.experienceYears);

    if (!name || !email || !phone || !licenseNumber)
      return NextResponse.json(
        { error: "Name, email, phone, and license number are required" },
        { status: 400 },
      );
    if (licenseExpiry && Number.isNaN(licenseExpiry.getTime()))
      return NextResponse.json(
        { error: "Enter a valid license expiry date" },
        { status: 400 },
      );
    if (!Number.isInteger(experienceYears) || experienceYears < 0)
      return NextResponse.json(
        { error: "Enter valid experience years" },
        { status: 400 },
      );
    const passwordHash = await hashPassword(phone);
    const driver = await prisma.driverProfile.findFirst({
      where: { id, assignedCHCId: user.profileId },
      select: { userId: true },
    });
    if (!driver)
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });

    const updatedDriver = await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: driver.userId },
        data: { name, email, phone, password: passwordHash },
      });
      return transaction.driverProfile.update({
        where: { id },
        data: { licenseNumber, licenseType, licenseExpiry, experienceYears },
        include: driverInclude,
      });
    });

    return NextResponse.json({ driver: updatedDriver });
  } catch (error: unknown) {
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
    if (errorCode === "P2002")
      return NextResponse.json(
        { error: "That email, phone, or license number is already in use" },
        { status: 409 },
      );
    console.error("Driver update error:", error);
    return NextResponse.json(
      { error: "Unable to update driver" },
      { status: 500 },
    );
  }
}
