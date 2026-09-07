'use client';

import { useMemo, useState } from 'react';
// @ts-ignore - react-simple-maps lacks complete type definitions in the registry
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { motion } from 'framer-motion';

// We use a lightweight world map or India map GeoJSON
// For this demo, we'll use a reliable India states topojson url from a popular CDN
const INDIA_TOPO_JSON = 'https://raw.githubusercontent.com/Anujarya300/bubble_maps/master/data/India/India_States.topojson';

interface MapData {
    state: string;
    total_funding: number;
    avg_score: number;
}

interface GeoImpactMapProps {
    data: MapData[];
}

export default function GeoImpactMap({ data }: GeoImpactMapProps) {
    const [tooltipContent, setTooltipContent] = useState('');
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Scale color based on average score (0 to 100)
    const colorScale = useMemo(() => {
        return scaleLinear<string>()
            .domain([0, 50, 100])
            .range(['#1e293b', '#3b82f6', '#10b981']); // Dark Slate -> Blue -> Emerald
    }, []);

    // Create a lookup map for instant state matching
    const dataMap = useMemo(() => {
        const map = new Map<string, MapData>();
        data.forEach(d => {
            // Normalize state names to match TopoJSON IDs
            const normalizedState = d.state.toLowerCase().replace(/ /g, '');
            map.set(normalizedState, d);
        });
        return map;
    }, [data]);

    return (
        <div className="relative w-full h-[500px] overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 850,
                    center: [80, 22] // Center of India
                }}
                className="w-full h-full"
            >
                <ZoomableGroup zoom={1} minZoom={1} maxZoom={4}>
                    <Geographies geography={INDIA_TOPO_JSON}>
                        {({ geographies }: { geographies: any[] }) =>
                            geographies.map((geo: any) => {
                                const stateName = geo.properties.name || geo.id;
                                const normalizedStateName = stateName.toLowerCase().replace(/ /g, '');
                                const stateData = dataMap.get(normalizedStateName);

                                const fill = stateData
                                    ? colorScale(stateData.avg_score)
                                    : '#1e293b'; // Default dark if no data

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={fill}
                                        stroke="#334155"
                                        strokeWidth={0.5}
                                        onMouseEnter={(e: any) => {
                                            if (stateData) {
                                                setTooltipContent(`${stateName}: ₹${(stateData.total_funding / 100000).toFixed(2)}L | Score: ${stateData.avg_score.toFixed(1)}`);
                                                setTooltipPosition({ x: e.clientX, y: e.clientY });
                                            } else {
                                                setTooltipContent(`${stateName}: No Data`);
                                                setTooltipPosition({ x: e.clientX, y: e.clientY });
                                            }
                                        }}
                                        onMouseMove={(e: any) => {
                                            setTooltipPosition({ x: e.clientX, y: e.clientY });
                                        }}
                                        onMouseLeave={() => {
                                            setTooltipContent('');
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            {/* Custom Tooltip */}
            {tooltipContent && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed z-50 px-4 py-2 text-sm font-medium text-white pointer-events-none bg-slate-800 border border-slate-700 rounded-lg shadow-xl"
                    style={{
                        left: tooltipPosition.x + 10,
                        top: tooltipPosition.y + 10,
                    }}
                >
                    {tooltipContent}
                </motion.div>
            )}

            {/* Legend Map Base Overlay */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-800 p-3 rounded-lg text-xs text-slate-400">
                <div className="font-semibold text-slate-200 mb-2">Impact Density</div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#1e293b]"></div> Low
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-4 h-4 rounded bg-[#3b82f6]"></div> Medium
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-4 h-4 rounded bg-[#10b981]"></div> High
                </div>
            </div>
        </div>
    );
}
