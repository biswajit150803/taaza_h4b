import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const markerColors = {
  ngo: "#FF4136",
  oldage: "#0074D9",
  bhandar: "#2ECC40",
};

const markerLabels = {
  ngo: "N",
  oldage: "O",
  bhandar: "B",
};

const createCustomIcon = (category) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background-color: ${markerColors[category]};
        color: white;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 0 4px rgba(0,0,0,0.4);
      ">
        ${markerLabels[category]}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const getCategoryLabel = (category) => {
  switch (category) {
    case "ngo":
      return "NGO/Charity";
    case "oldage":
      return "Old Age Home";
    case "bhandar":
      return "Bhandar/Community Kitchen";
    default:
      return category;
  }
};

// Optional: auto-center map on user location
const CenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([location.lat, location.lon], 11);
  }, [location, map]);
  return null;
};

const MapDisplay = ({ location, places }) => {
  return (
    <div className="flex-1">
      <MapContainer
        center={[location.lat, location.lon]}
        zoom={11}
        className="h-full w-full rounded-xl shadow-lg"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CenterMap location={location} />

        {/* User Location Marker */}
        <Marker position={[location.lat, location.lon]}>
          <Popup>
            <strong>📍 You are here</strong>
          </Popup>
        </Marker>

        {/* Delay rendering of markers until places are loaded */}
        {places?.length > 0 &&
          places.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lon]}
              icon={createCustomIcon(place.category)}
            >
              <Popup maxWidth={300}>
                <div className="text-center space-y-2">
                  <h3 className="font-bold text-lg">{place.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {getCategoryLabel(place.category)}
                  </p>
                  {place.address && (
                    <p className="text-sm">
                      <strong>Address:</strong> {place.address}
                    </p>
                  )}
                  {place.phone && (
                    <p className="text-sm">
                      <strong>Phone:</strong>
                      <a
                        href={`tel:${place.phone}`}
                        className="text-blue-600 ml-1"
                      >
                        {place.phone}
                      </a>
                    </p>
                  )}
                  {place.website && (
                    <p className="text-sm">
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Visit Website
                      </a>
                    </p>
                  )}
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`,
                        "_blank"
                      )
                    }
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Get Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default MapDisplay;
