// Mock District-Level Poverty Index (0-100, higher = more poverty)
// Used for Geographic Need Score calculation

export const POVERTY_INDEX: Record<string, number> = {
    'jharkhand': 87,
    'bihar': 82,
    'odisha': 78,
    'madhya pradesh': 75,
    'uttar pradesh': 72,
    'assam': 70,
    'west bengal': 65,
    'rajasthan': 62,
    'maharashtra': 45,
    'tamil nadu': 40,
    'karnataka': 42,
    'telangana': 38,
    'gujarat': 35,
    'kerala': 30,
    'punjab': 32,
    'delhi': 25,
};

export function getPovertyScore(locationName: string): number {
    const key = locationName.toLowerCase().trim();
    for (const [region, score] of Object.entries(POVERTY_INDEX)) {
        if (key.includes(region) || region.includes(key)) {
            return score;
        }
    }
    return 50; // default mid-range
}

export function isUnderservedRegion(locationName: string): boolean {
    return getPovertyScore(locationName) >= 65;
}
