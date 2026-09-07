declare module 'react-simple-maps' {
    import { ComponentType, SVGProps, ReactNode } from 'react';

    export interface ComposableMapProps extends SVGProps<SVGSVGElement> {
        projection?: string | (() => void);
        projectionConfig?: {
            scale?: number;
            center?: [number, number];
        };
        children?: ReactNode;
    }

    export const ComposableMap: ComponentType<ComposableMapProps>;

    export interface ZoomableGroupProps extends SVGProps<SVGGElement> {
        zoom?: number;
        minZoom?: number;
        maxZoom?: number;
        children?: ReactNode;
    }

    export const ZoomableGroup: ComponentType<ZoomableGroupProps>;

    export interface GeographiesProps {
        geography: string | Record<string, any>;
        children: (params: { geographies: any[] }) => ReactNode;
    }

    export const Geographies: ComponentType<GeographiesProps>;

    export interface GeographyProps extends SVGProps<SVGPathElement> {
        geography: any;
        style?: {
            default?: SVGProps<SVGPathElement>;
            hover?: SVGProps<SVGPathElement>;
            pressed?: SVGProps<SVGPathElement>;
        };
    }

    export const Geography: ComponentType<GeographyProps>;
}
