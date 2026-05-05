import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
  X,
} from 'lucide-react';

const TILE_SIZE = 256;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const DEFAULT_ZOOM = 15;
const DEFAULT_CENTER = { lat: 30.0444, lng: 31.2357 };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeLng = (lng) => {
  let nextLng = lng;

  while (nextLng < -180) {
    nextLng += 360;
  }

  while (nextLng > 180) {
    nextLng -= 360;
  }

  return nextLng;
};

const clampLat = (lat) => clamp(lat, -85.0511, 85.0511);

const latLngToWorld = (lat, lng, zoom) => {
  const scale = TILE_SIZE * 2 ** zoom;
  const sin = Math.sin((clampLat(lat) * Math.PI) / 180);

  return {
    x: ((normalizeLng(lng) + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
};

const worldToLatLng = (x, y, zoom) => {
  const scale = TILE_SIZE * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const mercatorY = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(mercatorY));

  return {
    lat: clampLat(lat),
    lng: normalizeLng(lng),
  };
};

const formatCoordinate = (value) => Number(value).toFixed(6);

const LocationPickerMap = ({ value, onChange }) => {
  const containerRef = useRef(null);
  const [center, setCenter] = useState(value || DEFAULT_CENTER);
  const [zoom, setZoom] = useState(value ? 16 : DEFAULT_ZOOM);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [geoStatus, setGeoStatus] = useState('');

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setSize({
        width: rect.width,
        height: rect.height,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const centerWorld = useMemo(
    () => latLngToWorld(center.lat, center.lng, zoom),
    [center.lat, center.lng, zoom]
  );

  const tiles = useMemo(() => {
    if (!size.width || !size.height) {
      return [];
    }

    const worldSize = TILE_SIZE * 2 ** zoom;
    const startTileX = Math.floor((centerWorld.x - size.width / 2) / TILE_SIZE);
    const endTileX = Math.floor((centerWorld.x + size.width / 2) / TILE_SIZE);
    const startTileY = Math.floor((centerWorld.y - size.height / 2) / TILE_SIZE);
    const endTileY = Math.floor((centerWorld.y + size.height / 2) / TILE_SIZE);
    const nextTiles = [];

    for (let tileY = startTileY - 1; tileY <= endTileY + 1; tileY += 1) {
      if (tileY < 0 || tileY >= 2 ** zoom) {
        continue;
      }

      for (let tileX = startTileX - 1; tileX <= endTileX + 1; tileX += 1) {
        const wrappedTileX = ((tileX % 2 ** zoom) + 2 ** zoom) % 2 ** zoom;
        const left = tileX * TILE_SIZE - (centerWorld.x - size.width / 2);
        const top = tileY * TILE_SIZE - (centerWorld.y - size.height / 2);

        nextTiles.push({
          key: `${zoom}-${tileX}-${tileY}`,
          left,
          top,
          url: `https://tile.openstreetmap.org/${zoom}/${wrappedTileX}/${tileY}.png`,
        });
      }
    }

    return nextTiles.filter((tile) => tile.left < size.width + TILE_SIZE && tile.top < size.height + TILE_SIZE && tile.left > -TILE_SIZE && tile.top > -TILE_SIZE && tile.url && centerWorld.x >= 0 && centerWorld.x <= worldSize);
  }, [centerWorld.x, centerWorld.y, size.height, size.width, zoom]);

  const markerPosition = useMemo(() => {
    if (!value || !size.width || !size.height) {
      return null;
    }

    const markerWorld = latLngToWorld(value.lat, value.lng, zoom);

    return {
      left: markerWorld.x - (centerWorld.x - size.width / 2),
      top: markerWorld.y - (centerWorld.y - size.height / 2),
    };
  }, [centerWorld.x, centerWorld.y, size.height, size.width, value, zoom]);

  const updateSelectedPoint = (lat, lng) => {
    const nextPoint = {
      lat: Number(formatCoordinate(lat)),
      lng: Number(formatCoordinate(lng)),
    };

    onChange(nextPoint);
    setCenter(nextPoint);
    setGeoStatus('');
  };

  const handleMapClick = (event) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const worldX = centerWorld.x - size.width / 2 + clickX;
    const worldY = centerWorld.y - size.height / 2 + clickY;
    const nextPoint = worldToLatLng(worldX, worldY, zoom);

    updateSelectedPoint(nextPoint.lat, nextPoint.lng);
  };

  const panMap = (dx, dy) => {
    const worldX = centerWorld.x + dx * (size.width * 0.35 || 120);
    const worldY = centerWorld.y + dy * (size.height * 0.35 || 120);
    const nextCenter = worldToLatLng(worldX, worldY, zoom);

    setCenter(nextCenter);
  };

  const changeZoom = (delta) => {
    setZoom((prev) => clamp(prev + delta, MIN_ZOOM, MAX_ZOOM));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('المتصفح الحالي لا يدعم تحديد الموقع.');
      return;
    }

    setGeoStatus('جارٍ تحديد موقعك الحالي...');

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextPoint = {
          lat: coords.latitude,
          lng: coords.longitude,
        };

        setZoom(16);
        updateSelectedPoint(nextPoint.lat, nextPoint.lng);
      },
      () => {
        setGeoStatus('تعذر الوصول إلى موقعك الحالي. يمكنك تحديد النقطة يدويًا.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-2 text-sm font-semibold transition hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          <LocateFixed size={16} />
          استخدم موقعي الحالي
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setGeoStatus('');
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <X size={16} />
            مسح النقطة
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <div
          ref={containerRef}
          onClick={handleMapClick}
          className="relative h-[320px] w-full cursor-crosshair overflow-hidden bg-zinc-200 dark:bg-zinc-800"
        >
          {tiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.url}
              alt=""
              draggable="false"
              className="pointer-events-none absolute select-none"
              style={{
                left: `${tile.left}px`,
                top: `${tile.top}px`,
                width: `${TILE_SIZE}px`,
                height: `${TILE_SIZE}px`,
              }}
            />
          ))}

          {markerPosition ? (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full text-red-500 drop-shadow-md"
              style={{
                left: `${markerPosition.left}px`,
                top: `${markerPosition.top}px`,
              }}
            >
              <MapPin size={34} className="fill-red-500 text-red-500" />
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-zinc-900 shadow-sm">
                اضغط على الخريطة لتحديد الموقع
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                changeZoom(1);
              }}
              className="rounded-xl bg-white/90 p-2 text-zinc-900 shadow-sm transition hover:bg-white"
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                changeZoom(-1);
              }}
              className="rounded-xl bg-white/90 p-2 text-zinc-900 shadow-sm transition hover:bg-white"
            >
              <Minus size={16} />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 grid grid-cols-3 gap-2">
            <span />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                panMap(0, -1);
              }}
              className="rounded-xl bg-white/90 p-2 text-zinc-900 shadow-sm transition hover:bg-white"
            >
              <ChevronUp size={16} />
            </button>
            <span />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                panMap(-1, 0);
              }}
              className="rounded-xl bg-white/90 p-2 text-zinc-900 shadow-sm transition hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="rounded-xl bg-white/85 px-3 py-2 text-center text-xs font-bold text-zinc-900 shadow-sm">
              Z{zoom}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                panMap(1, 0);
              }}
              className="rounded-xl bg-white/90 p-2 text-zinc-900 shadow-sm transition hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
            <span />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                panMap(0, 1);
              }}
              className="rounded-xl bg-white/90 p-2 text-zinc-900 shadow-sm transition hover:bg-white"
            >
              <ChevronDown size={16} />
            </button>
            <span />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/60 p-4 text-sm">
        {value ? (
          <div className="space-y-1 font-medium text-foreground">
            <p>الإحداثيات المحددة:</p>
            <p>خط العرض: {formatCoordinate(value.lat)}</p>
            <p>خط الطول: {formatCoordinate(value.lng)}</p>
          </div>
        ) : (
          <p className="font-medium text-muted-foreground">
            اختيار النقطة دقيق ومفيد للعرض على الخريطة لاحقًا، لكنه اختياري ويمكن الاكتفاء بالمدينة أو المنطقة فقط.
          </p>
        )}
        {geoStatus ? <p className="mt-2 font-medium text-muted-foreground">{geoStatus}</p> : null}
        <p className="mt-2 text-xs text-muted-foreground">الخريطة من بيانات OpenStreetMap.</p>
      </div>
    </div>
  );
};

export default LocationPickerMap;
