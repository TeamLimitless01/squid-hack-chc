import { tool } from "@langchain/core/tools";
import { z } from "zod";
import prisma from "@/src/lib/db";

// Type for the current user context passed into tool executions
export interface AIUserContext {
  id?: string;
  name?: string;
  email?: string;
  role?: string; // "farmer", "chc", "driver"
  profileId?: string;
}

// 1. Search Available Services Tool (for Farmers and general inquiries)
export const searchServicesTool = tool(
  async ({ query, location, maxPrice, pricingUnit }) => {
    try {
      const allServices = await prisma.cHCService.findMany({
        where: { isActive: true },
        include: {
          service: true,
          chc: {
            include: {
              user: true,
              equipments: true,
            },
          },
        },
      });

      if (!allServices || allServices.length === 0) {
        return "No active services found on the platform at the moment.";
      }

      let filtered = allServices;

      if (query && query.trim() !== "" && query.toLowerCase() !== "all") {
        const q = query.toLowerCase();
        filtered = filtered.filter((s) => {
          const serviceName = s.service.name.toLowerCase();
          const serviceDesc = (s.service.description || "").toLowerCase();
          const reqs = s.service.resourcesRequired.map((r) => r.toLowerCase()).join(" ");
          const centerName = s.chc.centerName.toLowerCase();
          return (
            serviceName.includes(q) ||
            serviceDesc.includes(q) ||
            reqs.includes(q) ||
            centerName.includes(q)
          );
        });
      }

      if (location && location.trim() !== "") {
        const loc = location.toLowerCase();
        filtered = filtered.filter((s) => {
          const city = (s.chc.user.city || "").toLowerCase();
          const state = (s.chc.user.state || "").toLowerCase();
          const address = (s.chc.user.address || "").toLowerCase();
          return city.includes(loc) || state.includes(loc) || address.includes(loc);
        });
      }

      if (maxPrice && maxPrice > 0) {
        filtered = filtered.filter((s) => s.price <= maxPrice);
      }

      if (pricingUnit && pricingUnit !== "ALL") {
        filtered = filtered.filter((s) => s.pricingUnit === pricingUnit);
      }

      if (filtered.length === 0) {
        return `No matching services found for "${query || 'agricultural services'}" ${location ? `in ${location}` : ''}. Available services on platform include: Cultivation, Ploughing, Seed Sowing, Rotavator, Spraying, and Harvesting. You can view all at /services.`;
      }

      const results = filtered.map((s) => ({
        serviceId: s.id,
        serviceName: s.service.name,
        description: s.service.description,
        price: `₹${s.price} per ${s.pricingUnit}`,
        rawPrice: s.price,
        pricingUnit: s.pricingUnit,
        chcCenter: s.chc.centerName,
        chcRating: s.chc.rating > 0 ? `${s.chc.rating.toFixed(1)}/5` : "New Provider",
        city: s.chc.user.city || "Area Available",
        state: s.chc.user.state || "",
        contactPhone: s.chc.user.phone,
        availableEquipments: s.chc.equipments.map((e) => `${e.name} (${e.type})`).join(", ") || "Machinery on standby",
        bookingUrl: `/chc/services?category=${s.service.id}`,
      }));

      return JSON.stringify({
        totalFound: results.length,
        services: results,
      });
    } catch (err: any) {
      console.error("Error in searchServicesTool:", err);
      return `Failed to query services: ${err.message}`;
    }
  },
  {
    name: "search_available_services",
    description:
      "Find and search available agricultural services (e.g. cultivation, rotavator, ploughing, harvesting, tractor, seed drill, spraying) provided by Custom Hiring Centres (CHCs). Returns pricing, CHC details, location, and equipment availability.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "The service keyword or machinery name to look for (e.g. 'cultivation', 'tractor', 'harvester', 'rotavator', 'plough', 'seed sowing', 'spraying', or 'all')."
        ),
      location: z
        .string()
        .optional()
        .describe("Optional city, district, state, or location to filter nearby services."),
      maxPrice: z
        .number()
        .optional()
        .describe("Optional maximum budget or price limit."),
      pricingUnit: z
        .enum(["ACRE", "BIGHA", "HOUR", "DAY", "ALL"])
        .optional()
        .describe("Optional pricing unit filter (ACRE, BIGHA, HOUR, DAY)."),
    }),
  }
);

// 2. CHC Bookings Tool (for CHC owners to view their received bookings)
export const chcBookingsTool = tool(
  async ({ timeframe, status }, config) => {
    try {
      const userCtx: AIUserContext | undefined = (config as any)?.configurable?.userContext;

      if (!userCtx || userCtx.role !== "chc") {
        return "Access restricted: The user must be logged in as a CHC (Custom Hiring Centre) to view received bookings. If they are a CHC, please ask them to log in to their CHC account.";
      }

      const user = await prisma.user.findUnique({
        where: { id: userCtx.id },
        include: { chcProfile: true },
      });

      if (!user || !user.chcProfile) {
        return "No CHC profile found for the current user.";
      }

      const chcId = user.chcProfile.id;

      // Construct date filter if requested
      let dateFilter: any = {};
      const now = new Date();

      if (timeframe === "today") {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        dateFilter = {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        };
      } else if (timeframe === "this_week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = {
          createdAt: {
            gte: startOfWeek,
          },
        };
      }

      let statusFilter: any = {};
      if (status && status !== "ALL") {
        statusFilter = { bookingStatus: status };
      }

      const bookings = await prisma.booking.findMany({
        where: {
          chcId,
          ...dateFilter,
          ...statusFilter,
        },
        include: {
          farmer: true,
          chcService: {
            include: { service: true },
          },
          assignedDriver: {
            include: { user: true },
          },
          payment: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (bookings.length === 0) {
        return `No bookings found for CHC "${user.chcProfile.centerName}" for timeframe="${timeframe || 'all'}" and status="${status || 'all'}".`;
      }

      const formatted = bookings.map((b) => ({
        bookingId: b.id,
        farmerName: b.farmer.name,
        farmerPhone: b.farmer.phone,
        farmerCity: b.farmer.city || "Not specified",
        serviceName: b.chcService.service.name,
        area: `${b.area} ${b.chcService.pricingUnit}`,
        scheduledDate: new Date(b.bookingDate).toLocaleDateString(),
        bookingStatus: b.bookingStatus,
        tripStatus: b.tripStatus,
        workStatus: b.workStatus,
        assignedDriver: b.assignedDriver ? b.assignedDriver.user.name : "Unassigned",
        driverPhone: b.assignedDriver ? b.assignedDriver.user.phone : null,
        proposalStatus: b.vpFarmerApproved ? "Approved by Farmer" : b.vpBasePrice ? "Proposal Sent" : "Pending Proposal",
        totalAmount: b.payment?.amount || b.vpFinalAmount || (b.chcService.price * b.area),
        paymentStatus: b.payment?.status || "PENDING",
        createdAt: new Date(b.createdAt).toLocaleString(),
      }));

      return JSON.stringify({
        centerName: user.chcProfile.centerName,
        totalCount: formatted.length,
        timeframe: timeframe || "all",
        bookings: formatted,
      });
    } catch (err: any) {
      console.error("Error in chcBookingsTool:", err);
      return `Failed to query CHC bookings: ${err.message}`;
    }
  },
  {
    name: "get_chc_bookings",
    description:
      "Query bookings received by the logged-in CHC (Custom Hiring Centre). Can filter by timeframe (today, this_week, all) or status (REQUESTED, ACCEPTED, REJECTED, CANCELLED). Returns farmer info, service details, scheduled dates, and job statuses.",
    schema: z.object({
      timeframe: z
        .enum(["today", "tomorrow", "this_week", "all", "pending", "active", "completed"])
        .optional()
        .describe("Timeframe filter (e.g. 'today' for bookings received today, 'this_week', or 'all')."),
      status: z
        .enum(["REQUESTED", "ACCEPTED", "REJECTED", "CANCELLED", "ALL"])
        .optional()
        .describe("Booking status filter (REQUESTED, ACCEPTED, etc.)."),
    }),
  }
);

// 3. Farmer Bookings Tool (for Farmers to track their service requests)
export const farmerBookingsTool = tool(
  async ({ status, timeframe }, config) => {
    try {
      const userCtx: AIUserContext | undefined = (config as any)?.configurable?.userContext;

      if (!userCtx || (userCtx.role !== "farmer" && userCtx.role !== "user")) {
        return "Access restricted: The user must be logged in as a Farmer to check their personal bookings. Please ask them to log in.";
      }

      let statusFilter: any = {};
      if (status && status !== "ALL") {
        statusFilter = { bookingStatus: status };
      }

      const bookings = await prisma.booking.findMany({
        where: {
          farmerId: userCtx.id,
          ...statusFilter,
        },
        include: {
          chc: {
            include: { user: true },
          },
          chcService: {
            include: { service: true },
          },
          assignedDriver: {
            include: { user: true },
          },
          payment: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (bookings.length === 0) {
        return "You have no bookings recorded yet. You can browse and book agricultural services at /services or /dashboard/farmer/bookings.";
      }

      const formatted = bookings.map((b) => ({
        bookingId: b.id,
        service: b.chcService.service.name,
        chcCenter: b.chc.centerName,
        chcContact: b.chc.user.phone,
        area: `${b.area} ${b.chcService.pricingUnit}`,
        scheduledDate: new Date(b.bookingDate).toLocaleDateString(),
        bookingStatus: b.bookingStatus,
        tripStatus: b.tripStatus,
        workStatus: b.workStatus,
        driver: b.assignedDriver ? `${b.assignedDriver.user.name} (${b.assignedDriver.user.phone})` : "Driver not assigned yet",
        amount: b.payment?.amount || b.vpFinalAmount || (b.chcService.price * b.area),
        paymentStatus: b.payment?.status || "PENDING",
      }));

      return JSON.stringify({
        totalBookings: formatted.length,
        bookings: formatted,
      });
    } catch (err: any) {
      console.error("Error in farmerBookingsTool:", err);
      return `Failed to query farmer bookings: ${err.message}`;
    }
  },
  {
    name: "get_farmer_bookings",
    description:
      "Query bookings and service requests made by the logged-in Farmer. Returns details on booking status, assigned CHC, driver assignment, scheduled date, and payment status.",
    schema: z.object({
      status: z
        .enum(["REQUESTED", "ACCEPTED", "REJECTED", "CANCELLED", "ALL"])
        .optional()
        .describe("Optional booking status filter."),
      timeframe: z
        .enum(["all", "active", "past", "today"])
        .optional()
        .describe("Optional timeframe filter."),
    }),
  }
);

// 4. Driver Trips Tool (for Drivers to view their schedule & jobs)
export const driverTripsTool = tool(
  async ({ timeframe }, config) => {
    try {
      const userCtx: AIUserContext | undefined = (config as any)?.configurable?.userContext;

      if (!userCtx || userCtx.role !== "driver") {
        return "Access restricted: The user must be logged in as a Driver to view assigned trips.";
      }

      const user = await prisma.user.findUnique({
        where: { id: userCtx.id },
        include: { driverProfile: true },
      });

      if (!user || !user.driverProfile) {
        return "No driver profile found for current user.";
      }

      const driverProfileId = user.driverProfile.id;

      const trips = await prisma.booking.findMany({
        where: {
          assignedDriverId: driverProfileId,
        },
        include: {
          farmer: true,
          chc: {
            include: { user: true },
          },
          chcService: {
            include: { service: true },
          },
        },
        orderBy: {
          bookingDate: "desc",
        },
      });

      if (trips.length === 0) {
        return "You have no trips currently assigned. Check your Trips dashboard at /dashboard/driver/trips for updates.";
      }

      const formatted = trips.map((t) => ({
        bookingId: t.id,
        service: t.chcService.service.name,
        farmerName: t.farmer.name,
        farmerPhone: t.farmer.phone,
        farmerAddress: `${t.farmer.address || ''}, ${t.farmer.city || ''}, ${t.farmer.state || ''}`.trim(),
        scheduledDate: new Date(t.bookingDate).toLocaleDateString(),
        area: `${t.area} ${t.chcService.pricingUnit}`,
        tripStatus: t.tripStatus,
        workStatus: t.workStatus,
        chcCenter: t.chc.centerName,
      }));

      return JSON.stringify({
        driverName: user.name,
        experienceYears: user.driverProfile.experienceYears,
        availability: user.driverProfile.availabilityStatus,
        totalTrips: formatted.length,
        trips: formatted,
      });
    } catch (err: any) {
      console.error("Error in driverTripsTool:", err);
      return `Failed to query driver trips: ${err.message}`;
    }
  },
  {
    name: "get_driver_trips",
    description:
      "Query trips and jobs assigned to the logged-in Driver. Returns job locations, farmer contact details, scheduled dates, and work/trip statuses.",
    schema: z.object({
      timeframe: z
        .enum(["today", "upcoming", "completed", "all"])
        .optional()
        .describe("Optional timeframe filter for driver trips."),
    }),
  }
);

// 5. CHC Fleet & Equipment Tool (for CHCs or users checking equipment)
export const chcEquipmentsTool = tool(
  async ({ equipmentType, status }, config) => {
    try {
      const userCtx: AIUserContext | undefined = (config as any)?.configurable?.userContext;

      let whereClause: any = {};

      if (userCtx && userCtx.role === "chc") {
        const user = await prisma.user.findUnique({
          where: { id: userCtx.id },
          include: { chcProfile: true },
        });
        if (user?.chcProfile) {
          whereClause.chcId = user.chcProfile.id;
        }
      }

      if (equipmentType && equipmentType !== "ALL") {
        whereClause.type = equipmentType;
      }

      if (status && status !== "all") {
        whereClause.status = status;
      }

      const equipments = await prisma.equipment.findMany({
        where: whereClause,
        include: {
          chc: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (equipments.length === 0) {
        return `No equipment found matching criteria (Type: ${equipmentType || 'any'}, Status: ${status || 'any'}).`;
      }

      const formatted = equipments.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        brand: e.brand || "Standard",
        model: e.model || "N/A",
        registrationNumber: e.registrationNumber || "Unregistered",
        status: e.status,
        fuelLevel: e.fuelLevel ? `${e.fuelLevel}%` : "Not monitored",
        usageHours: `${e.usageHours} hrs`,
        chcCenter: e.chc.centerName,
      }));

      return JSON.stringify({
        totalEquipments: formatted.length,
        equipments: formatted,
      });
    } catch (err: any) {
      console.error("Error in chcEquipmentsTool:", err);
      return `Failed to query equipments: ${err.message}`;
    }
  },
  {
    name: "get_chc_equipments",
    description:
      "Query machinery and fleet equipment (e.g. Tractors, Cultivators, Harvesters, Rotavators, Seed Drills, Sprayers) in CHC centers. Shows equipment name, type, brand, status (available/maintenance), and usage.",
    schema: z.object({
      equipmentType: z
        .enum([
          "TRACTOR",
          "CULTIVATOR",
          "SEED_DRILL",
          "ROTAVATOR",
          "PLOUGH",
          "SPRAYER",
          "HARVESTER",
          "TRAILER",
          "ALL",
        ])
        .optional()
        .describe("Filter by equipment type."),
      status: z
        .enum(["available", "in_use", "maintenance", "all"])
        .optional()
        .describe("Filter by equipment status."),
    }),
  }
);

// 6. Agricultural Advisory Tool
export const agriAdvisoryTool = tool(
  async ({ cropOrTopic }) => {
    return JSON.stringify({
      topic: cropOrTopic,
      message: `Agricultural advisory context for "${cropOrTopic}": Agriconnect provides specialized machinery for every stage of farming:
- **Field Preparation**: Primary tillage using Disc/Mouldboard Ploughs, secondary tillage and fine tilth using Rotavators and Cultivators.
- **Sowing & Planting**: Precision Seed Drills and Multi-crop Planters for optimal seed depth and row spacing.
- **Crop Care & Protection**: Tractor-mounted Boom Sprayers for uniform pesticide/fungicide/fertilizer application.
- **Harvesting & Threshing**: Combine Harvesters for quick, minimal-loss grain harvesting.
- **Post-Harvest Logistics**: Heavy-duty Agricultural Trailers for farm-to-mandi transit.
Users can directly book any of these machines from certified local CHCs on Agriconnect at /services.`,
    });
  },
  {
    name: "get_agricultural_advisory",
    description:
      "Get expert agricultural guidelines, crop management advice, seasonal recommendations, and suitable farm machinery for any crop or farming activity.",
    schema: z.object({
      cropOrTopic: z
        .string()
        .describe("The crop, soil preparation, pest, fertilizer, or agricultural topic (e.g., 'wheat sowing', 'cotton pest control', 'rotavator soil prep')."),
    }),
  }
);

// 7. Platform Help & Navigation Tool
export const platformHelpTool = tool(
  async ({ query }) => {
    return JSON.stringify({
      platform: "Agriconnect",
      routes: [
        { name: "Services Catalog", url: "/services", description: "Browse all agricultural services, standard rates, and active CHCs." },
        { name: "Farmer Dashboard", url: "/dashboard/farmer", description: "Overview of farmer stats, quick booking, and credit limit." },
        { name: "Farmer Bookings", url: "/dashboard/farmer/bookings", description: "Manage active booking requests, review proposals, and pay." },
        { name: "Farmer Profile", url: "/dashboard/farmer/profile", description: "Update farm location, land area, and personal details." },
        { name: "CHC Dashboard", url: "/dashboard/chc", description: "CHC analytics, revenue summary, and active job tracking." },
        { name: "CHC Bookings", url: "/dashboard/chc/bookings", description: "Manage incoming booking requests, assign drivers & machinery." },
        { name: "CHC Services", url: "/dashboard/chc/services", description: "List new agricultural services, pricing, and custom rates." },
        { name: "CHC Fleet/Equipment", url: "/dashboard/chc/equipment", description: "Add and monitor tractors, harvesters, and implements." },
        { name: "CHC Drivers", url: "/dashboard/chc/drivers", description: "Manage employed drivers, view driver licenses and ratings." },
        { name: "Driver Dashboard", url: "/dashboard/driver", description: "Driver home overview and status." },
        { name: "Driver Trips", url: "/dashboard/driver/trips", description: "View scheduled trips, update trip status (Started, Arrived, Completed)." },
        { name: "Login", url: "/login", description: "Sign in to Farmer, CHC, or Driver account." },
        { name: "Register", url: "/register", description: "Create a new account as a Farmer or CHC owner." }
      ],
      userGuide: "To book a service, a Farmer selects a service from /services or /chc/services, picks a date and area, and submits a request. The CHC receives the request in /dashboard/chc/bookings, accepts it, assigns a driver and tractor, and sends a price proposal. Once approved, the driver completes the trip and payment is settled."
    });
  },
  {
    name: "get_platform_routes_and_help",
    description:
      "Get platform navigation routes, feature documentation, and how-to guides for Farmers, CHCs, and Drivers.",
    schema: z.object({
      query: z
        .string()
        .describe("The platform feature, route, or workflow question (e.g. 'how to book a tractor', 'how to add equipment', 'how CHC receives payment')."),
    }),
  }
);

export const allAITools = [
  searchServicesTool,
  chcBookingsTool,
  farmerBookingsTool,
  driverTripsTool,
  chcEquipmentsTool,
  agriAdvisoryTool,
  platformHelpTool,
];
