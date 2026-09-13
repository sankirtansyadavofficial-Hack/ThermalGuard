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

function loadGoogleMapsScript(key) {
  if (typeof window !== "undefined" && window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }
  if (typeof window !== "undefined" && window._gmapsPromise) {
    return window._gmapsPromise;
  }
  const promise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve(null);
    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      if (window.google?.maps) return resolve(window.google.maps);
      existing.addEventListener("load", () => resolve(window.google.maps));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&v=weekly`;
    script.async = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  if (typeof window !== "undefined") window._gmapsPromise = promise;
  return promise;
}

export default function MapView({
  events,
  bbox,
  onSelect,
  selectedId,
  acquisition,
}) {
  // Dual-canvas refs: one dedicated to Google Maps, one dedicated to Leaflet
  const googleElement = useRef(null);
  const leafletElement = useRef(null);

  // Map instance references
  const googleMap = useRef(null);
  const googleMarkers = useRef([]);
  const googleEmergencyMarkers = useRef([]);
  const googleActiveInfoWindow = useRef(null);

  const leafletMap = useRef(null);
  const leafletDots = useRef(null);
  const leafletEmergencyDots = useRef(null);

  const select = useRef(onSelect);

  // Default to Google Maps (Streets)
  const [layer, setLayer] = useState("google-streets");
  const [googleReady, setGoogleReady] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);
  const [tileError, setTileError] = useState(false);

  const isGoogleLayer =
    (layer === "google-streets" || layer === "google-hybrid") && !googleFailed;

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

  // Calculate nearby emergency facilities within 25 km of detected thermal events
  const nearbyEmergency = useMemo(
    () => findNearbyEmergencyServices(events, 25),
    [events],
  );

  useEffect(() => {
    let unmounted = false;

    loadGoogleMapsScript(GOOGLE_KEY)
      .then((maps) => {
        if (unmounted || !maps || !googleElement.current) return;
        setGoogleReady(true);
      })
      .catch(() => {
        if (!unmounted) setGoogleFailed(true);
      });

    return () => {
      unmounted = true;
    };
  }, []);

  // Initialize Google Map once script is ready
  useEffect(() => {
    if (!googleReady || !window.google?.maps || !googleElement.current || googleMap.current) {
      return;
    }

    const gm = new window.google.maps.Map(googleElement.current, {
      center: {
        lat: (bbox[1] + bbox[3]) / 2 || 22.4,
        lng: (bbox[0] + bbox[2]) / 2 || 70.0,
      },
      zoom: 7,
      mapTypeId: layer === "google-hybrid" ? "hybrid" : "roadmap",
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      scaleControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });
    googleMap.current = gm;
  }, [googleReady, bbox, layer]);

  // Sync Google Map type when layer selector changes
  useEffect(() => {
    if (!googleMap.current || !isGoogleLayer) return;
    googleMap.current.setMapTypeId(
      layer === "google-hybrid" ? "hybrid" : "roadmap",
    );
  }, [layer, isGoogleLayer]);

  // Fit bounds on Google Map
  useEffect(() => {
    if (!googleMap.current || !isGoogleLayer || !window.google?.maps) return;
    const gbounds = new window.google.maps.LatLngBounds(
      { lat: bbox[1], lng: bbox[0] },
      { lat: bbox[3], lng: bbox[2] },
    );
    googleMap.current.fitBounds(gbounds);
  }, [bbox, isGoogleLayer, googleReady]);

  // Render Markers on Google Maps
  useEffect(() => {
    if (!googleMap.current || !isGoogleLayer || !window.google?.maps) return;

    // Clear existing thermal markers
    googleMarkers.current.forEach((m) => m.setMap(null));
    googleMarkers.current = [];

    // Render thermal events
    for (const event of events) {
      const active = event.id === selectedId;
      const marker = new window.google.maps.Marker({
        position: { lat: event.lat, lng: event.lon },
        map: googleMap.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: active ? 10 : Math.min(7, 3.8 + Math.log1p(event.maxFrp) * 0.4),
          fillColor: colors[event.priority],
          fillOpacity: 0.88,
          strokeColor: active ? "#ffffff" : colors[event.priority],
          strokeWeight: active ? 2.5 : 1,
        },
        title: `${event.priority} · ${event.maxFrp.toFixed(1)} MW · ${event.detections.length} detection(s)`,
      });

      marker.addListener("click", () => select.current(event));
      googleMarkers.current.push(marker);
    }

    // Clear existing emergency green spot markers
    googleEmergencyMarkers.current.forEach((m) => m.setMap(null));
    googleEmergencyMarkers.current = [];

    // Render Green Spots for nearby emergency services
    for (const station of nearbyEmergency) {
      const greenMarker = new window.google.maps.Marker({
        position: { lat: station.lat, lng: station.lon },
        map: googleMap.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#22c55e",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2.5,
        },
        title: `🚨 ${station.name} (${station.distanceKm} km from Hotspot)`,
      });

      const popupHtml = `
        <div class="emergency-popup-card">
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
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: popupHtml,
      });

      greenMarker.addListener("click", () => {
        if (googleActiveInfoWindow.current) {
          googleActiveInfoWindow.current.close();
        }
        infoWindow.open(googleMap.current, greenMarker);
        googleActiveInfoWindow.current = infoWindow;
      });

      googleEmergencyMarkers.current.push(greenMarker);
    }
  }, [events, selectedId, nearbyEmergency, isGoogleLayer, googleReady]);

  // ── Initialize Leaflet (for OpenStreetMap, Dark Basemap, NASA) ───────────
  useEffect(() => {
    if (!leafletElement.current) return;

    const m = L.map(leafletElement.current, {
      zoomControl: false,
      preferCanvas: true,
      minZoom: 2,
      maxZoom: 19,
      zoomSnap: 0.25,
    }).setView([23, 80], 4);

    leafletMap.current = m;
    leafletDots.current = L.layerGroup().addTo(m);
    leafletEmergencyDots.current = L.layerGroup().addTo(m);
    L.control.scale({ imperial: false, position: "bottomleft" }).addTo(m);

    const observer = new ResizeObserver(() => m.invalidateSize());
    observer.observe(leafletElement.current);

    return () => {
      observer.disconnect();
      m.remove();
      leafletMap.current = null;
    };
  }, []);

  // Sync Leaflet bounds
  useEffect(() => {
    if (leafletMap.current && !isGoogleLayer) {
      leafletMap.current.fitBounds(bounds(), { padding: [34, 34], animate: false });
    }
  }, [bounds, isGoogleLayer]);

  // Sync Leaflet Tile Layer
  useEffect(() => {
    if (!leafletMap.current || isGoogleLayer) return;
    setTileError(false);

    const date =
      imageryDate || new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const config =
      layer === "satellite"
        ? [
            `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
            {
              attribution: "Imagery: NASA GIBS / MODIS Terra",
              maxNativeZoom: 9,
            },
          ]
        : [
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
              maxZoom: 19,
            },
          ];

    const tiles = L.tileLayer(config[0], {
      ...config[1],
      crossOrigin: true,
    }).addTo(leafletMap.current);

    tiles.on("tileerror", () => setTileError(true));
    tiles.bringToBack();

    return () => tiles.remove();
  }, [layer, imageryDate, isGoogleLayer]);

  // Render Leaflet Dots
  useEffect(() => {
    if (!leafletDots.current || isGoogleLayer) return;
    leafletDots.current.clearLayers();

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
      leafletDots.current.addLayer(marker);
    }
  }, [events, selectedId, isGoogleLayer]);

  // Render Leaflet Emergency Green Spots
  useEffect(() => {
    if (!leafletEmergencyDots.current || isGoogleLayer) return;
    leafletEmergencyDots.current.clearLayers();

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

      const tooltip = document.createElement("span");
      tooltip.className = "emergency-map-tooltip";
      tooltip.textContent = `${station.icon} ${station.name} (${station.distanceKm} km from Hotspot)`;
      greenMarker.bindTooltip(tooltip);

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
        <button type="button" class="ep-btn ep-btn-dispatch" id="lf-dispatch-btn-${station.id}">
          📋 Copy Emergency Dispatch Dossier
        </button>
      `;

      const dispatchBtn = popupCard.querySelector(`#lf-dispatch-btn-${station.id}`);
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

      leafletEmergencyDots.current.addLayer(greenMarker);
    }
  }, [nearbyEmergency, events, isGoogleLayer]);

  // ── Unified Controls (works for both Google Maps and Leaflet) ───────────
  function handleZoomIn() {
    if (isGoogleLayer && googleMap.current) {
      googleMap.current.setZoom((googleMap.current.getZoom() || 7) + 1);
    } else if (leafletMap.current) {
      leafletMap.current.zoomIn();
    }
  }

  function handleZoomOut() {
    if (isGoogleLayer && googleMap.current) {
      googleMap.current.setZoom((googleMap.current.getZoom() || 7) - 1);
    } else if (leafletMap.current) {
      leafletMap.current.zoomOut();
    }
  }

  function handleFitBounds() {
    if (isGoogleLayer && googleMap.current && window.google?.maps) {
      const gbounds = new window.google.maps.LatLngBounds(
        { lat: bbox[1], lng: bbox[0] },
        { lat: bbox[3], lng: bbox[2] },
      );
      googleMap.current.fitBounds(gbounds);
    } else if (leafletMap.current) {
      leafletMap.current.fitBounds(bounds(), { padding: [34, 34] });
    }
  }

  return (
    <div className={`map-surface map-theme-${layer}`}>
      {/* Official Google Maps Canvas */}
      <div
        ref={googleElement}
        className="map-canvas"
        style={{
          display: isGoogleLayer ? "block" : "none",
          position: "absolute",
          inset: 0,
        }}
        role="region"
        aria-label="Google Maps thermal activity map"
      />

      {/* Leaflet Canvas for OpenStreetMap, Dark Basemap, NASA */}
      <div
        ref={leafletElement}
        className="map-canvas"
        style={{
          display: !isGoogleLayer ? "block" : "none",
          position: "absolute",
          inset: 0,
        }}
        role="region"
        aria-label="Leaflet thermal event map"
      />

      {/* Topline status & indicators */}
      <div className="map-topline">
        <span className="map-top-stat">
          <span className="map-dot" /> {events.length.toLocaleString()} mapped
          events
        </span>

        {nearbyEmergency.length > 0 ? (
          <span
            className="map-top-emergency"
            title="Active emergency responders within reach of detected hotspots"
          >
            <span className="map-green-dot" /> {nearbyEmergency.length}{" "}
            emergency responder(s) nearby
          </span>
        ) : null}

        <span>{isGoogleLayer ? "Google Maps API / VIIRS" : "NASA FIRMS / VIIRS"}</span>
      </div>

      {/* Map Navigation Controls */}
      <div className="map-controls">
        <button title="Zoom in" aria-label="Zoom in" onClick={handleZoomIn}>
          <Plus size={17} />
        </button>
        <button title="Zoom out" aria-label="Zoom out" onClick={handleZoomOut}>
          <Minus size={17} />
        </button>
        <button
          title="Fit selected area"
          aria-label="Fit selected area"
          onClick={handleFitBounds}
        >
          <Crosshair size={17} />
        </button>
      </div>

      {/* Basemap Switcher */}
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

      {/* Legend with Green Spot definition */}
      <div className="map-legend">
        {Object.entries(colors).map(([name, color]) => (
          <span key={name}>
            <i style={{ background: color }} />
            {name}
          </span>
        ))}
        {nearbyEmergency.length > 0 && (
          <span
            className="legend-emergency"
            title="Police & Fire stations within 25 km"
          >
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
