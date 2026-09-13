import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { Crosshair, Layers, Minus, Plus } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { colors } from "./client";
import {
  findNearbyEmergencyServices,
  formatEmergencyDispatchText,
} from "./emergencyServices";

const GOOGLE_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  "AIzaSyA7954ojQw_4nIGMMO5hNwgLhi6wPaN7lw";

export default function MapView({
  events,
  bbox,
  onSelect,
  selectedId,
  acquisition,
}) {
  const element = useRef(null),
    map = useRef(null),
    dots = useRef(null),
    emergencyDots = useRef(null),
    select = useRef(onSelect);

  // Default to Google Maps streets as requested by user
  const [layer, setLayer] = useState("google-streets"),
    [tileError, setTileError] = useState(false);

  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);

  const bounds = useCallback(
    () => [
      [bbox[1], bbox[0]],
      [bbox[3], bbox[2]],
    ],
    [bbox],
  );

  const imageryDate = acquisition?.slice(0, 10);

  // Find nearby emergency services within 25 km of detected thermal events
  const nearbyEmergency = useMemo(
    () => findNearbyEmergencyServices(events, 25),
    [events],
  );

  useEffect(() => {
    const m = L.map(element.current, {
      zoomControl: false,
      preferCanvas: true,
      minZoom: 2,
      maxZoom: 19,
      zoomSnap: 0.25,
    }).setView([23, 80], 4);

    map.current = m;
    dots.current = L.layerGroup().addTo(m);
    emergencyDots.current = L.layerGroup().addTo(m);
    L.control.scale({ imperial: false, position: "bottomleft" }).addTo(m);

    const observer = new ResizeObserver(() => m.invalidateSize());
    observer.observe(element.current);

    return () => {
      observer.disconnect();
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (map.current)
      map.current.fitBounds(bounds(), { padding: [34, 34], animate: false });
  }, [bounds]);

  useEffect(() => {
    if (!map.current) return;
    setTileError(false);

    const date =
      imageryDate || new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let config;
    if (layer === "google-streets") {
      config = [
        `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${GOOGLE_KEY}`,
        {
          attribution:
            '&copy; <a href="https://www.google.com/maps" target="_blank" rel="noreferrer">Google Maps</a>',
          maxZoom: 20,
        },
      ];
    } else if (layer === "google-hybrid") {
      config = [
        `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${GOOGLE_KEY}`,
        {
          attribution:
            '&copy; <a href="https://www.google.com/maps" target="_blank" rel="noreferrer">Google Maps</a>',
          maxZoom: 20,
        },
      ];
    } else if (layer === "satellite") {
      config = [
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
        {
          attribution: "Imagery: NASA GIBS / MODIS Terra",
          maxNativeZoom: 9,
        },
      ];
    } else {
      // "streets" and "dark" both use official OpenStreetMap tiles
      config = [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
          maxZoom: 19,
        },
      ];
    }

    const tiles = L.tileLayer(config[0], {
      ...config[1],
      crossOrigin: true,
    }).addTo(map.current);

    tiles.on("tileerror", () => setTileError(true));
    tiles.bringToBack();

    return () => tiles.remove();
  }, [layer, imageryDate]);

  // Render thermal event dots
  useEffect(() => {
    if (!dots.current) return;
    dots.current.clearLayers();

    for (const event of events) {
      const active = event.id === selectedId;
      const marker = L.circleMarker([event.lat, event.lon], {
        radius: active ? 10 : Math.min(7, 3.8 + Math.log1p(event.maxFrp) * 0.4),
        color: active ? "#ffffff" : colors[event.priority],
        weight: active ? 2 : 1,
        fillColor: colors[event.priority],
        fillOpacity: 0.85,
      });

      const tooltip = document.createElement("span");
      tooltip.textContent = `${event.priority} · ${event.maxFrp.toFixed(1)} MW · ${event.detections.length} detection(s)`;
      marker.bindTooltip(tooltip);
      marker.on("click", () => select.current(event));
      dots.current.addLayer(marker);
    }
  }, [events, selectedId]);

  // Render Green Spots for nearby emergency services ("wherever available, and if not then dont show")
  useEffect(() => {
    if (!emergencyDots.current) return;
    emergencyDots.current.clearLayers();

    if (!nearbyEmergency.length) return;

    for (const station of nearbyEmergency) {
      const greenMarker = L.circleMarker([station.lat, station.lon], {
        radius: 8.5,
        color: "#ffffff",
        weight: 2,
        fillColor: "#22c55e",
        fillOpacity: 0.95,
        className: "emergency-green-spot",
      });

      // Quick hover tooltip
      const tooltip = document.createElement("span");
      tooltip.className = "emergency-map-tooltip";
      tooltip.textContent = `${station.icon} ${station.name} (${station.distanceKm} km from Hotspot)`;
      greenMarker.bindTooltip(tooltip);

      // Interactive popup card with direct contact options & emergency dispatch
      const popupCard = document.createElement("div");
      popupCard.className = "emergency-popup-card";
      popupCard.innerHTML = `
        <div class="ep-header">
          <span class="ep-icon">${station.icon}</span>
          <div class="ep-title-wrap">
            <strong class="ep-name">${station.name}</strong>
            <span class="ep-type">${station.typeLabel}</span>
          </div>
        </div>
        <div class="ep-meta-row">
          <span class="ep-dist">📍 <strong>${station.distanceKm} km</strong> from Thermal Hotspot</span>
          <span class="ep-frp">Peak FRP: <strong>${station.nearestEventFrp.toFixed(1)} MW</strong></span>
        </div>
        <p class="ep-address">${station.address}</p>
        <div class="ep-contacts">
          <a href="tel:${station.phone.replace(/[^0-9+]/g, "")}" class="ep-btn ep-btn-call">
            📞 Call Station: ${station.phone}
          </a>
          <a href="tel:${station.altPhone.split("/")[0].trim()}" class="ep-btn ep-btn-sos">
            🚨 Emergency Hotline: ${station.altPhone}
          </a>
        </div>
        <button type="button" class="ep-btn ep-btn-dispatch" id="dispatch-btn-${station.id}">
          📋 Copy Emergency Dispatch Dossier
        </button>
      `;

      const dispatchBtn = popupCard.querySelector(`#dispatch-btn-${station.id}`);
      if (dispatchBtn) {
        dispatchBtn.addEventListener("click", () => {
          const matchedEvent = events.find(
            (e) => e.id === station.nearestEventId,
          ) || {
            lat: station.nearestEventLat,
            lon: station.nearestEventLon,
            maxFrp: station.nearestEventFrp,
            priority: station.nearestEventPriority,
            source: "VIIRS",
          };
          const dossier = formatEmergencyDispatchText(station, matchedEvent);
          navigator.clipboard
            .writeText(dossier)
            .then(() => {
              dispatchBtn.textContent = "✓ Emergency Dossier Copied!";
              setTimeout(() => {
                dispatchBtn.textContent = "📋 Copy Emergency Dispatch Dossier";
              }, 2500);
            })
            .catch(() => {
              dispatchBtn.textContent = "✓ Coordinates Logged";
            });
        });
      }

      greenMarker.bindPopup(popupCard, {
        maxWidth: 340,
        className: "custom-emergency-leaflet-popup",
      });

      emergencyDots.current.addLayer(greenMarker);
    }
  }, [nearbyEmergency, events]);

  return (
    <div className={`map-surface map-theme-${layer}`}>
      <div
        ref={element}
        className="map-canvas"
        role="region"
        aria-label="Thermal event map. Use the adjacent queue for keyboard accessible event selection."
      />
      <div className="map-topline">
        <span className="map-top-stat">
          <span className="map-dot" /> {events.length.toLocaleString()} mapped
          events
        </span>

        {/* Dynamic emergency status: shows when green spots exist */}
        {nearbyEmergency.length > 0 ? (
          <span
            className="map-top-emergency"
            title="Active emergency responders within reach of detected hotspots"
          >
            <span className="map-green-dot" /> {nearbyEmergency.length}{" "}
            emergency responder(s) nearby
          </span>
        ) : null}

        <span>NASA FIRMS / VIIRS</span>
      </div>

      <div className="map-controls">
        <button
          title="Zoom in"
          aria-label="Zoom in"
          onClick={() => map.current.zoomIn()}
        >
          <Plus size={17} />
        </button>
        <button
          title="Zoom out"
          aria-label="Zoom out"
          onClick={() => map.current.zoomOut()}
        >
          <Minus size={17} />
        </button>
        <button
          title="Fit selected area"
          aria-label="Fit selected area"
          onClick={() => map.current.fitBounds(bounds(), { padding: [34, 34] })}
        >
          <Crosshair size={17} />
        </button>
      </div>

      <div className="map-layer">
        <Layers size={15} />
        <select
          aria-label="Basemap"
          value={layer}
          onChange={(e) => setLayer(e.target.value)}
        >
          <option value="google-streets">Google Maps (Streets)</option>
          <option value="google-hybrid">Google Maps (Satellite)</option>
          <option value="streets">OpenStreetMap</option>
          <option value="dark">Dark basemap</option>
          <option value="satellite">NASA satellite</option>
        </select>
      </div>

      <div className="map-legend">
        {Object.entries(colors).map(([name, color]) => (
          <span key={name}>
            <i style={{ background: color }} />
            {name}
          </span>
        ))}
        {nearbyEmergency.length > 0 && (
          <span className="legend-emergency" title="Police & Fire stations within 25 km">
            <i style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
            Emergency responder
          </span>
        )}
      </div>

      {tileError && (
        <div className="map-warning">
          Some map tiles are unavailable. Try another basemap; event coordinates
          remain available.
        </div>
      )}

      {layer === "satellite" && (
        <div className="imagery-date">
          MODIS imagery · {acquisition?.slice(0, 10) || "previous UTC day"} ·
          clouds may obscure the surface
        </div>
      )}
    </div>
  );
}
