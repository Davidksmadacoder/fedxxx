"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Polyline,
    Popup,
    useMap,
    CircleMarker,
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ------------------------------- Types ------------------------------- */
export type LocationPoint = {
    latitude: number;
    longitude: number;
    timestamp: string | Date;
    _id?: string;
    visible?: boolean;   // default: true (unless explicitly false)
    sendEmail?: boolean;
    sentEmail?: boolean;
};

type TrackingMapProps = {
    routes: LocationPoint[];
    center?: { lat: number; lng: number };
    showPolyline?: boolean;
    height?: number;            // px
    rounded?: boolean;
    tileUrl?: string;           // override tile provider if desired
    tileAttribution?: string;   // override attribution if desired
    showTiles?: boolean;        // allow turning tiles off entirely
};

/* ---------------------- FitBounds helper ---------------------- */
function FitBounds({
    coords,
    fallbackCenter,
}: {
    coords: LatLngTuple[];
    fallbackCenter: LatLngTuple;
}) {
    const map = useMap();

    useEffect(() => {
        if (!coords.length) {
            map.setView(fallbackCenter, 2);
            return;
        }
        if (coords.length === 1) {
            map.setView(coords[0], 11);
            return;
        }
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [56, 56] });
    }, [coords, fallbackCenter, map]);

    return null;
}

/* --------------------------- Component --------------------------- */
const TrackingMap: React.FC<TrackingMapProps> = ({
    routes,
    center,
    showPolyline = true,
    height = 380,
    rounded = true,
    showTiles = true,
    tileUrl = "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
    tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}) => {
    const [isClient, setIsClient] = useState(false);
    const [tileFailed, setTileFailed] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Keep only numeric, visible points
    const points = useMemo(
        () =>
            (routes || [])
                .filter((r) => r && Number.isFinite(+r.latitude) && Number.isFinite(+r.longitude))
                .filter((r) => r.visible !== false),
        [routes]
    );

    const coords: LatLngTuple[] = useMemo(
        () =>
            points.map(
                (p) => [Number(p.latitude), Number(p.longitude)] as LatLngTuple
            ),
        [points]
    );

    const fallbackCenter: LatLngTuple = useMemo(() => {
        if (center) return [center.lat, center.lng] as LatLngTuple;
        if (coords.length) return coords[coords.length - 1];
        return [0, 0];
    }, [center, coords]);

    if (!isClient) {
        return (
            <div
                className={`w-full ${rounded ? "rounded-3xl" : ""} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700`}
                style={{ height }}
            >
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 dark:border-gray-600 border-t-[var(--bg-general)] mx-auto mb-4"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-[var(--bg-general)] rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-poppins font-medium">Loading map…</p>
                </div>
            </div>
        );
    }

    if (!points.length) {
        return (
            <div
                className={`w-full ${rounded ? "rounded-3xl" : ""} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700`}
                style={{ height }}
            >
                <div className="text-center px-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-200 font-semibold text-base font-poppins mb-2">No location data available</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-poppins">Live route points will appear here when available</p>
                </div>
            </div>
        );
    }

    const lastIdx = points.length - 1;

    return (
        <div
            className={`relative w-full border-2 border-gray-2000 dark:border-gray-700 ${rounded ? "rounded-3xl overflow-hidden" : ""} bg-gray-50 dark:bg-gray-900`}
            style={{ height }}
        >
            {/* Subtle background pattern so routes still look "on a map" when tiles fail */}
            <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
                <div className="w-full h-full opacity-[0.08] dark:opacity-[0.12]" style={{
                    backgroundImage:
                        "linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }} />
            </div>

            {/* Gradient overlay for professional look */}
            <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-br from-transparent via-transparent to-gray-50/30 dark:to-gray-900/30" aria-hidden></div>

            <MapContainer
                center={fallbackCenter}
                zoom={5}
                style={{ height: "100%", width: "100%", zIndex: 10 }}
                className={`${rounded ? "rounded-3xl" : ""} font-poppins`}
                scrollWheelZoom={true}
                zoomControl={true}
                attributionControl={true}
            >
                {/* Tiles (optional) */}
                {showTiles && (
                    <TileLayer
                        url={tileUrl}
                        attribution={tileAttribution}
                        eventHandlers={{
                            tileerror: () => setTileFailed(true),
                            load: () => setTileFailed(false),
                        }}
                    />
                )}

                {/* Auto-fit to the route */}
                <FitBounds coords={coords} fallbackCenter={fallbackCenter} />

                {/* Route line */}
                {showPolyline && coords.length >= 2 && (
                    <Polyline
                        positions={coords}
                        pathOptions={{
                            color: "#ff6200",
                            weight: 6,
                            opacity: 0.95,
                            lineJoin: "round",
                            lineCap: "round",
                            dashArray: coords.length > 2 ? "8,12" : undefined,
                        }}
                    />
                )}

                {/* Animated route line for better visual appeal */}
                {showPolyline && coords.length >= 2 && (
                    <Polyline
                        positions={coords}
                        pathOptions={{
                            color: "#FF8C42",
                            weight: 8,
                            opacity: 0.3,
                            lineJoin: "round",
                            lineCap: "round",
                            dashArray: "20,10",
                            className: "route-glow",
                        }}
                    />
                )}

                {/* Vector markers (no external images, always visible) */}
                {points.map((p, idx) => {
                    const isFirst = idx === 0;
                    const isCurrent = idx === lastIdx;
                    const color = isCurrent ? "#ff6200" : isFirst ? "#10B981" : "#3B82F6";
                    const radius = isCurrent ? 12 : isFirst ? 10 : 8;
                    const dt = new Date(p.timestamp);
                    const notified = p.sendEmail ?? p.sentEmail ?? false;

                    return (
                        <React.Fragment key={p._id || `${p.latitude}-${p.longitude}-${idx}`}>
                            {/* Outer glow for current location */}
                            {isCurrent && (
                                <CircleMarker
                                    center={[Number(p.latitude), Number(p.longitude)] as LatLngTuple}
                                    radius={radius + 6}
                                    pathOptions={{ 
                                        color: "#ff6200", 
                                        fillColor: "#ff6200", 
                                        fillOpacity: 0.2, 
                                        weight: 0 
                                    }}
                                />
                            )}
                            <CircleMarker
                                center={[Number(p.latitude), Number(p.longitude)] as LatLngTuple}
                                radius={radius}
                                pathOptions={{ 
                                    color: color, 
                                    fillColor: color, 
                                    fillOpacity: 0.95, 
                                    weight: isCurrent ? 3 : 2 
                                }}
                            >
                            <Popup className="font-poppins">
                                <div className="text-sm min-w-[240px] font-poppins">
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                                        <div
                                            className={`w-4 h-4 rounded-full ${isCurrent ? "bg-[var(--bg-general)] animate-pulse" : isFirst ? "bg-green-500" : "bg-blue-500"
                                                }`}
                                        />
                                        <strong className="text-gray-900 dark:text-white font-semibold text-base">
                                            {isCurrent ? "📍 Current Location" : isFirst ? "🚚 Origin" : `📍 Location ${idx + 1}`}
                                        </strong>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">Coordinates:</span>
                                        <span className="font-mono text-gray-700 dark:text-gray-300 text-[10px]">
                                            {Number(p.latitude).toFixed(4)}, {Number(p.longitude).toFixed(4)}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">Date:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {isNaN(dt.getTime()) ? "—" : dt.toLocaleString()}
                                        </span>
                                    </div>

                                    {isCurrent && (
                                        <div className="mt-2 p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg border border-orange-200 dark:border-orange-700 shadow-sm">
                                            <p className="text-[var(--bg-general)] dark:text-orange-400 text-xs font-semibold flex items-center gap-2">
                                                <span className="w-2 h-2 bg-[var(--bg-general)] rounded-full animate-pulse"></span>
                                                Live — package is currently here
                                            </p>
                                        </div>
                                    )}

                                    {notified && (
                                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                            <p className="text-green-700 dark:text-green-300 text-xs font-medium flex items-center gap-1">
                                                <span>✓</span>
                                                Customer notified
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </CircleMarker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>

            {/* Suppress tile error messages - routes are visible without basemap */}
        </div>
    );
};

export default TrackingMap;
