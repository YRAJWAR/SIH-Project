'use client';

import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';

class SplineErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Spline WebGL/WASM Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 bg-[#0a1122]">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                        3D Scene Unavailable
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function SplineScene({ scene }: { scene: string }) {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleSplineError = (e: any) => {
        console.error('Spline Runtime Error:', e);
        setError('Failed to load 3D scene');
    };

    if (error) {
        return (
            <div className="absolute inset-0 bg-[#0a1122]">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>
        );
    }

    if (!isMounted) return <div className="w-full h-full bg-[#0a0f1e]" />;

    return (
        <SplineErrorBoundary>
            <div className={`w-full h-full transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <Spline
                    scene={scene}
                    onLoad={() => setIsLoaded(true)}
                    onError={handleSplineError}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </SplineErrorBoundary>
    );
}
