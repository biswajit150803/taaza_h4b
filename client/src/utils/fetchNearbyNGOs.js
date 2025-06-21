export const fetchNearbyNGOs = async ({ lat, lon }, abortSignal) => {
  const query = `
    [out:json][timeout:30];
    (
      node["office"="ngo"](around:15000, ${lat}, ${lon});
      node["office"="charity"](around:15000, ${lat}, ${lon});
      node["office"="non_profit"](around:15000, ${lat}, ${lon});
      node["amenity"="social_facility"]["social_facility"="outreach"](around:15000, ${lat}, ${lon});
      way["office"="ngo"](around:15000, ${lat}, ${lon});
      way["office"="charity"](around:15000, ${lat}, ${lon});
      relation["office"="ngo"](around:15000, ${lat}, ${lon});
    );
    out center;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
    headers: { "Content-Type": "text/plain" },
    signal: abortSignal,
  });

  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  const data = await res.json();
  return data.elements
    .filter((el) => el.lat || el.center?.lat)
    .map((el) => {
      const lat = el.lat || el.center?.lat;
      const lon = el.lon || el.center?.lon;
      const name = el.tags?.name || "Unnamed Location";
      return {
        id: el.id,
        name,
        location: `${el.tags?.["addr:full"] || el.tags?.["addr:street"] || "Unknown"}`,
        contact: el.tags?.phone || "Not available",
      };
    });
};
