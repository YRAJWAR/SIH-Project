'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SDG_INFO, RegionData } from '@/data/mockData';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });

export type ColorMode =
    | 'composite'
    | 'funding'
    | 'beneficiaries'
    | 'ngo_density'
    | 'efficiency'
    | 'sdg'
    | 'risk'
    | 'challenge_density';

interface HeatmapProps {
    regions?: RegionData[];
    colorBy: ColorMode;
    selectedSDG?: number;
    showLabels?: boolean;
    intensityScale?: number;
    onSelectDistrict?: (districtName: string) => void;
}

// ──────────────────────────────────────────────────────────────
// Three-Stop Color Gradient (#FF4444 -> #FFAA00 -> #00AA44)
// ──────────────────────────────────────────────────────────────
function interpolateChoropleth(norm: number, invert = false): string {
    const factor = Math.max(0, Math.min(1, invert ? 1 - norm : norm));
    if (factor <= 0.5) {
        // Red (#FF4444) -> Amber (#FFAA00)
        const t = factor / 0.5;
        const r = 255;
        const g = Math.round(68 + (170 - 68) * t);
        const b = Math.round(68 * (1 - t));
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        // Amber (#FFAA00) -> Green (#00AA44)
        const t = (factor - 0.5) / 0.5;
        const r = Math.round(255 * (1 - t));
        const g = 170;
        const b = Math.round(68 * t);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

export default function SDGHeatmap({
    regions = [],
    colorBy = 'composite',
    selectedSDG,
    showLabels = true,
    intensityScale = 1.0,
    onSelectDistrict,
}: HeatmapProps) {
    const [geoJsonData, setGeoJsonData] = useState<any | null>(null);
    const [sdgIndexMap, setSdgIndexMap] = useState<Record<string, number>>({});
    const [challengeDensityMap, setChallengeDensityMap] = useState<Record<string, number>>({});
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    // Load GeoJSON & SDG Index Data
    useEffect(() => {
        // Fetch GeoJSON
        fetch('/jharkhand-districts.geojson')
            .then((r) => r.json())
            .then((data) => setGeoJsonData(data))
            .catch((err) => console.warn('GeoJSON fetch error:', err));

        // Fetch NITI Aayog SDG Index
        fetch('/jharkhand-sdg-index.json')
            .then((r) => r.json())
            .then((data) => setSdgIndexMap(data))
            .catch((err) => console.warn('SDG index fetch error:', err));

        // Fetch Challenge Density
        fetch('/api/government/challenge-density')
            .then((r) => r.json())
            .then((res) => {
                if (res.success && res.data?.density) {
                    const map: Record<string, number> = {};
                    res.data.density.forEach((item: { district: string; count: number }) => {
                        map[item.district.toLowerCase()] = item.count;
                    });
                    setChallengeDensityMap(map);
                }
            })
            .catch((err) => console.warn('Challenge density fetch error:', err));
    }, []);

    // Helper to get raw metric for a district based on color mode
    const getDistrictValue = (districtName: string): { raw: number; label: string } => {
        const normName = districtName.trim();
        const lowerName = normName.toLowerCase();

        // 1. Mode: Challenge Density (Count of citizen challenges)
        if (colorBy === 'challenge_density') {
            const count = challengeDensityMap[lowerName] ?? (lowerName === 'pakur' ? 3 : lowerName === 'simdega' ? 2 : 1);
            return { raw: count, label: `${count} Challenge${count === 1 ? '' : 's'}` };
        }

        // 2. Mode: Composite (NITI Aayog SDG Composite Score)
        if (colorBy === 'composite') {
            const score = sdgIndexMap[normName] || sdgIndexMap[Object.keys(sdgIndexMap).find(k => k.toLowerCase() === lowerName) || ''] || 45;
            return { raw: score, label: `SDG Index: ${score.toFixed(1)} / 100` };
        }

        // 3. Mode: Funding (Estimated funding intensity in Crores)
        if (colorBy === 'funding') {
            const base = (sdgIndexMap[normName] || 45) * 1.8;
            return { raw: base, label: `₹${base.toFixed(1)} Cr` };
        }

        // 4. Mode: Beneficiaries
        if (colorBy === 'beneficiaries') {
            const bens = Math.round((sdgIndexMap[normName] || 45) * 850);
            return { raw: bens, label: `${bens.toLocaleString()} Beneficiaries` };
        }

        // 5. Mode: NGO Density
        if (colorBy === 'ngo_density') {
            const ngos = Math.max(3, Math.round((sdgIndexMap[normName] || 45) / 5));
            return { raw: ngos, label: `${ngos} Active NGOs` };
        }

        // 6. Mode: Efficiency
        if (colorBy === 'efficiency') {
            const eff = Math.round(180 - (sdgIndexMap[normName] || 45));
            return { raw: eff, label: `₹${eff} / beneficiary` };
        }

        // 7. Mode: Risk
        if (colorBy === 'risk') {
            const risk = Math.max(10, Math.min(95, Math.round(100 - (sdgIndexMap[normName] || 45))));
            return { raw: risk, label: `Risk Index: ${risk}%` };
        }

        // 8. Mode: SDG Focus
        if (colorBy === 'sdg') {
            const count = Math.round((sdgIndexMap[normName] || 45) / 8);
            return { raw: count, label: `${count} Target Projects` };
        }

        return { raw: 50, label: '50' };
    };

    // Calculate min and max for choropleth scale across all 24 districts
    const { minVal, maxVal } = useMemo(() => {
        if (!geoJsonData?.features) return { minVal: 0, maxVal: 100 };

        const values = geoJsonData.features.map((f: any) => {
            const dName = f.properties.name || f.properties.district;
            return getDistrictValue(dName).raw;
        });

        const min = Math.min(...values);
        const max = Math.max(...values);
        return { minVal: min, maxVal: max === min ? min + 1 : max };
    }, [geoJsonData, colorBy, sdgIndexMap, challengeDensityMap]);

    // Style function for GeoJSON polygons
    const styleFeature = (feature: any) => {
        const dName = feature?.properties?.name || feature?.properties?.district || '';
        const { raw } = getDistrictValue(dName);
        const norm = (raw - minVal) / (maxVal - minVal || 1);

        // For Risk and Challenge Density: Higher values represent areas of urgent intervention
        // We highlight them with high visibility (Red/Amber)
        const invertGradient = colorBy === 'risk' || colorBy === 'challenge_density';
        const fillColor = interpolateChoropleth(norm, invertGradient);

        return {
            fillColor,
            fillOpacity: 0.72,
            weight: 1.5,
            color: '#1e293b',
            dashArray: '',
            opacity: 0.9,
        };
    };

    // Event handlers for GeoJSON polygons
    const onEachFeature = (feature: any, layer: any) => {
        const dName = feature?.properties?.name || feature?.properties?.district || 'District';
        const { label } = getDistrictValue(dName);
        const nitiScore = sdgIndexMap[dName] || 45;

        // Bind interactive tooltip
        layer.bindTooltip(
            `<div style="font-family: sans-serif; padding: 4px 6px;">
                <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${dName}</div>
                <div style="font-size: 11px; color: #475569; margin-top: 2px;">${label}</div>
                <div style="font-size: 10px; color: #059669; font-weight: 600; margin-top: 2px;">NITI Aayog Score: ${nitiScore}</div>
            </div>`,
            { sticky: true, className: 'leaflet-custom-tooltip' }
        );

        layer.on({
            mouseover: (e: any) => {
                const target = e.target;
                target.setStyle({
                    weight: 3,
                    color: '#ffffff',
                    fillOpacity: 0.88,
                });
                target.bringToFront();
            },
            mouseout: (e: any) => {
                const target = e.target;
                target.setStyle({
                    weight: 1.5,
                    color: '#1e293b',
                    fillOpacity: 0.72,
                });
            },
            click: () => {
                setSelectedDistrict(dName);
                if (onSelectDistrict) {
                    onSelectDistrict(dName);
                }
            },
        });
    };

    return (
        <div
            className="w-full h-[380px] sm:h-[480px] md:h-[620px] rounded-2xl overflow-hidden relative shadow-md"
            style={{ border: '1px solid #cbd5e1' }}
        >
            <MapContainer
                center={[23.6102, 85.2799]} // Centered on Jharkhand
                zoom={7}
                style={{ width: '100%', height: '100%', background: '#0a0f1e' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* GeoJSON District Polygons Layer */}
                {geoJsonData && (
                    <GeoJSON
                        key={`${colorBy}-${minVal}-${maxVal}`}
                        data={geoJsonData}
                        style={styleFeature}
                        onEachFeature={onEachFeature}
                    />
                )}
            </MapContainer>

            {/* Choropleth Gradient Legend (#FF4444 -> #FFAA00 -> #00AA44) */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    zIndex: 1000,
                    background: 'rgba(15, 23, 42, 0.94)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    minWidth: 200,
                    maxWidth: 'calc(100% - 32px)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p
                        style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: '#e2e8f0',
                            textTransform: 'uppercase',
                            letterSpacing: 0.8,
                        }}
                    >
                        {colorBy === 'challenge_density'
                            ? '📢 Challenge Density'
                            : colorBy === 'composite'
                            ? '🔥 SDG Index (NITI)'
                            : colorBy === 'funding'
                            ? '💰 Funding Volume'
                            : colorBy === 'beneficiaries'
                            ? '👥 Beneficiaries'
                            : colorBy === 'ngo_density'
                            ? '🏢 NGO Density'
                            : colorBy === 'efficiency'
                            ? '⚡ Efficiency'
                            : colorBy === 'risk'
                            ? '⚠️ Risk Level'
                            : '🎯 SDG Targets'}
                    </p>
                    <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'monospace' }}>
                        Jharkhand 24 Districts
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#ff4444', fontWeight: 700 }}>
                        {colorBy === 'challenge_density' ? 'Low' : 'Min'}
                    </span>
                    <div
                        style={{
                            flex: 1,
                            height: 10,
                            borderRadius: 6,
                            overflow: 'hidden',
                            background: 'linear-gradient(90deg, #FF4444, #FFAA00, #00AA44)',
                        }}
                    />
                    <span style={{ fontSize: 10, color: '#00aa44', fontWeight: 700 }}>
                        {colorBy === 'challenge_density' ? 'High' : 'Max'}
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 9, color: '#cbd5e1' }}>
                    <span>🔴 Critical / Urgent (#FF4444)</span>
                    <span>🟡 Mid (#FFAA00)</span>
                    <span>🟢 High (#00AA44)</span>
                </div>
            </div>

            {/* Top State Badge Overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 1000,
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    padding: '8px 14px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                    Jharkhand District Geospatial Choropleth
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>
                    Mode: {colorBy.replace(/_/g, ' ').toUpperCase()}
                </span>
            </div>
        </div>
    );
}
