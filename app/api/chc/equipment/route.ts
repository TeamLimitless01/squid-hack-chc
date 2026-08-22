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

  if (Object.values(EquipmentType).includes(normalized as EquipmentType)) {
    return normalized as EquipmentType;
  }

  return null;
}

async function getCHCSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { role?: string; profileId?: string }
    | undefined;
  if (!user || user.role !== "chc" || !user.profileId) {
    return null;
  }

  return user as { role: string; profileId: string };
}

export async function GET() {
  const user = await getCHCSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const equipment = await prisma.equipment.findMany({
    where: { chcId: user.profileId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ equipment });
}

export async function POST(request: Request) {
  const user = await getCHCSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const type = parseEquipmentType(body.type);
    const brand = String(body.brand || "").trim() || null;
    const model = String(body.model || "").trim() || null;
    const registrationNumber =
      String(body.registrationNumber || "").trim() || null;
    const purchaseYear = body.purchaseYear ? Number(body.purchaseYear) : null;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Equipment name and type are required" },
        { status: 400 },
      );
    }

    if (
      purchaseYear !== null &&
      (!Number.isInteger(purchaseYear) ||
        purchaseYear < 1900 ||
        purchaseYear > new Date().getFullYear())
    ) {
      return NextResponse.json(
        { error: "Enter a valid purchase year" },
        { status: 400 },
      );
    }

    const equipment = await prisma.equipment.create({
      data: {
        chcId: user.profileId,
        name,
        type,
        brand,
        model,
        registrationNumber,
        purchaseYear,
      },
    });

    return NextResponse.json({ equipment }, { status: 201 });
  } catch (error: unknown) {
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
    if (errorCode === "P2002") {
      return NextResponse.json(
        { error: "That registration number is already in use" },
        { status: 409 },
      );
    }
    console.error("Equipment creation error:", error);
    return NextResponse.json(
      { error: "Unable to create equipment" },
      { status: 500 },
    );
  }
}
