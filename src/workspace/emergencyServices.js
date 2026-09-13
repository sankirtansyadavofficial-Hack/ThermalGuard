/**
 * ThermalGuard — Emergency Responder & First Response Registry
 * Real emergency facilities (Fire Brigade / Extinguisher Units, Local Police Stations,
 * Emergency Medical / Hospitals, District Disaster Operations) mapped to thermal hotspot coordinates.
 */

export const EMERGENCY_FACILITIES = [
  // ── Jamnagar Belt (Gujarat) ─────────────────────────────────────────
  {
    id: "jam-fire-central",
    name: "Jamnagar Central Fire & Emergency Services",
    type: "fire",
    typeLabel: "Fire Brigade & Extinguisher Unit",
    icon: "🚒",
    lat: 22.4707,
    lon: 70.0650,
    phone: "+91 288 2550101",
    altPhone: "101",
    address: "Super Market Compound, Near Town Hall, Jamnagar, Gujarat",
    district: "Jamnagar",
    state: "Gujarat",
  },
  {
    id: "jam-fire-sikka",
    name: "Sikka Industrial Fire & Safety Unit",
    type: "fire",
    typeLabel: "Industrial Fire & Chemical Hazmat",
    icon: "🚒",
    lat: 22.4330,
    lon: 69.8370,
    phone: "+91 288 2341200",
    altPhone: "101",
    address: "Sikka Port Road, GSFC / Thermal Plant Area, Jamnagar",
    district: "Jamnagar",
    state: "Gujarat",
  },
  {
    id: "jam-fire-motikhavdi",
    name: "Moti Khavdi Industrial Fire Station",
    type: "fire",
    typeLabel: "Petrochemical Fire Brigade",
    icon: "🚒",
    lat: 22.3610,
    lon: 69.8650,
    phone: "+91 288 2880101",
    altPhone: "101",
    address: "Refinery Complex Area, Moti Khavdi, Jamnagar",
    district: "Jamnagar",
    state: "Gujarat",
  },
  {
    id: "jam-police-bedi",
    name: "Bedi Marine & Coastal Police Station",
    type: "police",
    typeLabel: "Local Police Station",
    icon: "👮",
    lat: 22.5020,
    lon: 70.0460,
    phone: "+91 288 2570033",
    altPhone: "112 / 100",
    address: "Bedi Port Road, Jamnagar, Gujarat",
    district: "Jamnagar",
    state: "Gujarat",
  },
  {
    id: "jam-police-jodiya",
    name: "Jodiya Police Station & PCR",
    type: "police",
    typeLabel: "Local Police Station",
    icon: "👮",
    lat: 22.6840,
    lon: 70.3060,
    phone: "+91 2893 222033",
    altPhone: "112 / 100",
    address: "Main Bazaar, Jodiya, Jamnagar District, Gujarat",
    district: "Jamnagar",
    state: "Gujarat",
  },
  {
    id: "jam-police-lalpur",
    name: "Lalpur Police Station",
    type: "police",
    typeLabel: "Local Police Station",
    icon: "👮",
    lat: 22.1880,
    lon: 69.9650,
    phone: "+91 2895 272033",
    altPhone: "112 / 100",
    address: "Near Bus Station, Lalpur, Jamnagar District, Gujarat",
    district: "Jamnagar",
    state: "Gujarat",
  },
  {
    id: "jam-police-city",
    name: "Jamnagar City 'A' Division Police Station",
    type: "police",
    typeLabel: "District Police Control Room",
    icon: "👮",
    lat: 22.4680,
    lon: 70.0710,
    phone: "+91 288 2555555",
    altPhone: "112 / 100",
    address: "Khambhalia Gate, Jamnagar, Gujarat",
    district: "Jamnagar",
    state: "Gujarat",
  },
  {
    id: "jam-med-gg",
    name: "Guru Gobind Singh Govt. Hospital & Trauma Centre",
    type: "medical",
    typeLabel: "Emergency Trauma & Burn Centre",
    icon: "🏥",
    lat: 22.4750,
    lon: 70.0620,
    phone: "+91 288 2553034",
    altPhone: "108",
    address: "Indira Marg, Jamnagar, Gujarat",
    district: "Jamnagar",
    state: "Gujarat",
  },

  // ── Ahmedabad Urban & Industrial Belt (Gujarat) ─────────────────────
  {
    id: "ahm-fire-naroda",
    name: "Naroda GIDC Industrial Fire Station",
    type: "fire",
    typeLabel: "Industrial Fire Brigade & Foam Tender",
    icon: "🚒",
    lat: 23.0720,
    lon: 72.6560,
    phone: "+91 79 22810101",
    altPhone: "101",
    address: "Phase 1, GIDC Naroda, Ahmedabad, Gujarat",
    district: "Ahmedabad",
    state: "Gujarat",
  },
  {
    id: "ahm-fire-vatva",
    name: "Vatva GIDC Chemical Fire & Safety Unit",
    type: "fire",
    typeLabel: "Chemical Hazard & Fire Unit",
    icon: "🚒",
    lat: 22.9650,
    lon: 72.6350,
    phone: "+91 79 25830101",
    altPhone: "101",
    address: "Phase 4, Vatva Industrial Estate, Ahmedabad",
    district: "Ahmedabad",
    state: "Gujarat",
  },
  {
    id: "ahm-police-odhav",
    name: "Odhav Industrial Police Station",
    type: "police",
    typeLabel: "Local Police Station",
    icon: "👮",
    lat: 23.0310,
    lon: 72.6640,
    phone: "+91 79 22872333",
    altPhone: "112 / 100",
    address: "Ring Road, Odhav, Ahmedabad, Gujarat",
    district: "Ahmedabad",
    state: "Gujarat",
  },
  {
    id: "ahm-police-vatva",
    name: "Vatva GIDC Police Station",
    type: "police",
    typeLabel: "Local Police Station",
    icon: "👮",
    lat: 22.9680,
    lon: 72.6310,
    phone: "+91 79 25831515",
    altPhone: "112 / 100",
    address: "Near Water Tank, GIDC Vatva, Ahmedabad",
    district: "Ahmedabad",
    state: "Gujarat",
  },
  {
    id: "ahm-med-civil",
    name: "Civil Hospital Asarwa (Emergency & Burn Unit)",
    type: "medical",
    typeLabel: "Apex Trauma & Disaster Centre",
    icon: "🏥",
    lat: 23.0520,
    lon: 72.6020,
    phone: "+91 79 22686564",
    altPhone: "108",
    address: "Asarwa, Ahmedabad, Gujarat",
    district: "Ahmedabad",
    state: "Gujarat",
  },

  // ── Ludhiana Industrial & Agro Belt (Punjab) ────────────────────────
  {
    id: "lud-fire-focal",
    name: "Ludhiana Focal Point Industrial Fire Sub-Station",
    type: "fire",
    typeLabel: "Industrial Fire Extinguisher Unit",
    icon: "🚒",
    lat: 30.8750,
    lon: 75.9180,
    phone: "+91 161 2670101",
    altPhone: "101",
    address: "Phase 5, Focal Point, Ludhiana, Punjab",
    district: "Ludhiana",
    state: "Punjab",
  },
  {
    id: "lud-fire-central",
    name: "Central Fire Station Ludhiana",
    type: "fire",
    typeLabel: "Municipal Fire Brigade HQ",
    icon: "🚒",
    lat: 30.9080,
    lon: 75.8560,
    phone: "+91 161 2740101",
    altPhone: "101",
    address: "Near Old Courts, Ludhiana, Punjab",
    district: "Ludhiana",
    state: "Punjab",
  },
  {
    id: "lud-police-focal",
    name: "Focal Point Police Station",
    type: "police",
    typeLabel: "Local Police Station",
    icon: "👮",
    lat: 30.8720,
    lon: 75.9150,
    phone: "+91 161 2673333",
    altPhone: "112 / 100",
    address: "Focal Point Phase 4, Ludhiana, Punjab",
    district: "Ludhiana",
    state: "Punjab",
  },
  {
    id: "lud-med-civil",
    name: "Civil Hospital Ludhiana Emergency Care",
    type: "medical",
    typeLabel: "District Emergency Hospital",
    icon: "🏥",
    lat: 30.9050,
    lon: 75.8610,
    phone: "+91 161 2720272",
    altPhone: "108",
    address: "Old Jail Road, Ludhiana, Punjab",
    district: "Ludhiana",
    state: "Punjab",
  },

  // ── Dhanbad Mining & Industrial Belt (Jharkhand) ────────────────────
  {
    id: "dhn-fire-municipal",
    name: "Dhanbad Municipal Fire Station",
    type: "fire",
    typeLabel: "Fire & Mine Rescue Unit",
    icon: "🚒",
    lat: 23.8010,
    lon: 86.4350,
    phone: "+91 326 2312101",
    altPhone: "101",
    address: "Court Road, Dhanbad, Jharkhand",
    district: "Dhanbad",
    state: "Jharkhand",
  },
  {
    id: "dhn-fire-jharia",
    name: "Jharia Coalfield Fire & Safety Station",
    type: "fire",
    typeLabel: "BCCL Mine Fire Response Unit",
    icon: "🚒",
    lat: 23.7420,
    lon: 86.4180,
    phone: "+91 326 2460101",
    altPhone: "101",
    address: "Main Road, Jharia, Dhanbad, Jharkhand",
    district: "Dhanbad",
    state: "Jharkhand",
  },
  {
    id: "dhn-police-bankmore",
    name: "Bank More Police Station",
    type: "police",
    typeLabel: "Local Police Station",
    icon: "👮",
    lat: 23.7910,
    lon: 86.4260,
    phone: "+91 326 2302333",
    altPhone: "112 / 100",
    address: "Shastri Nagar, Bank More, Dhanbad, Jharkhand",
    district: "Dhanbad",
    state: "Jharkhand",
  },
  {
    id: "dhn-med-snmmch",
    name: "SNMMCH Medical College & Trauma Center",
    type: "medical",
    typeLabel: "Emergency Hospital & Burns Ward",
    icon: "🏥",
    lat: 23.8180,
    lon: 86.4420,
    phone: "+91 326 2230400",
    altPhone: "108",
    address: "Saraidhela, Dhanbad, Jharkhand",
    district: "Dhanbad",
    state: "Jharkhand",
  },

  // ── Surat & Hazira Heavy Industrial Belt (Gujarat) ──────────────────
  {
    id: "sur-fire-hazira",
    name: "Hazira Industrial Area Fire Brigade",
    type: "fire",
    typeLabel: "Industrial Fire & Hazmat Station",
    icon: "🚒",
    lat: 21.1120,
    lon: 72.6620,
    phone: "+91 261 2860101",
    altPhone: "101",
    address: "Hazira Port & Industrial Belt, Surat, Gujarat",
    district: "Surat",
    state: "Gujarat",
  },
  {
    id: "sur-police-ichhapore",
    name: "Ichhapore Police Station",
    type: "police",
    typeLabel: "Local Police Station",
    icon: "👮",
    lat: 21.1550,
    lon: 72.7210,
    phone: "+91 261 2861333",
    altPhone: "112 / 100",
    address: "Hazira Road, Ichhapore, Surat, Gujarat",
    district: "Surat",
    state: "Gujarat",
  },

  // ── Mumbai & Chembur Industrial Belt (Maharashtra) ──────────────────
  {
    id: "mum-fire-chembur",
    name: "Chembur Industrial Fire Station",
    type: "fire",
    typeLabel: "Refinery & Industrial Fire Unit",
    icon: "🚒",
    lat: 19.0620,
    lon: 72.8980,
    phone: "+91 22 25220101",
    altPhone: "101",
    address: "R.C. Marg, Chembur, Mumbai, Maharashtra",
    district: "Mumbai",
    state: "Maharashtra",
  },
  {
    id: "mum-police-trombay",
    name: "Trombay Police Station",
    type: "police",
    typeLabel: "Local Police Station",
    icon: "👮",
    lat: 19.0140,
    lon: 72.9050,
    phone: "+91 22 25563333",
    altPhone: "112 / 100",
    address: "Sion-Trombay Road, Trombay, Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
  },

  // ── Chennai Industrial Corridor (Tamil Nadu) ────────────────────────
  {
    id: "che-fire-ennore",
    name: "Ennore Fire & Rescue Station",
    type: "fire",
    typeLabel: "Thermal Power & Port Fire Unit",
    icon: "🚒",
    lat: 13.2080,
    lon: 80.3210,
    phone: "+91 44 25750101",
    altPhone: "101",
    address: "Ennore Expressway, Chennai, Tamil Nadu",
    district: "Chennai",
    state: "Tamil Nadu",
  },
  {
    id: "che-police-manali",
    name: "Manali Industrial Area Police Station",
    type: "police",
    typeLabel: "Local Police Station",
    icon: "👮",
    lat: 13.1670,
    lon: 80.2640,
    phone: "+91 44 25940333",
    altPhone: "112 / 100",
    address: "CPCL Main Gate Road, Manali, Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
  },
];

/**
 * Great-circle distance between two GPS coordinates using Haversine formula (km).
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds emergency facilities located near the given thermal hotspot events.
 * Only returns facilities within maxDistanceKm (default 25 km) of at least one detected thermal event.
 * If no facilities are available near the events, returns an empty array.
 *
 * @param {Array} events - Active thermal hotspot events [{ lat, lon, id, maxFrp, ... }]
 * @param {number} maxDistanceKm - Maximum proximity distance in km (default 25 km)
 * @returns {Array} List of matched emergency stations with distance to nearest hotspot
 */
export function findNearbyEmergencyServices(events = [], maxDistanceKm = 25) {
  if (!events || !events.length) return [];

  const matched = new Map();

  for (const facility of EMERGENCY_FACILITIES) {
    let closestEvent = null;
    let minDistance = Infinity;

    for (const event of events) {
      if (!Number.isFinite(event.lat) || !Number.isFinite(event.lon)) continue;
      const d = haversineDistance(event.lat, event.lon, facility.lat, facility.lon);
      if (d < minDistance) {
        minDistance = d;
        closestEvent = event;
      }
    }

    if (minDistance <= maxDistanceKm && closestEvent) {
      matched.set(facility.id, {
        ...facility,
        distanceKm: Math.round(minDistance * 10) / 10,
        nearestEventId: closestEvent.id,
        nearestEventLat: closestEvent.lat,
        nearestEventLon: closestEvent.lon,
        nearestEventFrp: closestEvent.maxFrp,
        nearestEventPriority: closestEvent.priority,
      });
    }
  }

  // Sort by closest distance to thermal events
  return Array.from(matched.values()).sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Formats an emergency dispatch text dossier ready to copy or share with emergency responders.
 */
export function formatEmergencyDispatchText(facility, event) {
  const now = new Date().toISOString();
  return (
    `[THERMALGUARD EMERGENCY DISPATCH ALERT]\n` +
    `Time: ${now}\n` +
    `Nearest Responder: ${facility.name} (${facility.typeLabel})\n` +
    `Distance to Hotspot: ${facility.distanceKm} km\n` +
    `Responder Contact: ${facility.phone} (Emergency: ${facility.altPhone})\n` +
    `\n` +
    `HOTSPOT COORDINATES:\n` +
    `Latitude: ${event.lat.toFixed(4)}° N, Longitude: ${event.lon.toFixed(4)}° E\n` +
    `Peak Radiative Power (FRP): ${event.maxFrp.toFixed(1)} MW\n` +
    `Priority: ${event.priority}\n` +
    `Detections: ${event.detections?.length || 1} observations\n` +
    `Satellite Sensor: ${event.source || "VIIRS"}\n` +
    `\n` +
    `ACTION REQUIRED: Immediate on-ground verification and emergency response readiness.`
  );
}
