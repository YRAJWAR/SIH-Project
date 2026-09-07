// ============================================================
// SDG Nexus — Mock Data
// ============================================================

export const SDG_INFO = [
    { id: 1, name: 'No Poverty', color: '#e5243b', icon: '🎯' },
    { id: 2, name: 'Zero Hunger', color: '#dda63a', icon: '🌾' },
    { id: 3, name: 'Good Health', color: '#4c9f38', icon: '🏥' },
    { id: 4, name: 'Quality Education', color: '#c5192d', icon: '📚' },
    { id: 5, name: 'Gender Equality', color: '#ff3a21', icon: '⚧' },
    { id: 6, name: 'Clean Water', color: '#26bde2', icon: '💧' },
    { id: 7, name: 'Affordable Energy', color: '#fcc30b', icon: '⚡' },
    { id: 8, name: 'Decent Work', color: '#a21949', icon: '💼' },
    { id: 9, name: 'Industry & Innovation', color: '#fd6e25', icon: '🏭' },
    { id: 10, name: 'Reduced Inequalities', color: '#dd1367', icon: '⚖️' },
    { id: 11, name: 'Sustainable Cities', color: '#fd9d24', icon: '🏙️' },
    { id: 12, name: 'Responsible Consumption', color: '#bf8b2e', icon: '♻️' },
    { id: 13, name: 'Climate Action', color: '#3f7e44', icon: '🌍' },
    { id: 14, name: 'Life Below Water', color: '#0a97d9', icon: '🐟' },
    { id: 15, name: 'Life on Land', color: '#56c02b', icon: '🌲' },
    { id: 16, name: 'Peace & Justice', color: '#0056c8', icon: '⚖️' },
    { id: 17, name: 'Partnerships', color: '#19486a', icon: '🤝' },
];

export type UserRole = 'ngo' | 'government' | 'corporate' | 'donor' | 'hei' | 'citizen' | 'student';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    organization_name: string;
    verification_status: 'verified' | 'pending' | 'unverified';
    created_at: string;
    avatar?: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    organization_id: string;
    organization_name: string;
    budget: number;
    spent: number;
    location: { lat: number; lng: number; name: string };
    timeline: { start: string; end: string };
    beneficiary_count: number;
    sdg_tags: number[];
    sdg_reasoning?: string;
    status: 'active' | 'completed' | 'planning';
    created_at: string;
    impact_score: number;
}

export interface Activity {
    id: string;
    project_id: string;
    project_title: string;
    description: string;
    timestamp: string;
    hash: string;
    media_url?: string;
    location: string;
    verified: boolean;
}

export interface Donation {
    id: string;
    donor_id: string;
    donor_name: string;
    project_id: string;
    project_title: string;
    amount: number;
    sdg_tags: number[];
    timestamp: string;
}

export interface ImpactScore {
    organization_id: string;
    overall_score: number;
    beneficiary_scale: number;
    outcome_score: number;
    geographic_need: number;
    funding_efficiency: number;
    verification_score: number;
    sdg_breakdown: { sdg: number; score: number }[];
}

// ---------- MOCK USERS ----------
export const MOCK_USERS: User[] = [
    // SIH26043 Jharkhand Demo Accounts (Demo@1234)
    {
        id: 'user-citizen-01', name: 'Ramu Oraon', email: 'citizen@jharkhand.gov.in', password: 'Demo@1234',
        role: 'citizen', organization_name: 'Amrapara Gram Panchayat',
        verification_status: 'verified', created_at: '2024-01-01',
    },
    {
        id: 'user-collector-01', name: 'District Collector — Ranchi', email: 'collector@jharkhand.gov.in', password: 'Demo@1234',
        role: 'government', organization_name: 'Government of Jharkhand',
        verification_status: 'verified', created_at: '2024-01-01',
    },
    {
        id: 'hei1', name: 'Prof. Anjali Sharma', email: 'faculty@nitjsr.ac.in', password: 'Demo@1234',
        role: 'hei', organization_name: 'NIT Jamshedpur',
        verification_status: 'verified', created_at: '2024-01-01',
    },
    {
        id: 'user-csr-tata', name: 'Tata Steel CSR Foundation', email: 'csr@tatasteel.com', password: 'Demo@1234',
        role: 'corporate', organization_name: 'Tata Steel CSR Foundation',
        verification_status: 'verified', created_at: '2024-01-01',
    },
    {
        id: 'user-ngo-pradan', name: 'PRADAN Jharkhand', email: 'admin@pradan.net', password: 'Demo@1234',
        role: 'ngo', organization_name: 'PRADAN Jharkhand',
        verification_status: 'verified', created_at: '2024-01-01',
    },
    {
        id: 'user-student-01', name: 'Arjun Mahato', email: 'student@nitjsr.ac.in', password: 'Demo@1234',
        role: 'student', organization_name: 'NIT Jamshedpur',
        verification_status: 'verified', created_at: '2024-01-01',
    },
    // Legacy mock users
    {
        id: 'u1', name: 'Priya Sharma', email: 'ngo@sdgnexus.org', password: 'password123',
        role: 'ngo', organization_name: 'GreenFuture Foundation',
        verification_status: 'verified', created_at: '2024-01-15',
    },
    {
        id: 'u2', name: 'Rajesh Kumar', email: 'gov@sdgnexus.org', password: 'password123',
        role: 'government', organization_name: 'NITI Aayog',
        verification_status: 'verified', created_at: '2024-02-01',
    },
    {
        id: 'u3', name: 'Anita Desai', email: 'corp@sdgnexus.org', password: 'password123',
        role: 'corporate', organization_name: 'TechServe India CSR',
        verification_status: 'verified', created_at: '2024-03-10',
    },
    {
        id: 'u4', name: 'Vikram Patel', email: 'donor@sdgnexus.org', password: 'password123',
        role: 'donor', organization_name: 'Individual',
        verification_status: 'verified', created_at: '2024-04-05',
    },
    {
        id: 'org2', name: 'Sanjay Mehta', email: 'sanjay@ecoindia.org', password: 'password123',
        role: 'ngo', organization_name: 'EcoIndia Trust',
        verification_status: 'verified', created_at: '2024-02-20',
    },
    {
        id: 'org3', name: 'Dr. Kavita Rao', email: 'kavita@healthbridge.org', password: 'password123',
        role: 'ngo', organization_name: 'HealthBridge India',
        verification_status: 'verified', created_at: '2023-11-05',
    },
    {
        id: 'org4', name: 'Arjun Nair', email: 'arjun@blueocean.org', password: 'password123',
        role: 'ngo', organization_name: 'BlueOcean NGO',
        verification_status: 'verified', created_at: '2024-05-12',
    },
    {
        id: 'org5', name: 'Neha Kapoor', email: 'neha@edurise.org', password: 'password123',
        role: 'ngo', organization_name: 'EduRise Foundation',
        verification_status: 'pending', created_at: '2024-08-18',
    },
    {
        id: 'org6', name: 'Ramesh Yadav', email: 'ramesh@agrosustain.org', password: 'password123',
        role: 'ngo', organization_name: 'AgroSustain India',
        verification_status: 'verified', created_at: '2024-01-28',
    },
    {
        id: 'corp2', name: 'Sunita Reddy', email: 'sunita@infoway.com', password: 'password123',
        role: 'corporate', organization_name: 'InfoWay Solutions CSR',
        verification_status: 'verified', created_at: '2024-04-15',
    },
    {
        id: 'corp3', name: 'Amit Joshi', email: 'amit@reliancefdn.org', password: 'password123',
        role: 'corporate', organization_name: 'Reliance Foundation CSR',
        verification_status: 'verified', created_at: '2023-09-01',
    },
    {
        id: 'corp4', name: 'Deepa Menon', email: 'deepa@tatacsr.org', password: 'password123',
        role: 'corporate', organization_name: 'Tata Trusts CSR',
        verification_status: 'verified', created_at: '2023-06-20',
    },
    {
        id: 'ngo7', name: 'Farhan Sheikh', email: 'farhan@safewater.org', password: 'password123',
        role: 'ngo', organization_name: 'SafeWater Initiative',
        verification_status: 'pending', created_at: '2024-10-01',
    },
    {
        id: 'ngo8', name: 'Lakshmi Iyer', email: 'lakshmi@ruraltech.org', password: 'password123',
        role: 'ngo', organization_name: 'RuralTech Connect',
        verification_status: 'verified', created_at: '2024-03-22',
    },
];

// ---------- MOCK PROJECTS ----------
export const MOCK_PROJECTS: Project[] = [
    {
        id: 'p1', title: 'Clean Water for Rural Maharashtra',
        description: 'Installing water purification systems in 50 villages across drought-prone regions of Maharashtra to provide clean drinking water to over 25,000 people.',
        organization_id: 'u1', organization_name: 'GreenFuture Foundation',
        budget: 2500000, spent: 1800000,
        location: { lat: 19.076, lng: 72.877, name: 'Maharashtra' },
        timeline: { start: '2024-03-01', end: '2025-03-01' },
        beneficiary_count: 25000, sdg_tags: [6, 3, 1],
        sdg_reasoning: 'Water purification (SDG 6), health improvement (SDG 3), poverty alleviation (SDG 1)',
        status: 'active', created_at: '2024-03-01', impact_score: 847,
    },
    {
        id: 'p2', title: 'Solar Schools Initiative',
        description: 'Installing solar panels in 100 government schools across Rajasthan, providing clean energy and digital learning tools.',
        organization_id: 'u1', organization_name: 'GreenFuture Foundation',
        budget: 5000000, spent: 3200000,
        location: { lat: 26.912, lng: 75.787, name: 'Rajasthan' },
        timeline: { start: '2024-06-01', end: '2025-12-01' },
        beneficiary_count: 50000, sdg_tags: [7, 4, 13],
        sdg_reasoning: 'Clean energy (SDG 7), quality education (SDG 4), climate action (SDG 13)',
        status: 'active', created_at: '2024-06-01', impact_score: 912,
    },
    {
        id: 'p3', title: 'Women Skill Development Program',
        description: 'Training 5,000 women in digital skills and entrepreneurship across Bihar and UP.',
        organization_id: 'u1', organization_name: 'GreenFuture Foundation',
        budget: 1800000, spent: 900000,
        location: { lat: 25.594, lng: 85.137, name: 'Bihar' },
        timeline: { start: '2024-09-01', end: '2025-09-01' },
        beneficiary_count: 5000, sdg_tags: [5, 8, 4],
        sdg_reasoning: 'Gender equality (SDG 5), decent work (SDG 8), education (SDG 4)',
        status: 'active', created_at: '2024-09-01', impact_score: 765,
    },
    {
        id: 'p4', title: 'Urban Waste Management System',
        description: 'Building smart waste segregation and recycling infrastructure in 20 wards of Bengaluru.',
        organization_id: 'org2', organization_name: 'EcoIndia Trust',
        budget: 4200000, spent: 2100000,
        location: { lat: 12.971, lng: 77.594, name: 'Karnataka' },
        timeline: { start: '2024-04-01', end: '2025-04-01' },
        beneficiary_count: 120000, sdg_tags: [11, 12, 13],
        sdg_reasoning: 'Sustainable cities (SDG 11), responsible consumption (SDG 12), climate (SDG 13)',
        status: 'active', created_at: '2024-04-01', impact_score: 890,
    },
    {
        id: 'p5', title: 'Tribal Healthcare Access Program',
        description: 'Deploying mobile health clinics across 80 tribal villages in Odisha and Jharkhand.',
        organization_id: 'org3', organization_name: 'HealthBridge India',
        budget: 3500000, spent: 2800000,
        location: { lat: 20.940, lng: 84.803, name: 'Odisha' },
        timeline: { start: '2024-01-01', end: '2025-06-01' },
        beneficiary_count: 35000, sdg_tags: [3, 1, 10],
        sdg_reasoning: 'Health (SDG 3), poverty (SDG 1), reduced inequalities (SDG 10)',
        status: 'active', created_at: '2024-01-01', impact_score: 935,
    },
    {
        id: 'p6', title: 'Ocean Plastic Cleanup Drive',
        description: 'Coastal cleanup and fishermen community awareness on marine ecosystem conservation in Kerala.',
        organization_id: 'org4', organization_name: 'BlueOcean NGO',
        budget: 1200000, spent: 800000,
        location: { lat: 9.931, lng: 76.267, name: 'Kerala' },
        timeline: { start: '2024-07-01', end: '2025-01-01' },
        beneficiary_count: 15000, sdg_tags: [14, 12, 13],
        sdg_reasoning: 'Life below water (SDG 14), responsible consumption (SDG 12), climate (SDG 13)',
        status: 'completed', created_at: '2024-07-01', impact_score: 802,
    },
    {
        id: 'p7', title: 'Digital Classrooms for Delhi Slums',
        description: 'Setting up 50 digital learning centers in Delhi slums with tablets and internet.',
        organization_id: 'org5', organization_name: 'EduRise Foundation',
        budget: 2200000, spent: 1100000,
        location: { lat: 28.613, lng: 77.229, name: 'Delhi' },
        timeline: { start: '2024-08-01', end: '2025-08-01' },
        beneficiary_count: 12000, sdg_tags: [4, 10, 9],
        sdg_reasoning: 'Education (SDG 4), reduced inequalities (SDG 10), innovation (SDG 9)',
        status: 'active', created_at: '2024-08-01', impact_score: 768,
    },
    {
        id: 'p8', title: 'Organic Farming Revolution',
        description: 'Training 3,000 farmers in organic methods and marketplace access in MP.',
        organization_id: 'org6', organization_name: 'AgroSustain India',
        budget: 3100000, spent: 1900000,
        location: { lat: 23.259, lng: 77.412, name: 'Madhya Pradesh' },
        timeline: { start: '2024-02-01', end: '2025-06-01' },
        beneficiary_count: 18000, sdg_tags: [2, 1, 15],
        sdg_reasoning: 'Zero hunger (SDG 2), no poverty (SDG 1), life on land (SDG 15)',
        status: 'active', created_at: '2024-02-01', impact_score: 812,
    },
    {
        id: 'p9', title: 'TechServe Employee Volunteer Program',
        description: 'Corporate volunteering — engineering teams mentor rural students.',
        organization_id: 'u3', organization_name: 'TechServe India CSR',
        budget: 1500000, spent: 950000,
        location: { lat: 17.385, lng: 78.486, name: 'Telangana' },
        timeline: { start: '2024-05-01', end: '2025-05-01' },
        beneficiary_count: 8000, sdg_tags: [4, 8, 17],
        sdg_reasoning: 'Education (SDG 4), decent work (SDG 8), partnerships (SDG 17)',
        status: 'active', created_at: '2024-05-01', impact_score: 780,
    },
    {
        id: 'p10', title: 'InfoWay Rural Internet Project',
        description: 'Bringing broadband connectivity to 100 villages across Gujarat.',
        organization_id: 'corp2', organization_name: 'InfoWay Solutions CSR',
        budget: 8500000, spent: 4200000,
        location: { lat: 22.258, lng: 71.192, name: 'Gujarat' },
        timeline: { start: '2024-01-15', end: '2025-12-01' },
        beneficiary_count: 95000, sdg_tags: [9, 4, 8],
        sdg_reasoning: 'Innovation (SDG 9), education (SDG 4), economic growth (SDG 8)',
        status: 'active', created_at: '2024-01-15', impact_score: 875,
    },
    {
        id: 'p11', title: 'Reliance Clean Energy Villages',
        description: 'Installing solar microgrids in 200 off-grid villages across Rajasthan and MP.',
        organization_id: 'corp3', organization_name: 'Reliance Foundation CSR',
        budget: 15000000, spent: 9800000,
        location: { lat: 26.912, lng: 75.787, name: 'Rajasthan' },
        timeline: { start: '2023-10-01', end: '2025-10-01' },
        beneficiary_count: 250000, sdg_tags: [7, 13, 1],
        sdg_reasoning: 'Clean energy (SDG 7), climate action (SDG 13), no poverty (SDG 1)',
        status: 'active', created_at: '2023-10-01', impact_score: 945,
    },
    {
        id: 'p12', title: 'Tata Rural Healthcare Network',
        description: 'Building 40 primary health centres in tribal areas of Jharkhand and Chhattisgarh.',
        organization_id: 'corp4', organization_name: 'Tata Trusts CSR',
        budget: 12000000, spent: 7500000,
        location: { lat: 23.610, lng: 85.279, name: 'Jharkhand' },
        timeline: { start: '2023-07-01', end: '2025-07-01' },
        beneficiary_count: 180000, sdg_tags: [3, 1, 10],
        sdg_reasoning: 'Health (SDG 3), poverty (SDG 1), inequalities (SDG 10)',
        status: 'active', created_at: '2023-07-01', impact_score: 920,
    },
    {
        id: 'p13', title: 'SafeWater Bore Well Program',
        description: 'Drilling 500 bore wells with filtration systems across drought-prone Bundelkhand.',
        organization_id: 'ngo7', organization_name: 'SafeWater Initiative',
        budget: 4500000, spent: 1200000,
        location: { lat: 25.431, lng: 80.337, name: 'Uttar Pradesh' },
        timeline: { start: '2024-10-01', end: '2026-03-01' },
        beneficiary_count: 75000, sdg_tags: [6, 3, 1],
        sdg_reasoning: 'Water (SDG 6), health (SDG 3), poverty (SDG 1)',
        status: 'active', created_at: '2024-10-01', impact_score: 710,
    },
    {
        id: 'p14', title: 'RuralTech Digital Literacy Mission',
        description: 'Training 10,000 rural youth in coding and digital skills across Tamil Nadu.',
        organization_id: 'ngo8', organization_name: 'RuralTech Connect',
        budget: 3800000, spent: 2400000,
        location: { lat: 11.127, lng: 78.656, name: 'Tamil Nadu' },
        timeline: { start: '2024-04-01', end: '2025-09-01' },
        beneficiary_count: 10000, sdg_tags: [4, 8, 9],
        sdg_reasoning: 'Education (SDG 4), decent work (SDG 8), innovation (SDG 9)',
        status: 'active', created_at: '2024-04-01', impact_score: 838,
    },
];

// ---------- MOCK ACTIVITIES ----------
export const MOCK_ACTIVITIES: Activity[] = [
    {
        id: 'a1', project_id: 'p1', project_title: 'Clean Water for Rural Maharashtra',
        description: 'Installed 12 water purification units in Nashik district',
        timestamp: '2024-11-15T10:30:00Z',
        hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
        location: 'Nashik, Maharashtra', verified: true,
    },
    {
        id: 'a2', project_id: 'p1', project_title: 'Clean Water for Rural Maharashtra',
        description: 'Water quality testing completed — 98.5% purity achieved',
        timestamp: '2024-12-01T14:15:00Z',
        hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
        location: 'Nashik, Maharashtra', verified: true,
    },
    {
        id: 'a3', project_id: 'p2', project_title: 'Solar Schools Initiative',
        description: 'Solar panel installation completed in 35 schools, Jaipur district',
        timestamp: '2024-10-20T09:00:00Z',
        hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
        location: 'Jaipur, Rajasthan', verified: true,
    },
    {
        id: 'a4', project_id: 'p3', project_title: 'Women Skill Development Program',
        description: 'First batch of 500 women completed digital literacy training',
        timestamp: '2024-12-15T11:45:00Z',
        hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
        location: 'Patna, Bihar', verified: true,
    },
    {
        id: 'a5', project_id: 'p4', project_title: 'Urban Waste Management System',
        description: 'Deployed 200 smart waste bins with IoT sensors in 8 wards',
        timestamp: '2024-11-28T16:20:00Z',
        hash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
        location: 'Bengaluru, Karnataka', verified: true,
    },
    {
        id: 'a6', project_id: 'p5', project_title: 'Tribal Healthcare Access Program',
        description: 'Mobile clinic conducted 3,200 health screenings in tribal areas',
        timestamp: '2025-01-10T08:30:00Z',
        hash: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
        location: 'Koraput, Odisha', verified: true,
    },
    {
        id: 'a7', project_id: 'p5', project_title: 'Tribal Healthcare Access Program',
        description: 'Vaccination drive completed — 8,500 children vaccinated',
        timestamp: '2025-02-05T13:00:00Z',
        hash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
        location: 'Ranchi, Jharkhand', verified: false,
    },
    {
        id: 'a8', project_id: 'p7', project_title: 'Digital Classrooms for Delhi Slums',
        description: 'Setup 15 digital learning centers with 300 tablets in Nehru Nagar',
        timestamp: '2024-12-20T10:00:00Z',
        hash: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
        location: 'Nehru Nagar, Delhi', verified: true,
    },
    {
        id: 'a9', project_id: 'p8', project_title: 'Organic Farming Revolution',
        description: 'Trained 800 farmers in composting and organic certification process',
        timestamp: '2024-11-05T09:30:00Z',
        hash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
        location: 'Indore, Madhya Pradesh', verified: true,
    },
    {
        id: 'a10', project_id: 'p9', project_title: 'TechServe Employee Volunteer Program',
        description: '120 engineers mentored 500 students across 10 rural schools',
        timestamp: '2024-10-15T14:00:00Z',
        hash: 'd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1',
        location: 'Hyderabad, Telangana', verified: true,
    },
    {
        id: 'a11', project_id: 'p10', project_title: 'InfoWay Rural Internet Project',
        description: 'Installed fibre optic backbone in 40 villages, 35,000 people connected',
        timestamp: '2025-01-20T11:00:00Z',
        hash: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
        location: 'Kutch, Gujarat', verified: true,
    },
    {
        id: 'a12', project_id: 'p11', project_title: 'Reliance Clean Energy Villages',
        description: 'Solar microgrids installed in 85 villages, powering 12,000 homes',
        timestamp: '2025-01-05T08:00:00Z',
        hash: 'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
        location: 'Jodhpur, Rajasthan', verified: true,
    },
    {
        id: 'a13', project_id: 'p12', project_title: 'Tata Rural Healthcare Network',
        description: 'Completed 18 primary health centres, 45,000 patients treated',
        timestamp: '2025-02-10T09:45:00Z',
        hash: 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
        location: 'Ranchi, Jharkhand', verified: true,
    },
    {
        id: 'a14', project_id: 'p13', project_title: 'SafeWater Bore Well Program',
        description: 'Drilled 120 bore wells in Banda district, water tested and approved',
        timestamp: '2025-01-25T10:30:00Z',
        hash: 'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
        location: 'Banda, Uttar Pradesh', verified: false,
    },
    {
        id: 'a15', project_id: 'p14', project_title: 'RuralTech Digital Literacy Mission',
        description: 'Batch 1 completed — 2,500 youth certified in basic coding',
        timestamp: '2024-12-10T15:00:00Z',
        hash: 'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
        location: 'Coimbatore, Tamil Nadu', verified: true,
    },
];

// ---------- MOCK DONATIONS ----------
export const MOCK_DONATIONS: Donation[] = [
    { id: 'd1', donor_id: 'u4', donor_name: 'Vikram Patel', project_id: 'p1', project_title: 'Clean Water for Rural Maharashtra', amount: 50000, sdg_tags: [6, 3], timestamp: '2024-06-15' },
    { id: 'd2', donor_id: 'u4', donor_name: 'Vikram Patel', project_id: 'p2', project_title: 'Solar Schools Initiative', amount: 100000, sdg_tags: [7, 4], timestamp: '2024-08-20' },
    { id: 'd3', donor_id: 'u4', donor_name: 'Vikram Patel', project_id: 'p5', project_title: 'Tribal Healthcare Access Program', amount: 75000, sdg_tags: [3, 1], timestamp: '2024-10-10' },
    { id: 'd4', donor_id: 'u4', donor_name: 'Vikram Patel', project_id: 'p3', project_title: 'Women Skill Development Program', amount: 25000, sdg_tags: [5, 8], timestamp: '2024-12-01' },
    { id: 'd5', donor_id: 'donor2', donor_name: 'Meera Gupta', project_id: 'p1', project_title: 'Clean Water for Rural Maharashtra', amount: 200000, sdg_tags: [6, 3], timestamp: '2024-07-08' },
    { id: 'd6', donor_id: 'donor3', donor_name: 'Arjun Singh', project_id: 'p4', project_title: 'Urban Waste Management System', amount: 150000, sdg_tags: [11, 12], timestamp: '2024-09-15' },
    { id: 'd7', donor_id: 'u4', donor_name: 'Vikram Patel', project_id: 'p7', project_title: 'Digital Classrooms for Delhi Slums', amount: 80000, sdg_tags: [4, 10], timestamp: '2024-11-15' },
    { id: 'd8', donor_id: 'donor2', donor_name: 'Meera Gupta', project_id: 'p8', project_title: 'Organic Farming Revolution', amount: 120000, sdg_tags: [2, 1], timestamp: '2024-10-01' },
    { id: 'd9', donor_id: 'donor3', donor_name: 'Arjun Singh', project_id: 'p12', project_title: 'Tata Rural Healthcare Network', amount: 500000, sdg_tags: [3, 1], timestamp: '2024-12-20' },
    { id: 'd10', donor_id: 'u4', donor_name: 'Vikram Patel', project_id: 'p14', project_title: 'RuralTech Digital Literacy Mission', amount: 60000, sdg_tags: [4, 8], timestamp: '2025-01-05' },
    { id: 'd11', donor_id: 'donor4', donor_name: 'Sneha Iyer', project_id: 'p11', project_title: 'Reliance Clean Energy Villages', amount: 300000, sdg_tags: [7, 13], timestamp: '2024-11-28' },
    { id: 'd12', donor_id: 'donor5', donor_name: 'Rahul Kapoor', project_id: 'p13', project_title: 'SafeWater Bore Well Program', amount: 175000, sdg_tags: [6, 3], timestamp: '2025-02-01' },
    { id: 'd13', donor_id: 'donor2', donor_name: 'Meera Gupta', project_id: 'p10', project_title: 'InfoWay Rural Internet Project', amount: 250000, sdg_tags: [9, 4], timestamp: '2024-09-30' },
];

// ---------- MOCK IMPACT SCORES ----------
export const MOCK_IMPACT_SCORES: ImpactScore[] = [
    {
        organization_id: 'u1', overall_score: 847,
        beneficiary_scale: 88, outcome_score: 85, geographic_need: 82,
        funding_efficiency: 79, verification_score: 92,
        sdg_breakdown: [
            { sdg: 1, score: 720 }, { sdg: 3, score: 810 }, { sdg: 4, score: 780 },
            { sdg: 5, score: 690 }, { sdg: 6, score: 920 }, { sdg: 7, score: 850 },
            { sdg: 8, score: 640 }, { sdg: 13, score: 780 },
        ],
    },
    {
        organization_id: 'org2', overall_score: 890,
        beneficiary_scale: 95, outcome_score: 88, geographic_need: 78,
        funding_efficiency: 91, verification_score: 85,
        sdg_breakdown: [
            { sdg: 11, score: 910 }, { sdg: 12, score: 870 }, { sdg: 13, score: 840 },
        ],
    },
    {
        organization_id: 'org3', overall_score: 935,
        beneficiary_scale: 92, outcome_score: 96, geographic_need: 94,
        funding_efficiency: 88, verification_score: 95,
        sdg_breakdown: [
            { sdg: 1, score: 880 }, { sdg: 3, score: 960 }, { sdg: 10, score: 900 },
        ],
    },
];

// ---------- PARTNER NGOs FOR MATCHING ----------
export interface PartnerNGO {
    id: string;
    name: string;
    sdg_focus: number[];
    location: { lat: number; lng: number; state: string };
    impact_score: number;
    funding_need: number;
    projects_count: number;
    beneficiaries: number;
    verified: boolean;
}

export const MOCK_PARTNER_NGOS: PartnerNGO[] = [
    { id: 'u1', name: 'GreenFuture Foundation', sdg_focus: [6, 3, 7, 4], location: { lat: 19.076, lng: 72.877, state: 'Maharashtra' }, impact_score: 847, funding_need: 3500000, projects_count: 3, beneficiaries: 80000, verified: true },
    { id: 'org2', name: 'EcoIndia Trust', sdg_focus: [11, 12, 13], location: { lat: 12.971, lng: 77.594, state: 'Karnataka' }, impact_score: 890, funding_need: 2100000, projects_count: 1, beneficiaries: 120000, verified: true },
    { id: 'org3', name: 'HealthBridge India', sdg_focus: [3, 1, 10], location: { lat: 20.940, lng: 84.803, state: 'Odisha' }, impact_score: 935, funding_need: 700000, projects_count: 1, beneficiaries: 35000, verified: true },
    { id: 'org4', name: 'BlueOcean NGO', sdg_focus: [14, 12, 13], location: { lat: 9.931, lng: 76.267, state: 'Kerala' }, impact_score: 802, funding_need: 400000, projects_count: 1, beneficiaries: 15000, verified: true },
    { id: 'org5', name: 'EduRise Foundation', sdg_focus: [4, 5, 8], location: { lat: 28.613, lng: 77.229, state: 'Delhi' }, impact_score: 768, funding_need: 1500000, projects_count: 2, beneficiaries: 20000, verified: true },
    { id: 'org6', name: 'AgroSustain India', sdg_focus: [2, 1, 15], location: { lat: 23.259, lng: 77.412, state: 'Madhya Pradesh' }, impact_score: 812, funding_need: 2800000, projects_count: 2, beneficiaries: 45000, verified: true },
];

// ---------- HEATMAP DATA ----------
export interface RegionData {
    name: string;
    lat: number;
    lng: number;
    funding: number;
    ngo_count: number;
    primary_sdgs: number[];
    projects: number;
    beneficiaries: number;
}

export const MOCK_REGIONS: RegionData[] = [
    { name: 'Maharashtra', lat: 19.663, lng: 75.300, funding: 8500000, ngo_count: 24, primary_sdgs: [6, 3, 1], projects: 12, beneficiaries: 185000 },
    { name: 'Rajasthan', lat: 27.023, lng: 74.217, funding: 5200000, ngo_count: 15, primary_sdgs: [7, 4, 13], projects: 8, beneficiaries: 92000 },
    { name: 'Bihar', lat: 25.094, lng: 85.313, funding: 2100000, ngo_count: 8, primary_sdgs: [5, 8, 4, 1], projects: 5, beneficiaries: 45000 },
    { name: 'Karnataka', lat: 15.317, lng: 75.713, funding: 6800000, ngo_count: 19, primary_sdgs: [11, 12, 13], projects: 10, beneficiaries: 210000 },
    { name: 'Odisha', lat: 20.940, lng: 84.803, funding: 3500000, ngo_count: 11, primary_sdgs: [3, 1, 10], projects: 7, beneficiaries: 68000 },
    { name: 'Kerala', lat: 10.850, lng: 76.271, funding: 4100000, ngo_count: 14, primary_sdgs: [14, 12, 3], projects: 9, beneficiaries: 125000 },
    { name: 'Tamil Nadu', lat: 11.127, lng: 78.656, funding: 7200000, ngo_count: 22, primary_sdgs: [4, 3, 7], projects: 11, beneficiaries: 178000 },
    { name: 'Uttar Pradesh', lat: 26.846, lng: 80.946, funding: 3800000, ngo_count: 9, primary_sdgs: [1, 5, 4], projects: 6, beneficiaries: 55000 },
    { name: 'Gujarat', lat: 22.258, lng: 71.192, funding: 6100000, ngo_count: 17, primary_sdgs: [8, 9, 7], projects: 9, beneficiaries: 142000 },
    { name: 'Madhya Pradesh', lat: 23.473, lng: 77.947, funding: 2800000, ngo_count: 7, primary_sdgs: [2, 1, 15], projects: 4, beneficiaries: 38000 },
    { name: 'West Bengal', lat: 22.986, lng: 87.855, funding: 4500000, ngo_count: 13, primary_sdgs: [3, 4, 1], projects: 8, beneficiaries: 98000 },
    { name: 'Delhi', lat: 28.704, lng: 77.102, funding: 9200000, ngo_count: 32, primary_sdgs: [11, 4, 13], projects: 15, beneficiaries: 245000 },
    { name: 'Punjab', lat: 31.147, lng: 75.341, funding: 3200000, ngo_count: 10, primary_sdgs: [2, 6, 3], projects: 5, beneficiaries: 52000 },
    { name: 'Jharkhand', lat: 23.610, lng: 85.279, funding: 1900000, ngo_count: 6, primary_sdgs: [1, 3, 10], projects: 3, beneficiaries: 28000 },
    { name: 'Telangana', lat: 18.112, lng: 79.019, funding: 5600000, ngo_count: 16, primary_sdgs: [9, 8, 4], projects: 8, beneficiaries: 135000 },
    { name: 'Assam', lat: 26.200, lng: 92.937, funding: 1500000, ngo_count: 5, primary_sdgs: [6, 1, 15], projects: 3, beneficiaries: 22000 },
];

// ---------- GOVERNMENT ANALYTICS DATA ----------
export const GOV_FUNDING_GAP = [
    { sdg: 'SDG 1', required: 120, allocated: 85 },
    { sdg: 'SDG 2', required: 95, allocated: 45 },
    { sdg: 'SDG 3', required: 150, allocated: 110 },
    { sdg: 'SDG 4', required: 130, allocated: 100 },
    { sdg: 'SDG 5', required: 80, allocated: 35 },
    { sdg: 'SDG 6', required: 110, allocated: 70 },
    { sdg: 'SDG 7', required: 100, allocated: 65 },
    { sdg: 'SDG 8', required: 90, allocated: 60 },
    { sdg: 'SDG 9', required: 140, allocated: 90 },
    { sdg: 'SDG 10', required: 75, allocated: 30 },
    { sdg: 'SDG 11', required: 160, allocated: 120 },
    { sdg: 'SDG 13', required: 130, allocated: 55 },
    { sdg: 'SDG 14', required: 60, allocated: 25 },
    { sdg: 'SDG 15', required: 70, allocated: 30 },
];

export const GOV_RISK_TREND = [
    { month: 'Jul', risk: 32 },
    { month: 'Aug', risk: 28 },
    { month: 'Sep', risk: 35 },
    { month: 'Oct', risk: 42 },
    { month: 'Nov', risk: 38 },
    { month: 'Dec', risk: 45 },
    { month: 'Jan', risk: 52 },
    { month: 'Feb', risk: 48 },
];

export const UNDERFUNDED_ALERTS = [
    { region: 'Jharkhand', sdg: 'SDG 10', gap: '68%', severity: 'critical' as const },
    { region: 'Assam', sdg: 'SDG 6', gap: '55%', severity: 'high' as const },
    { region: 'Madhya Pradesh', sdg: 'SDG 2', gap: '52%', severity: 'high' as const },
    { region: 'Bihar', sdg: 'SDG 5', gap: '48%', severity: 'medium' as const },
    { region: 'Uttar Pradesh', sdg: 'SDG 1', gap: '43%', severity: 'medium' as const },
];
