export const DISTRICTS = [
  {
    id: "jamnagar",
    name: "Jamnagar",
    state: "Gujarat",
    lat: 22.36,
    lon: 69.87,
    bbox: [69.5, 21.8, 70.8, 22.9],
    focus: "Coastal refinery belt",
    description:
      "Heavy concentration of petroleum refineries and marine gas flaring. Continuous thermal footprint detected near the Gulf of Kutch coastline.",
    detectedHotspots: 48,
    activeClusters: 8,
    maxFrpMw: 187.3,
    avgFrpMw: 85.2,
    tempAnomaly: "+4.2°C",
    dominantSource: "Petroleum Refinery & Gas Flares",
    riskLevel: "Elevated",
    riskColor: "#ff9559",
    satellite: "NOAA-20 (VIIRS)",
    lastDetected: "01:42 UTC",
    confidence: "98% (High)",
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    lat: 23.03,
    lon: 72.58,
    bbox: [71.8, 22.3, 73.1, 23.6],
    focus: "Urban–industrial interface",
    description:
      "Dense chemical processing, textile manufacturing, and municipal thermal anomalies clustered across the eastern peri-urban perimeter.",
    detectedHotspots: 36,
    activeClusters: 6,
    maxFrpMw: 94.2,
    avgFrpMw: 54.6,
    tempAnomaly: "+2.8°C",
    dominantSource: "Industrial Manufacturing & Heat Islands",
    riskLevel: "Standard",
    riskColor: "#c5f277",
    satellite: "Suomi-NPP (VIIRS)",
    lastDetected: "02:18 UTC",
    confidence: "92% (High)",
  },
  {
    id: "ludhiana",
    name: "Ludhiana",
    state: "Punjab",
    lat: 30.91,
    lon: 75.85,
    bbox: [75.3, 30.4, 76.5, 31.2],
    focus: "Post-harvest agricultural belt",
    description:
      "Rapid seasonal surge in open biomass combustion and agricultural field burning across intensive cropland corridors.",
    detectedHotspots: 124,
    activeClusters: 22,
    maxFrpMw: 46.8,
    avgFrpMw: 22.4,
    tempAnomaly: "+5.6°C",
    dominantSource: "Agricultural Crop Stubble Burning",
    riskLevel: "Severe",
    riskColor: "#ff4d4d",
    satellite: "NOAA-20 (VIIRS)",
    lastDetected: "06:14 UTC",
    confidence: "96% (High)",
  },
  {
    id: "dhanbad",
    name: "Dhanbad",
    state: "Jharkhand",
    lat: 23.78,
    lon: 86.42,
    bbox: [86, 23.4, 86.9, 24.1],
    focus: "Coalfield landscape",
    description:
      "Intense subterranean and opencast coalfield thermal activity. Extreme radiative power values with sustained multi-day recurrence.",
    detectedHotspots: 82,
    activeClusters: 14,
    maxFrpMw: 215.6,
    avgFrpMw: 112.4,
    tempAnomaly: "+7.1°C",
    dominantSource: "Subsurface Coal Fires & Opencast Mining",
    riskLevel: "Elevated",
    riskColor: "#ff9559",
    satellite: "NOAA-21 (VIIRS)",
    lastDetected: "03:05 UTC",
    confidence: "99% (High)",
  },
];

export function restoreManager() {
  try {
    const item = JSON.parse(sessionStorage.getItem("tg_demo_manager_v1"));
    return item &&
      DISTRICTS.some((d) => d.id === item.districtId) &&
      typeof item.name === "string" &&
      item.name.length <= 60
      ? item
      : null;
  } catch {
    return null;
  }
}
