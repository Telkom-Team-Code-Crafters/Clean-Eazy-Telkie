"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import MapContainer (to avoid SSR issues)
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
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [towers, setTowers] = useState<any[]>([]);

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
        setStatus("📡 Checking reception with OpenCelliD...");

        try {
          const apiKey = process.env.NEXT_PUBLIC_OPENCELLID_KEY; // store in .env.local

          const response = await fetch(
            `https://opencellid.org/ajax/searchCell.php?key=${apiKey}&lat=${latitude}&lon=${longitude}&limit=10`
          );

          if (!response.ok) {
            throw new Error("API request failed");
          }

          const data = await response.json();

          if (data && data.length > 0) {
            setTowers(data);
            setStatus(`✅ Found ${data.length} nearby towers`);
          } else {
            setStatus("❌ No reception found in your area.");
          }
        } catch (error) {
          console.error(error);
          setStatus("⚠️ Error checking reception.");
        }

        setLoading(false);
      },
      (err) => {
        setStatus("❌ Location access denied.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">📡 Reception Checker</h1>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
        <button
          onClick={checkReception}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? "Checking..." : "Check Reception Near Me"}
        </button>

        {status && (
          <div className="mt-6 p-4 text-lg font-medium text-center bg-gray-50 rounded-lg border">
            {status}
          </div>
        )}

        {/* Show Map if location exists */}
        {location && (
          <div className="mt-6 h-96 w-full">
            <MapContainer
              center={[location.lat, location.lon]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* User Location */}
              <Marker position={[location.lat, location.lon]}>
                <Popup>📍 You are here</Popup>
              </Marker>

              {/* Towers */}
              {towers.map((tower, idx) => (
                <Marker
                  key={idx}
                  position={[tower.lat, tower.lon]}
                >
                  <Popup>
                    Tower ID: {tower.cellid} <br />
                    Signal: {tower.signal || "Unknown"}
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
