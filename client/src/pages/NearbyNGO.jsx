import { useEffect, useState, useCallback, useRef } from "react";
import "leaflet/dist/leaflet.css";
import FilterControls from "../components/FilterControls";
import MapDisplay from "../components/MapDisplay";
import DonationModal from "../components/DonationModal";
import PlacesList from "../components/PlacesList";
import { leafletIconFix } from "../utils/leafletConfig";

leafletIconFix();

const NearbyNGO = () => {
  const [location, setLocation] = useState(null);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({
    ngo: true,
    oldage: true,
    bhandar: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [donationDetails, setDonationDetails] = useState({
    items: [{ name: "", quantity: "", unit: "kg" }],
    date: "",
  });

  const openDonateModal = (ngo) => {
    setSelectedNGO(ngo);
    setDonationDetails({
      items: [{ name: "", quantity: "", unit: "kg" }],
      date: "",
    });
    setIsModalOpen(true);
  };

  const fetchingRef = useRef(false);
  const controllerRef = useRef(null);

  const fetchNearbyPlaces = useCallback(
    async ({ lat, lon }) => {
      if (fetchingRef.current) {
        console.log("Request already in progress, skipping...");
        return;
      }

      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const queries = [];

        if (selectedTypes.ngo) {
          queries.push(`
            node["office"="ngo"](around:15000, ${lat}, ${lon});
            node["office"="charity"](around:15000, ${lat}, ${lon});
            node["office"="non_profit"](around:15000, ${lat}, ${lon});
            node["amenity"="social_facility"]["social_facility"="outreach"](around:15000, ${lat}, ${lon});
            way["office"="ngo"](around:15000, ${lat}, ${lon});
            way["office"="charity"](around:15000, ${lat}, ${lon});
            relation["office"="ngo"](around:15000, ${lat}, ${lon});
          `);
        }

        if (selectedTypes.oldage) {
          queries.push(`
            node["amenity"="social_facility"]["social_facility"="senior"](around:15000, ${lat}, ${lon});
            node["amenity"="nursing_home"](around:15000, ${lat}, ${lon});
            node["healthcare"="residential_care"](around:15000, ${lat}, ${lon});
            node["name"~"old age|elderly|senior citizen|वृद्धाश्रम"](around:15000, ${lat}, ${lon});
            way["amenity"="social_facility"]["social_facility"="senior"](around:15000, ${lat}, ${lon});
            way["amenity"="nursing_home"](around:15000, ${lat}, ${lon});
          `);
        }

        if (selectedTypes.bhandar) {
          queries.push(`
            node["amenity"="community_centre"]["community_centre"="food_bank"](around:15000, ${lat}, ${lon});
            node["amenity"="social_facility"]["social_facility"="food_bank"](around:15000, ${lat}, ${lon});
            node["name"~"bhandar|भंडार|langar|लंगर|community kitchen|food distribution"](around:15000, ${lat}, ${lon});
            node["amenity"="place_of_worship"]["cuisine"](around:15000, ${lat}, ${lon});
            way["name"~"bhandar|भंडar|langar|लंगर"](around:15000, ${lat}, ${lon});
          `);
        }

        const query = `
          [out:json][timeout:30];
          (
            ${queries.join("")}
          );
          out center;
        `;

        console.log("Fetching places for location:", { lat, lon });

        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: query,
          headers: {
            "Content-Type": "text/plain",
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("API Response:", data);

        const processedPlaces = data.elements
          .filter((el) => el.lat || el.center?.lat)
          .map((el) => {
            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;
            const name = el.tags?.name || "Unnamed Location";

            let category = "ngo";

            if (
              (el.tags?.amenity === "social_facility" &&
                el.tags?.social_facility === "senior") ||
              el.tags?.amenity === "nursing_home" ||
              el.tags?.healthcare === "residential_care" ||
              name.toLowerCase().includes("old age") ||
              name.toLowerCase().includes("elderly") ||
              name.toLowerCase().includes("वृद्धाश्रम")
            ) {
              category = "oldage";
            } else if (
              name.toLowerCase().includes("bhandar") ||
              name.toLowerCase().includes("भंडार") ||
              name.toLowerCase().includes("langar") ||
              name.toLowerCase().includes("लंगर") ||
              name.toLowerCase().includes("community kitchen") ||
              name.toLowerCase().includes("food distribution") ||
              (el.tags?.amenity === "social_facility" &&
                el.tags?.social_facility === "food_bank")
            ) {
              category = "bhandar";
            }

            let distance = null;
            if (location && location.lat && location.lon) {
              distance = getDistanceFromLatLonInKm(
                lat,
                lon,
                location.lat,
                location.lon
              );
            }

            return {
              id: el.id,
              name,
              lat,
              lon,
              category,
              address: el.tags?.["addr:full"] || el.tags?.["addr:street"] || "",
              phone: el.tags?.phone || "",
              website: el.tags?.website || "",
              description: el.tags?.description || "",
              distance: distance !== null ? Number(distance.toFixed(2)) : null,
            };
          })
          .filter((place) => place.lat && place.lon);

        console.log("Processed places:", processedPlaces);
        processedPlaces.sort((a, b) => a.distance - b.distance);
        setPlaces(processedPlaces);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Request was aborted");
          return;
        }
        console.error("Failed to fetch places:", err);
        setError(`Failed to load nearby places: ${err.message}`);
      } finally {
        fetchingRef.current = false;
        setLoading(false);
      }
    },
    [selectedTypes.ngo, selectedTypes.oldage, selectedTypes.bhandar, location] // Added location to dependency array for getDistanceFromLatLonInKm
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        console.log("Got user location:", coords);
        setLocation(coords);
        setLocationLoaded(true);
      },
      (error) => {
        console.error("Geolocation error:", error);
        const fallback = { lat: 22.5726, lon: 88.3639 }; // Kolkata coordinates
        console.log("Using fallback location:", fallback);
        setLocation(fallback);
        setError("Couldn't get your location, using Kolkata as fallback");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (locationLoaded && location) {
      fetchNearbyPlaces(location);
    }
  }, [locationLoaded, location, fetchNearbyPlaces]);

  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const filteredPlaces = places.filter(
    (place) => selectedTypes[place.category]
  );

  const handleGetDirections = (place) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=driving`;
    window.open(googleMapsUrl, "_blank");
  };

  const getCategoryDisplayName = (category) => {
    switch (category) {
      case "ngo":
        return "NGO";
      case "oldage":
        return "Old Age Home";
      case "bhandar":
        return "Food Center";
      default:
        return category;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "ngo":
        return "bg-blue-100 text-blue-800";
      case "oldage":
        return "bg-green-100 text-green-800";
      case "bhandar":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#f3f8ed] gap-2 lg:gap-4 mt-2 lg:mt-4 p-2 lg:p-0">
      {/* Map Section */}
      <div className="h-[80vh] lg:h-[85vh] w-full lg:w-[65vw] bg-[#eaf3dc] flex flex-col p-2 lg:p-4 lg:ml-3 rounded-lg lg:rounded-none">
        <FilterControls
          selectedTypes={selectedTypes}
          onTypeToggle={handleTypeToggle}
          filteredPlacesCount={filteredPlaces.length}
        />

        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 lg:px-4 py-2 lg:py-3 rounded mb-2 lg:mb-4">
            <p className="text-xs lg:text-sm">{error}</p>
          </div>
        )}

        {location ? (
          <MapDisplay location={location} places={filteredPlaces} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm lg:text-lg text-gray-600 text-center px-4">
              Unable to load map. Please enable location access.
            </p>
          </div>
        )}
      </div>

      {/* Places List Section */}
      <PlacesList
        loading={loading}
        filteredPlaces={filteredPlaces}
        getCategoryColor={getCategoryColor}
        getCategoryDisplayName={getCategoryDisplayName}
        handleGetDirections={handleGetDirections}
        openDonateModal={openDonateModal}
        location={location} // Pass location here if PlacesList needs it for future features
      />

      <DonationModal
        isModalOpen={isModalOpen}
        selectedNGO={selectedNGO}
        donationDetails={donationDetails}
        setDonationDetails={setDonationDetails}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
};

export default NearbyNGO;
