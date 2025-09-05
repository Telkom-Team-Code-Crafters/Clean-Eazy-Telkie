"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-leaflet components (client-only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function ReceptionCheckerPage() {
  const [L, setLeaflet] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [towers, setTowers] = useState<any[]>([]);

  // Load Leaflet only on client
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
        iconUrl: require("leaflet/dist/images/marker-icon.png"),
        shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
      });
      setLeaflet(leaflet);
    });
  }, []);

  const checkReception = async () => {
    setLoading(true);
    setStatus("📡 Getting location...");

    if (!navigator.geolocation) {
      setStatus("❌ Geolocation not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lon: longitude });
        setStatus("📡 Checking reception with backend...");

        try {
          const response = await fetch("http://localhost:5000/api/reception", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mcc: 655,
              mnc: 10,
              lac: 12345,
              cid: 67890,
              signalStrength: -70,
            }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "API request failed");
          }

          const data = await response.json();

          if (data && data.towers && data.towers.length > 0) {
            setTowers(data.towers);
            setStatus(`✅ Found ${data.towers.length} nearby towers`);
          } else {
            setStatus("❌ No reception data found.");
          }
        } catch (error: any) {
          console.error("Frontend error:", error.message);
          setStatus(`⚠️ Error: ${error.message}`);
        }

        setLoading(false);
      },
      () => {
        setStatus("❌ Location access denied.");
        setLoading(false);
      }
    );
  };

  if (!L) return <div>Loading map library...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px", background: "linear-gradient(to bottom right, #cce0ff, #e6f0ff)" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px", color: "#005cbf" }}>📡 Reception Checker</h1>

      <div style={{ width: "100%", maxWidth: "800px", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "20px" }}>
        <button
          onClick={checkReception}
          disabled={loading}
          style={{ width: "100%", padding: "12px", background: loading ? "#ccc" : "#005cbf", color: "#fff", fontWeight: "600", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Checking..." : "Check Reception Near Me"}
        </button>

        {status && <div style={{ marginTop: "20px", padding: "12px", textAlign: "center", background: "#f0f4f8", borderRadius: "8px" }}>{status}</div>}

        {location && (
          <div style={{ marginTop: "20px", height: "400px", width: "100%" }}>
            <MapContainer center={[location.lat, location.lon]} zoom={14} style={{ height: "100%", width: "100%" }}>
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <Marker position={[location.lat, location.lon]}>
                <Popup>📍 You are here</Popup>
              </Marker>

              {towers.map((tower, idx) => (
                <Marker key={idx} position={[tower.lat, tower.lon]}>
                  <Popup>
                    Tower ID: {tower.cellid || tower.cid} <br />
                    Signal: {tower.signalStrength || "Unknown"}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}
