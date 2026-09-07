// ──────────────────────────────────────────────────────────────
// Jharkhand 24 Districts Master Registry & SDG Pressure Dataset
// SIH 26043 — Government Command Center
// ──────────────────────────────────────────────────────────────

export interface DistrictSDGPressure {
    sdg: number;
    title: string;
    pressureLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
    color: string;
}

export interface DistrictProfile {
    name: string;
    headquarters: string;
    division: string;
    nitiSdgIndex: number;
    nearestHei: string;
    heiDistrict: string;
    sdgPressures: DistrictSDGPressure[];
    baselineChallenges: {
        total: number;
        resolved: number;
        inProgress: number;
        fundingCommittedLakhs: number;
    };
}

export const JHARKHAND_DISTRICTS: Record<string, DistrictProfile> = {
    'Pakur': {
        name: 'Pakur',
        headquarters: 'Pakur',
        division: 'Santhal Pargana',
        nitiSdgIndex: 37.4,
        nearestHei: 'National Institute of Technology Jamshedpur',
        heiDistrict: 'East Singhbhum',
        sdgPressures: [
            { sdg: 6, title: 'Clean Water & Sanitation', pressureLevel: 'CRITICAL', color: '#26bde2' },
            { sdg: 3, title: 'Good Health & Well-being', pressureLevel: 'HIGH', color: '#4c9f38' },
            { sdg: 1, title: 'No Poverty', pressureLevel: 'HIGH', color: '#e5243b' },
        ],
        baselineChallenges: { total: 5, resolved: 1, inProgress: 3, fundingCommittedLakhs: 42.5 },
    },
    'Simdega': {
        name: 'Simdega',
        headquarters: 'Simdega',
        division: 'South Chotanagpur',
        nitiSdgIndex: 41.2,
        nearestHei: 'Birla Institute of Technology Mesra',
        heiDistrict: 'Ranchi',
        sdgPressures: [
            { sdg: 6, title: 'Clean Water & Sanitation', pressureLevel: 'CRITICAL', color: '#26bde2' },
            { sdg: 2, title: 'Zero Hunger & Nutrition', pressureLevel: 'HIGH', color: '#dda63a' },
            { sdg: 3, title: 'Good Health & Well-being', pressureLevel: 'HIGH', color: '#4c9f38' },
        ],
        baselineChallenges: { total: 4, resolved: 0, inProgress: 3, fundingCommittedLakhs: 28.0 },
    },
    'Palamu': {
        name: 'Palamu',
        headquarters: 'Medininagar',
        division: 'Palamu',
        nitiSdgIndex: 38.2,
        nearestHei: 'Government Polytechnic Palamu',
        heiDistrict: 'Palamu',
        sdgPressures: [
            { sdg: 2, title: 'Drought Resilience & Agri', pressureLevel: 'CRITICAL', color: '#dda63a' },
            { sdg: 6, title: 'Clean Water Scarcity', pressureLevel: 'CRITICAL', color: '#26bde2' },
            { sdg: 8, title: 'Decent Work & Livelihood', pressureLevel: 'HIGH', color: '#a21942' },
        ],
        baselineChallenges: { total: 6, resolved: 3, inProgress: 2, fundingCommittedLakhs: 35.0 },
    },
    'Garhwa': {
        name: 'Garhwa',
        headquarters: 'Garhwa',
        division: 'Palamu',
        nitiSdgIndex: 36.9,
        nearestHei: 'Government Polytechnic Palamu',
        heiDistrict: 'Palamu',
        sdgPressures: [
            { sdg: 1, title: 'Rural Poverty', pressureLevel: 'CRITICAL', color: '#e5243b' },
            { sdg: 6, title: 'Groundwater Arsenic', pressureLevel: 'CRITICAL', color: '#26bde2' },
            { sdg: 7, title: 'Affordable & Clean Energy', pressureLevel: 'HIGH', color: '#fcc30b' },
        ],
        baselineChallenges: { total: 4, resolved: 1, inProgress: 2, fundingCommittedLakhs: 19.5 },
    },
    'Latehar': {
        name: 'Latehar',
        headquarters: 'Latehar',
        division: 'Palamu',
        nitiSdgIndex: 39.7,
        nearestHei: 'Central University of Jharkhand',
        heiDistrict: 'Ranchi',
        sdgPressures: [
            { sdg: 15, title: 'Forest & Biodiversity Conservation', pressureLevel: 'CRITICAL', color: '#56c02b' },
            { sdg: 4, title: 'Quality Tribal Education', pressureLevel: 'HIGH', color: '#c5192d' },
            { sdg: 3, title: 'Primary Health Access', pressureLevel: 'HIGH', color: '#4c9f38' },
        ],
        baselineChallenges: { total: 5, resolved: 1, inProgress: 2, fundingCommittedLakhs: 24.0 },
    },
    'Dumka': {
        name: 'Dumka',
        headquarters: 'Dumka',
        division: 'Santhal Pargana',
        nitiSdgIndex: 41.8,
        nearestHei: 'Sido Kanhu Murmu University',
        heiDistrict: 'Dumka',
        sdgPressures: [
            { sdg: 3, title: 'Maternal & Child Health', pressureLevel: 'HIGH', color: '#4c9f38' },
            { sdg: 4, title: 'Secondary School Retention', pressureLevel: 'HIGH', color: '#c5192d' },
            { sdg: 10, title: 'Reduced Inequalities', pressureLevel: 'MODERATE', color: '#dd1367' },
        ],
        baselineChallenges: { total: 5, resolved: 2, inProgress: 2, fundingCommittedLakhs: 32.0 },
    },
    'Godda': {
        name: 'Godda',
        headquarters: 'Godda',
        division: 'Santhal Pargana',
        nitiSdgIndex: 39.6,
        nearestHei: 'Sido Kanhu Murmu University',
        heiDistrict: 'Dumka',
        sdgPressures: [
            { sdg: 7, title: 'Thermal Ash & Clean Energy', pressureLevel: 'CRITICAL', color: '#fcc30b' },
            { sdg: 2, title: 'Malnutrition Intervention', pressureLevel: 'HIGH', color: '#dda63a' },
            { sdg: 6, title: 'Rural Safe Drinking Water', pressureLevel: 'HIGH', color: '#26bde2' },
        ],
        baselineChallenges: { total: 4, resolved: 1, inProgress: 2, fundingCommittedLakhs: 22.5 },
    },
    'Sahebganj': {
        name: 'Sahebganj',
        headquarters: 'Sahebganj',
        division: 'Santhal Pargana',
        nitiSdgIndex: 38.8,
        nearestHei: 'NIT Jamshedpur',
        heiDistrict: 'East Singhbhum',
        sdgPressures: [
            { sdg: 14, title: 'Ganga River Basin Conservation', pressureLevel: 'CRITICAL', color: '#0a97d9' },
            { sdg: 6, title: 'Riverine Flood Water Treatment', pressureLevel: 'HIGH', color: '#26bde2' },
            { sdg: 3, title: 'Vector-borne Disease Control', pressureLevel: 'HIGH', color: '#4c9f38' },
        ],
        baselineChallenges: { total: 4, resolved: 1, inProgress: 2, fundingCommittedLakhs: 26.0 },
    },
    'Jamtara': {
        name: 'Jamtara',
        headquarters: 'Jamtara',
        division: 'Santhal Pargana',
        nitiSdgIndex: 44.6,
        nearestHei: 'IIT (ISM) Dhanbad',
        heiDistrict: 'Dhanbad',
        sdgPressures: [
            { sdg: 8, title: 'Digital Literacy & Skill Training', pressureLevel: 'CRITICAL', color: '#a21942' },
            { sdg: 4, title: 'Youth Technical Education', pressureLevel: 'HIGH', color: '#c5192d' },
            { sdg: 9, title: 'Rural Broadband Infra', pressureLevel: 'MODERATE', color: '#fd6925' },
        ],
        baselineChallenges: { total: 3, resolved: 1, inProgress: 1, fundingCommittedLakhs: 18.0 },
    },
    'Deoghar': {
        name: 'Deoghar',
        headquarters: 'Deoghar',
        division: 'Santhal Pargana',
        nitiSdgIndex: 52.1,
        nearestHei: 'AIIMS Deoghar / BIT Mesra Extension',
        heiDistrict: 'Deoghar',
        sdgPressures: [
            { sdg: 11, title: 'Pilgrim Solid Waste Management', pressureLevel: 'HIGH', color: '#fd9d24' },
            { sdg: 6, title: 'Urban Water Drainage', pressureLevel: 'HIGH', color: '#26bde2' },
            { sdg: 3, title: 'Regional Healthcare Logistics', pressureLevel: 'MODERATE', color: '#4c9f38' },
        ],
        baselineChallenges: { total: 4, resolved: 2, inProgress: 1, fundingCommittedLakhs: 38.0 },
    },
    'Giridih': {
        name: 'Giridih',
        headquarters: 'Giridih',
        division: 'North Chotanagpur',
        nitiSdgIndex: 48.3,
        nearestHei: 'IIT (ISM) Dhanbad',
        heiDistrict: 'Dhanbad',
        sdgPressures: [
            { sdg: 8, title: 'Mica Belt Child Welfare & Livelihood', pressureLevel: 'CRITICAL', color: '#a21942' },
            { sdg: 1, title: 'Poverty Alleviation', pressureLevel: 'HIGH', color: '#e5243b' },
            { sdg: 4, title: 'Formal Schooling Enrollment', pressureLevel: 'HIGH', color: '#c5192d' },
        ],
        baselineChallenges: { total: 5, resolved: 2, inProgress: 2, fundingCommittedLakhs: 31.0 },
    },
    'Hazaribagh': {
        name: 'Hazaribagh',
        headquarters: 'Hazaribagh',
        division: 'North Chotanagpur',
        nitiSdgIndex: 54.7,
        nearestHei: 'Vinoba Bhave University',
        heiDistrict: 'Hazaribagh',
        sdgPressures: [
            { sdg: 15, title: 'Wildlife Corridor Protection', pressureLevel: 'HIGH', color: '#56c02b' },
            { sdg: 12, title: 'Eco-Tourism & Waste', pressureLevel: 'MODERATE', color: '#bf8b2e' },
            { sdg: 4, title: 'Higher Education Research', pressureLevel: 'MODERATE', color: '#c5192d' },
        ],
        baselineChallenges: { total: 4, resolved: 3, inProgress: 1, fundingCommittedLakhs: 44.0 },
    },
    'Chatra': {
        name: 'Chatra',
        headquarters: 'Chatra',
        division: 'North Chotanagpur',
        nitiSdgIndex: 40.3,
        nearestHei: 'Vinoba Bhave University',
        heiDistrict: 'Hazaribagh',
        sdgPressures: [
            { sdg: 3, title: 'Remote Primary Healthcare', pressureLevel: 'CRITICAL', color: '#4c9f38' },
            { sdg: 1, title: 'Aspirational District Poverty', pressureLevel: 'HIGH', color: '#e5243b' },
            { sdg: 9, title: 'Road Connectivity & Bridges', pressureLevel: 'HIGH', color: '#fd6925' },
        ],
        baselineChallenges: { total: 4, resolved: 1, inProgress: 2, fundingCommittedLakhs: 21.0 },
    },
    'Koderma': {
        name: 'Koderma',
        headquarters: 'Koderma',
        division: 'North Chotanagpur',
        nitiSdgIndex: 49.2,
        nearestHei: 'IIT (ISM) Dhanbad',
        heiDistrict: 'Dhanbad',
        sdgPressures: [
            { sdg: 4, title: 'Foundational Numeracy & Literacy', pressureLevel: 'HIGH', color: '#c5192d' },
            { sdg: 8, title: 'Youth Skill Development', pressureLevel: 'HIGH', color: '#a21942' },
            { sdg: 15, title: 'Forest Land Degradation', pressureLevel: 'MODERATE', color: '#56c02b' },
        ],
        baselineChallenges: { total: 3, resolved: 2, inProgress: 1, fundingCommittedLakhs: 25.0 },
    },
    'Dhanbad': {
        name: 'Dhanbad',
        headquarters: 'Dhanbad',
        division: 'North Chotanagpur',
        nitiSdgIndex: 58.1,
        nearestHei: 'IIT (ISM) Dhanbad',
        heiDistrict: 'Dhanbad',
        sdgPressures: [
            { sdg: 7, title: 'Mine Fire & Clean Energy Transition', pressureLevel: 'CRITICAL', color: '#fcc30b' },
            { sdg: 3, title: 'Respiratory Health & Air Quality', pressureLevel: 'CRITICAL', color: '#4c9f38' },
            { sdg: 11, title: 'Colliery Settlement Subsidence', pressureLevel: 'HIGH', color: '#fd9d24' },
        ],
        baselineChallenges: { total: 6, resolved: 4, inProgress: 2, fundingCommittedLakhs: 75.0 },
    },
    'Bokaro': {
        name: 'Bokaro',
        headquarters: 'Bokaro Steel City',
        division: 'North Chotanagpur',
        nitiSdgIndex: 56.3,
        nearestHei: 'IIT (ISM) Dhanbad',
        heiDistrict: 'Dhanbad',
        sdgPressures: [
            { sdg: 9, title: 'Industrial Decarbonization', pressureLevel: 'HIGH', color: '#fd6925' },
            { sdg: 6, title: 'Damodar River Effluent Treatment', pressureLevel: 'HIGH', color: '#26bde2' },
            { sdg: 12, title: 'Slag Recycling & Circularity', pressureLevel: 'MODERATE', color: '#bf8b2e' },
        ],
        baselineChallenges: { total: 6, resolved: 4, inProgress: 2, fundingCommittedLakhs: 68.0 },
    },
    'Ramgarh': {
        name: 'Ramgarh',
        headquarters: 'Ramgarh',
        division: 'North Chotanagpur',
        nitiSdgIndex: 53.8,
        nearestHei: 'Birla Institute of Technology Mesra',
        heiDistrict: 'Ranchi',
        sdgPressures: [
            { sdg: 13, title: 'Industrial Smog & Climate Action', pressureLevel: 'HIGH', color: '#3f7e44' },
            { sdg: 6, title: 'Industrial Wastewater Management', pressureLevel: 'HIGH', color: '#26bde2' },
            { sdg: 8, title: 'SME Manufacturing Growth', pressureLevel: 'MODERATE', color: '#a21942' },
        ],
        baselineChallenges: { total: 3, resolved: 2, inProgress: 1, fundingCommittedLakhs: 34.0 },
    },
    'Ranchi': {
        name: 'Ranchi',
        headquarters: 'Ranchi',
        division: 'South Chotanagpur',
        nitiSdgIndex: 62.4,
        nearestHei: 'Birla Institute of Technology Mesra',
        heiDistrict: 'Ranchi',
        sdgPressures: [
            { sdg: 11, title: 'Urban Solid Waste & Traffic', pressureLevel: 'HIGH', color: '#fd9d24' },
            { sdg: 9, title: 'Startup Incubation & Patents', pressureLevel: 'MODERATE', color: '#fd6925' },
            { sdg: 6, title: 'Urban Lake Rejuvenation', pressureLevel: 'MODERATE', color: '#26bde2' },
        ],
        baselineChallenges: { total: 8, resolved: 6, inProgress: 2, fundingCommittedLakhs: 112.0 },
    },
    'Lohardaga': {
        name: 'Lohardaga',
        headquarters: 'Lohardaga',
        division: 'South Chotanagpur',
        nitiSdgIndex: 44.1,
        nearestHei: 'Birsa Agricultural University',
        heiDistrict: 'Ranchi',
        sdgPressures: [
            { sdg: 9, title: 'Bauxite Mining Land Restoration', pressureLevel: 'CRITICAL', color: '#fd6925' },
            { sdg: 2, title: 'Rainfed Agriculture Modernization', pressureLevel: 'HIGH', color: '#dda63a' },
            { sdg: 1, title: 'Tribal Farmer Income Security', pressureLevel: 'HIGH', color: '#e5243b' },
        ],
        baselineChallenges: { total: 3, resolved: 1, inProgress: 1, fundingCommittedLakhs: 17.5 },
    },
    'Gumla': {
        name: 'Gumla',
        headquarters: 'Gumla',
        division: 'South Chotanagpur',
        nitiSdgIndex: 40.1,
        nearestHei: 'Birsa Agricultural University',
        heiDistrict: 'Ranchi',
        sdgPressures: [
            { sdg: 2, title: 'Finger Millet & Ragi Processing', pressureLevel: 'HIGH', color: '#dda63a' },
            { sdg: 6, title: 'Solar Powered Drip Irrigation', pressureLevel: 'HIGH', color: '#26bde2' },
            { sdg: 1, title: 'PVTG (Vulnerable Tribe) Nutrition', pressureLevel: 'CRITICAL', color: '#e5243b' },
        ],
        baselineChallenges: { total: 5, resolved: 1, inProgress: 3, fundingCommittedLakhs: 29.0 },
    },
    'Khunti': {
        name: 'Khunti',
        headquarters: 'Khunti',
        division: 'South Chotanagpur',
        nitiSdgIndex: 43.8,
        nearestHei: 'Birla Institute of Technology Mesra',
        heiDistrict: 'Ranchi',
        sdgPressures: [
            { sdg: 7, title: '100% Solar Electrified Villages', pressureLevel: 'HIGH', color: '#fcc30b' },
            { sdg: 15, title: 'Lac Cultivation & Bio-Economy', pressureLevel: 'HIGH', color: '#56c02b' },
            { sdg: 8, title: 'Tribal Artisan Handicrafts Value-Add', pressureLevel: 'MODERATE', color: '#a21942' },
        ],
        baselineChallenges: { total: 4, resolved: 3, inProgress: 1, fundingCommittedLakhs: 41.0 },
    },
    'West Singhbhum': {
        name: 'West Singhbhum',
        headquarters: 'Chaibasa',
        division: 'Kolhan',
        nitiSdgIndex: 42.1,
        nearestHei: 'National Institute of Technology Jamshedpur',
        heiDistrict: 'East Singhbhum',
        sdgPressures: [
            { sdg: 3, title: 'Severe Acute Malnutrition (SAM)', pressureLevel: 'CRITICAL', color: '#4c9f38' },
            { sdg: 15, title: 'Saranda Sal Forest Conservation', pressureLevel: 'HIGH', color: '#56c02b' },
            { sdg: 6, title: 'Iron-contaminated Spring Water', pressureLevel: 'HIGH', color: '#26bde2' },
        ],
        baselineChallenges: { total: 5, resolved: 1, inProgress: 3, fundingCommittedLakhs: 33.0 },
    },
    'Seraikela': {
        name: 'Seraikela',
        headquarters: 'Seraikela',
        division: 'Kolhan',
        nitiSdgIndex: 51.4,
        nearestHei: 'National Institute of Technology Jamshedpur',
        heiDistrict: 'East Singhbhum',
        sdgPressures: [
            { sdg: 8, title: 'Adityapur Auto Ancillary MSMEs', pressureLevel: 'HIGH', color: '#a21942' },
            { sdg: 6, title: 'Subarnarekha Industrial Runoff', pressureLevel: 'HIGH', color: '#26bde2' },
            { sdg: 4, title: 'Polytechnic Apprenticeship Programs', pressureLevel: 'MODERATE', color: '#c5192d' },
        ],
        baselineChallenges: { total: 4, resolved: 2, inProgress: 2, fundingCommittedLakhs: 46.0 },
    },
    'East Singhbhum': {
        name: 'East Singhbhum',
        headquarters: 'Jamshedpur',
        division: 'Kolhan',
        nitiSdgIndex: 61.2,
        nearestHei: 'National Institute of Technology Jamshedpur',
        heiDistrict: 'East Singhbhum',
        sdgPressures: [
            { sdg: 9, title: 'Advanced Metallurgical Innovation', pressureLevel: 'HIGH', color: '#fd6925' },
            { sdg: 11, title: 'Urban Solid Waste & Circular Tech', pressureLevel: 'HIGH', color: '#fd9d24' },
            { sdg: 8, title: 'Green CSR Industrial Synergy', pressureLevel: 'MODERATE', color: '#a21942' },
        ],
        baselineChallenges: { total: 5, resolved: 4, inProgress: 1, fundingCommittedLakhs: 88.0 },
    },
};

export const ALL_DISTRICT_NAMES: string[] = Object.keys(JHARKHAND_DISTRICTS);

export function getDistrictProfile(districtName: string): DistrictProfile {
    const norm = districtName.trim().toLowerCase();
    const match = Object.keys(JHARKHAND_DISTRICTS).find(
        (d) => d.toLowerCase() === norm || norm.includes(d.toLowerCase()) || d.toLowerCase().includes(norm)
    );
    if (match && JHARKHAND_DISTRICTS[match]) {
        return JHARKHAND_DISTRICTS[match];
    }
    // Generic fallback for any other district
    return {
        name: districtName,
        headquarters: districtName,
        division: 'Jharkhand Central',
        nitiSdgIndex: 45.0,
        nearestHei: 'Birla Institute of Technology Mesra',
        heiDistrict: 'Ranchi',
        sdgPressures: [
            { sdg: 6, title: 'Clean Water & Sanitation', pressureLevel: 'HIGH', color: '#26bde2' },
            { sdg: 3, title: 'Health & Well-being', pressureLevel: 'HIGH', color: '#4c9f38' },
            { sdg: 4, title: 'Quality Education', pressureLevel: 'MODERATE', color: '#c5192d' },
        ],
        baselineChallenges: { total: 4, resolved: 1, inProgress: 2, fundingCommittedLakhs: 25.0 },
    };
}
