/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * 
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Radius of the Earth in kilometers
  const R = 6371;

  // Convert degrees to radians
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in kilometers
  return R * c;
}

/**
 * Calculates the actual road distance using OSRM API, with a fallback to Haversine.
 */
export async function getRouteDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
  const straightLine = calculateDistance(lat1, lon1, lat2, lon2);

  // Round coordinates to 4 decimal places (~11 meters precision) to improve cache hits and reduce API load
  const rLon1 = lon1.toFixed(4);
  const rLat1 = lat1.toFixed(4);
  const rLon2 = lon2.toFixed(4);
  const rLat2 = lat2.toFixed(4);

  // If points are virtually identical, return 0
  if (rLon1 === rLon2 && rLat1 === rLat2) {
    return 0;
  }

  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${rLon1},${rLat1};${rLon2},${rLat2}?overview=false`;

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache the distance result for 1 hour
      // Add timeout to not block rendering indefinitely
      signal: AbortSignal.timeout(2000)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        return data.routes[0].distance / 1000; // Convert meters to km
      }
    }
  } catch (e) {
    console.error("Failed to fetch route distance from OSRM, falling back to Haversine", e);
  }

  // Fallback to straight-line distance slightly inflated to approximate road network
  return straightLine * 1.3;
}
