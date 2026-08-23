import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { EquipmentType } from "@/generated/prisma/client";

function parseEquipmentType(value: unknown): EquipmentType | null {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replaceAll(" ", "_");
  return Object.values(EquipmentType).includes(normalized as EquipmentType)
    ? (normalized as EquipmentType)
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCHCSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const equipment = await prisma.equipment.findFirst({
    where: { id, chcId: user.profileId },
  });
  if (!equipment)
    return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
  return NextResponse.json({ equipment });
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
    const type = parseEquipmentType(body.type);
    const brand = String(body.brand || "").trim() || null;
    const model = String(body.model || "").trim() || null;
    const registrationNumber =
      String(body.registrationNumber || "").trim() || null;
    const purchaseYear = body.purchaseYear ? Number(body.purchaseYear) : null;

    if (!name || !type)
      return NextResponse.json(
        { error: "Equipment name and type are required" },
        { status: 400 },
      );
    if (
      purchaseYear !== null &&
      (!Number.isInteger(purchaseYear) ||
        purchaseYear < 1900 ||
        purchaseYear > new Date().getFullYear())
    )
      return NextResponse.json(
        { error: "Enter a valid purchase year" },
        { status: 400 },
      );

    const existing = await prisma.equipment.findFirst({
      where: { id, chcId: user.profileId },
      select: { id: true },
    });
    if (!existing)
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 },
      );

    const equipment = await prisma.equipment.update({
      where: { id },
      data: { name, type, brand, model, registrationNumber, purchaseYear },
    });
    return NextResponse.json({ equipment });
  } catch (error: unknown) {
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
    if (errorCode === "P2002")
      return NextResponse.json(
        { error: "That registration number is already in use" },
        { status: 409 },
      );
    console.error("Equipment update error:", error);
    return NextResponse.json(
      { error: "Unable to update equipment" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCHCSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  try {
    const equipment = await prisma.equipment.findFirst({
      where: { id, chcId: user.profileId },
      select: { id: true, type: true },
    });
    if (!equipment)
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 },
      );

    const servicesToRemove = await prisma.cHCService.findMany({
      where: {
        chcId: user.profileId,
        service: { resourcesRequired: { has: equipment.type } },
      },
      select: { id: true },
    });
    const serviceIds = servicesToRemove.map((service) => service.id);

    const [assignedResourceCount, bookingCount] = await Promise.all([
      prisma.assignedResource.count({ where: { equipmentId: id } }),
      serviceIds.length
        ? prisma.booking.count({ where: { chcServiceId: { in: serviceIds } } })
        : Promise.resolve(0),
    ]);

    if (assignedResourceCount || bookingCount) {
      return NextResponse.json(
        {
          error:
            "This equipment or one of its dependent service offers has bookings. Resolve those bookings before deleting it.",
        },
        { status: 409 },
      );
    }

    await prisma.$transaction(async (transaction) => {
      if (serviceIds.length) {
        await transaction.cHCService.deleteMany({
          where: { id: { in: serviceIds } },
        });
      }
      await transaction.equipment.delete({ where: { id } });
    });

    return NextResponse.json({
      deletedEquipmentId: id,
      removedServiceCount: serviceIds.length,
    });
  } catch (error: unknown) {
    console.error("Equipment deletion error:", error);
    return NextResponse.json(
      { error: "Unable to delete equipment" },
      { status: 500 },
    );
  }
}
