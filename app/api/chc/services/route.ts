import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { PricingUnit } from "@/generated/prisma/client";

const normalize = (value: string) => value.trim().toLowerCase();

const pricingUnitAliases: Record<string, PricingUnit> = {
  acre: PricingUnit.ACRE,
  "price per acre": PricingUnit.ACRE,
  bigha: PricingUnit.BIGHA,
  "price per bigha": PricingUnit.BIGHA,
  hour: PricingUnit.HOUR,
  hourly: PricingUnit.HOUR,
  "price per hour": PricingUnit.HOUR,
  day: PricingUnit.DAY,
  daily: PricingUnit.DAY,
  "price per day": PricingUnit.DAY,
};

function parsePricingUnit(value: unknown): PricingUnit | null {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();
  if (Object.values(PricingUnit).includes(normalized as PricingUnit)) {
    return normalized as PricingUnit;
  }

  return (
    pricingUnitAliases[
      String(value || "")
        .trim()
        .toLowerCase()
    ] || null
  );
}

function hasRequiredResources(
  resourcesRequired: string[],
  equipment: { name: string; type: string }[],
) {
  const available = equipment.map((item) => [
    // normalize(item.name),
    normalize(item.type),
  ]);
  return resourcesRequired.every((resource) => {
    const required = normalize(resource);
    return available.some(
      ([name, type]) => name === required || type === required,
    );
  });
}

async function getCHCSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { role?: string; profileId?: string }
    | undefined;
  if (!user || user.role !== "chc" || !user.profileId) return null;
  return user as { role: string; profileId: string };
}

export async function GET() {
  const user = await getCHCSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [services, equipment, addedServices] = await Promise.all([
    prisma.platformService.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.equipment.findMany({
      where: { chcId: user.profileId },
      select: { name: true, type: true },
    }),
    prisma.cHCService.findMany({
      where: { chcId: user.profileId },
      select: { id: true, serviceId: true, price: true, pricingUnit: true },
    }),
  ]);

  return NextResponse.json({
    services: services.map((service) => ({
      ...service,
      eligible: hasRequiredResources(service.resourcesRequired, equipment),
      offer:
        addedServices.find((item) => item.serviceId === service.id) || null,
      alreadyAdded: addedServices.some((item) => item.serviceId === service.id),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCHCSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const serviceId = String(body.serviceId || "");
    const price = Number(body.price);
    const pricingUnit = parsePricingUnit(body.pricingUnit);
    if (!serviceId || !Number.isFinite(price) || price <= 0 || !pricingUnit) {
      return NextResponse.json(
        { error: "Service, pricing unit, and a valid price are required" },
        { status: 400 },
      );
    }

    const [service, equipment] = await Promise.all([
      prisma.platformService.findFirst({
        where: { id: serviceId, isActive: true },
      }),
      prisma.equipment.findMany({
        where: { chcId: user.profileId },
        select: { name: true, type: true },
      }),
    ]);

    if (!service)
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    if (!hasRequiredResources(service.resourcesRequired, equipment)) {
      return NextResponse.json(
        { error: "Add all required resources before offering this service" },
        { status: 403 },
      );
    }

    const chcService = await prisma.cHCService.create({
      data: {
        chcId: user.profileId,
        serviceId,
        price,
        pricingUnit: pricingUnit as PricingUnit,
      },
    });
    return NextResponse.json({ service: chcService }, { status: 201 });
  } catch (error: unknown) {
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
    if (errorCode === "P2002")
      return NextResponse.json(
        { error: "This service is already added" },
        { status: 409 },
      );
    console.error("CHC service creation error:", error);
    return NextResponse.json(
      { error: "Unable to add service" },
      { status: 500 },
    );
  }
}
