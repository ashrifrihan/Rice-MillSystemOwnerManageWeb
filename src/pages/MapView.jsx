import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPinIcon } from "lucide-react";

export function MapView({ delivery }) {
  // Example lat/lng, in real system these would come from your delivery data
  const position = delivery.location || { lat: 6.9271, lng: 79.8612 }; // Colombo

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow">
      <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={position}>
          <Popup>
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-red-500" />
              <span>
                #{delivery.orderId} - {delivery.driver} ({delivery.status})
              </span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
