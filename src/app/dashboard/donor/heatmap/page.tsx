'use client';
import { useEffect, useState } from 'react';
import GeoImpactMap from '@/components/analytics/GeoImpactMap';

export default function DonorHeatmapPage() {
    const [geoImpact, setGeoImpact] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/donor/analytics/geo-impact')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setGeoImpact(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Personal Impact Map</h1>
                <p className="text-slate-500">A geographical visualization of where your funds have generated real-world impact across India.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm text-slate-500">Loading your impact footprint...</p>
                    </div>
                </div>
            ) : (
                <div className="glass-card p-6">
                    {geoImpact.length > 0 ? (
                        <GeoImpactMap data={geoImpact} />
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-10">No geographic data available yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}
