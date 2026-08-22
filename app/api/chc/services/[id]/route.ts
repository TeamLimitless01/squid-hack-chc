import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PricingUnit } from "@/generated/prisma/client";
import prisma from "@/src/lib/db";

const aliases: Record<string, PricingUnit> = {
  acre: PricingUnit.ACRE,
  bigha: PricingUnit.BIGHA,
  hour: PricingUnit.HOUR,
  hourly: PricingUnit.HOUR,
  day: PricingUnit.DAY,
  daily: PricingUnit.DAY,
};

function parsePricingUnit(value: unknown): PricingUnit | null {
  const raw = String(value || "").trim();
  const normalized = raw.toUpperCase();
  if (Object.values(PricingUnit).includes(normalized as PricingUnit))
    return normalized as PricingUnit;
  return aliases[raw.toLowerCase()] || null;
}

async function getCHCSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { role?: string; profileId?: string }
    | undefined;
  if (!user || user.role !== "chc" || !user.profileId) return null;
  return user as { role: string; profileId: string };
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
    const price = Number(body.price);
    const pricingUnit = parsePricingUnit(body.pricingUnit);
    if (!Number.isFinite(price) || price <= 0 || !pricingUnit) {
      return NextResponse.json(
        { error: "A valid price and pricing unit are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.cHCService.findFirst({
      where: { id, chcId: user.profileId },
    });
    if (!existing)
      return NextResponse.json(
        { error: "Service offer not found" },
        { status: 404 },
      );

    const service = await prisma.cHCService.update({
      where: { id },
      data: { price, pricingUnit },
    });
    return NextResponse.json({ service });
  } catch (error: unknown) {
    console.error("CHC service update error:", error);
    return NextResponse.json(
      { error: "Unable to update service offer" },
      { status: 500 },
    );
  }
}
