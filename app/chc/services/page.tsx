import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { calculateDistance } from "@/src/lib/geo";
import Link from "next/link";
import { MapPin, Sprout, Tractor, AlertTriangle, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import ServiceFilters from "@/components/filters/ServiceFilters";
import NearbyServiceCard from "@/components/cards/NearbyServiceCard";

export default async function CHCServicesPage(props: { searchParams: Promise<{ category?: string, distance?: string, sort?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
            <p className="text-gray-600 mb-6">You must be logged in as a farmer to view nearby CHC services.</p>
            <Link href="/" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition">Go Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fetch the current farmer's location
  const farmer = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!farmer) return <div>User not found</div>;

  let farmerLat = 0;
  let farmerLon = 0;

  try {
    const loc = farmer.location as any;
    if (loc && loc.lat && loc.lon) {
      farmerLat = loc.lat;
      farmerLon = loc.lon;
    }
  } catch (e) {
    // Location missing
  }

  // If farmer has no location, show alert
  if (!farmerLat || !farmerLon) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12 shadow-sm">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Location Required</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              We need to know your farm's location to find Custom Hiring Centres (CHCs) near you. Please update your profile first.
            </p>
            <Link
              href="/dashboard/farmer/profile"
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20"
            >
              Update Profile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Define "today" for equipment locking logic
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  // Parse filters
  const maxDistance = searchParams.distance ? parseInt(searchParams.distance) : 5;
  const categoryId = searchParams.category;
  const sortOption = searchParams.sort || 'distance';

  // Fetch all active CHC services with relations
  const allServices = await prisma.cHCService.findMany({
    where: { isActive: true },
    include: {
      service: true,
      chc: {
        include: {
          user: true, // Need this for location
          equipments: {
            include: {
              assignedResources: {
                include: {
                  booking: true
                }
              }
            }
          }
        }
      }
    }
  });

  // Filter and process the results in two steps to minimize OSRM API calls
  // Step 1: Pre-filter using straight-line distance and category
  const candidateServices = allServices.map(chcService => {
    let straightDistance = Infinity;
    let chcLat = 0;
    let chcLon = 0;
    try {
      const chcLoc = chcService.chc.user.location as any;
      if (chcLoc && chcLoc.lat) {
        const lon = chcLoc.lon || chcLoc.lng;
        if (lon) {
          chcLat = parseFloat(chcLoc.lat);
          chcLon = parseFloat(lon);
          straightDistance = calculateDistance(farmerLat, farmerLon, chcLat, chcLon);
        }
      }
    } catch (e) {
      // Ignore
    }

    return {
      ...chcService,
      straightDistance,
      chcLat,
      chcLon,
      farmerLat,
      farmerLon
    };
  }).filter(s => {
    // Fast rejection: Category
    if (categoryId && s.serviceId !== categoryId) return false;
    
    // Fast rejection: If straight line distance is already way larger than max (e.g. > max * 2 + 5km), skip API call
    if (s.straightDistance > maxDistance * 2 + 5) return false;
    
    return true;
  });

  // Step 2: Get actual route distances for unique CHC locations
  const { getRouteDistance } = await import("@/src/lib/geo");
  const uniqueChcLocations = new Map<string, { lat: number, lon: number, distance: number }>();
  
  for (const s of candidateServices) {
    if (s.chcLat && s.chcLon) {
      const key = `${s.chcLat.toFixed(6)},${s.chcLon.toFixed(6)}`;
      if (!uniqueChcLocations.has(key)) {
        uniqueChcLocations.set(key, { lat: s.chcLat, lon: s.chcLon, distance: Infinity });
      }
    }
  }

  // Fetch all route distances concurrently
  await Promise.all(
    Array.from(uniqueChcLocations.entries()).map(async ([key, loc]) => {
      loc.distance = await getRouteDistance(farmerLat, farmerLon, loc.lat, loc.lon);
    })
  );

  // Step 3: Map actual distances back and apply final filters
  const nearbyServices = candidateServices.map(s => {
    let distance = Infinity;
    if (s.chcLat && s.chcLon) {
      const key = `${s.chcLat.toFixed(6)},${s.chcLon.toFixed(6)}`;
      distance = uniqueChcLocations.get(key)?.distance ?? Infinity;
    }
    return {
      ...s,
      distance
    };
  }).filter(s => {
    // 1. Category Filter
    if (categoryId && s.serviceId !== categoryId) return false;

    // 2. Distance Filter
    if (s.distance > maxDistance) return false;

    // 3. Equipment Availability Check
    const requiredEquipments = s.service.resourcesRequired || [];

    // Check if the CHC can provide every required equipment type for today
    for (const requiredType of requiredEquipments) {
      // Find all equipments this CHC owns of this specific required type
      const equipmentsOfType = s.chc.equipments.filter(e => e.type === requiredType && e.status === "available");

      // If they don't even own this type, they can't do the service
      if (equipmentsOfType.length === 0) return false;

      // Check if at least ONE equipment of this type is free today
      const hasAvailableEquipment = equipmentsOfType.some(equipment => {
        // Find if this specific equipment is assigned to any active booking today
        const isLockedToday = equipment.assignedResources.some(ar => {
          const booking = ar.booking;
          const bookingDate = new Date(booking.bookingDate);

          const isToday = bookingDate >= todayStart && bookingDate < todayEnd;
          // Consider it locked if it's not cancelled or completed
          const isActiveBooking = !['cancelled', 'completed', 'rejected'].includes(booking.bookingStatus.toLowerCase());

          return isToday && isActiveBooking;
        });

        // If it's NOT locked today, this equipment is available
        return !isLockedToday;
      });

      // If they don't have at least one free equipment for this required type, the whole service cannot be performed today
      if (!hasAvailableEquipment) return false;
    }

    return true; // Meets distance AND equipment availability criteria
  }).sort((a, b) => {
    if (sortOption === 'price_asc') return a.price - b.price;
    if (sortOption === 'price_desc') return b.price - a.price;
    return a.distance - b.distance; // default to closest first
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Services Near You
            </h2>
            <p className="mt-3 text-lg text-slate-600 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" />
              Showing available services within {maxDistance}km of your location.
            </p>
          </div>

          {/* Filters UI */}
          <div className="mb-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <ServiceFilters
              initialDistance={maxDistance}
              initialSort={sortOption}
              categoryId={categoryId}
            />
          </div>

          {nearbyServices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <Tractor className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">No Services Found</h3>
              <p className="text-lg text-slate-500 max-w-lg mx-auto mb-8">
                We couldn't find any available services matching your filters (within {maxDistance}km). Try increasing the distance or check back tomorrow.
              </p>
              <div>
                <Link
                  href="/services"
                  className="inline-flex items-center text-emerald-600 font-bold hover:text-emerald-700 text-lg group"
                >
                  Browse all services across the platform <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {nearbyServices.map(item => (
                <NearbyServiceCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
