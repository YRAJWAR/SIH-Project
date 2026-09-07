/**
 * Jharkhand 24 Districts Geographic Coordinates
 * Grounded in official survey benchmarks and prisma/seed.ts data.
 */
export const jharkhandCoordinates: Record<string, { lat: number; lng: number }> = {
    'East Singhbhum': { lat: 22.8046, lng: 86.2029 },
    'Dhanbad': { lat: 23.7957, lng: 86.4304 },
    'Ranchi': { lat: 23.3441, lng: 85.3096 },
    'Bokaro': { lat: 23.6693, lng: 86.1511 },
    'Dumka': { lat: 24.2694, lng: 87.2492 },
    'Palamu': { lat: 24.0291, lng: 84.0678 },
    'Latehar': { lat: 23.7451, lng: 84.4987 },
    'Gumla': { lat: 23.0441, lng: 84.5354 },
    'Pakur': { lat: 24.6352, lng: 87.8448 },
    'Garhwa': { lat: 24.1650, lng: 83.8085 },
    'Simdega': { lat: 22.6113, lng: 84.5027 },
    'Khunti': { lat: 23.0712, lng: 85.2782 },
    'Lohardaga': { lat: 23.4372, lng: 84.6831 },
    'Giridih': { lat: 24.1862, lng: 86.3054 },
    'Godda': { lat: 24.8316, lng: 87.2098 },
    'Sahebganj': { lat: 25.2442, lng: 87.6365 },
    'Sahibganj': { lat: 25.2442, lng: 87.6365 },
    'West Singhbhum': { lat: 22.6167, lng: 85.8333 },
    'Seraikela': { lat: 22.5820, lng: 85.9530 },
    'Seraikela Kharsawan': { lat: 22.5820, lng: 85.9530 },
    'Chatra': { lat: 24.2011, lng: 84.8722 },
    'Hazaribagh': { lat: 23.9925, lng: 85.3637 },
    'Koderma': { lat: 24.4644, lng: 85.5956 },
    'Jamtara': { lat: 23.9662, lng: 86.8002 },
    'Deoghar': { lat: 24.4850, lng: 86.6950 },
    'Ramgarh': { lat: 23.6289, lng: 85.5178 },
};

/**
 * Case-insensitive coordinate helper
 */
export function getDistrictCoordinates(districtName: string): { lat: number; lng: number } {
    if (!districtName) return { lat: 23.6102, lng: 85.2799 };
    const exact = jharkhandCoordinates[districtName];
    if (exact) return exact;

    const normalized = districtName.toLowerCase().trim();
    for (const [key, coords] of Object.entries(jharkhandCoordinates)) {
        if (key.toLowerCase().trim() === normalized) {
            return coords;
        }
    }
    return { lat: 23.6102, lng: 85.2799 }; // Center of Jharkhand State
}
