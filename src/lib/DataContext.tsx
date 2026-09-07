'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
    MOCK_PROJECTS, MOCK_ACTIVITIES, MOCK_DONATIONS, MOCK_IMPACT_SCORES, MOCK_PARTNER_NGOS, MOCK_REGIONS,
    type Project, type Activity, type Donation, type ImpactScore, type PartnerNGO, type RegionData,
} from '@/data/mockData';
import CryptoJS from 'crypto-js';

interface DataContextType {
    projects: Project[];
    activities: Activity[];
    donations: Donation[];
    impactScores: ImpactScore[];
    organizations: PartnerNGO[];
    regions: RegionData[];
    addProject: (project: Omit<Project, 'id' | 'created_at'>) => Project;
    addActivity: (activity: Omit<Activity, 'id' | 'hash'>) => Activity;
    addDonation: (donation: Omit<Donation, 'id'>) => void;
    getProjectsByOrg: (orgId: string) => Project[];
    getActivitiesByProject: (projectId: string) => Activity[];
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([...MOCK_PROJECTS]);
    const [activities, setActivities] = useState<Activity[]>([...MOCK_ACTIVITIES]);
    const [donations, setDonations] = useState<Donation[]>([...MOCK_DONATIONS]);
    const [impactScores] = useState<ImpactScore[]>([...MOCK_IMPACT_SCORES]);
    const [organizations] = useState<PartnerNGO[]>([...MOCK_PARTNER_NGOS]);
    const [regions] = useState<RegionData[]>([...MOCK_REGIONS]);

    const addProject = useCallback((projectData: Omit<Project, 'id' | 'created_at'>): Project => {
        const newProject: Project = {
            ...projectData,
            id: `p${Date.now()}`,
            created_at: new Date().toISOString().split('T')[0],
        };
        setProjects(prev => [newProject, ...prev]);
        return newProject;
    }, []);

    const addActivity = useCallback((activityData: Omit<Activity, 'id' | 'hash'>): Activity => {
        const hashInput = `${activityData.description}|${activityData.timestamp}|${activityData.location}|${activityData.project_id}`;
        const hash = CryptoJS.SHA256(hashInput).toString();
        const newActivity: Activity = {
            ...activityData,
            id: `a${Date.now()}`,
            hash,
        };
        setActivities(prev => [newActivity, ...prev]);
        return newActivity;
    }, []);

    const addDonation = useCallback((donationData: Omit<Donation, 'id'>) => {
        const newDonation: Donation = { ...donationData, id: `d${Date.now()}` };
        setDonations(prev => [newDonation, ...prev]);
    }, []);

    const getProjectsByOrg = useCallback((orgId: string) => {
        return projects.filter(p => p.organization_id === orgId);
    }, [projects]);

    const getActivitiesByProject = useCallback((projectId: string) => {
        return activities.filter(a => a.project_id === projectId);
    }, [activities]);

    return (
        <DataContext.Provider value={{
            projects, activities, donations, impactScores, organizations, regions,
            addProject, addActivity, addDonation, getProjectsByOrg, getActivitiesByProject,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData(): DataContextType {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within DataProvider');
    return ctx;
}
