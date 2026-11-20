"use client";
// 3D Mapbox map: tilted pitch, 3D buildings layer, truck + dumpster markers.
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Layer } from "react-map-gl";

type Pt = { id: string; lat: number; lng: number; label: string };

export default function FleetMap({ trucks, dumpsters }: { trucks: Pt[]; dumpsters: Pt[] }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return <div className="h-full grid place-items-center text-slate-400">Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the map.</div>;
  return (
    <Map
      mapboxAccessToken={token}
      initialViewState={{ latitude: 39.7392, longitude: -104.9903, zoom: 13.5, pitch: 60, bearing: -20 }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    >
      <Layer
        id="3d-buildings" source="composite" source-layer="building" type="fill-extrusion" minzoom={14}
        paint={{ "fill-extrusion-color": "#334155", "fill-extrusion-height": ["get", "height"], "fill-extrusion-opacity": 0.7 }}
      />
      {dumpsters.map((d) => (
        <Marker key={d.id} latitude={d.lat} longitude={d.lng}><div title={d.label} className="h-3 w-3 rounded-sm bg-amber-400" /></Marker>
      ))}
      {trucks.map((t) => (
        <Marker key={t.id} latitude={t.lat} longitude={t.lng}>
          <div title={t.label} className="px-2 py-1 rounded-md bg-emerald-400 text-slate-950 text-xs font-semibold shadow-lg">{t.label}</div>
        </Marker>
      ))}
    </Map>
  );
}
