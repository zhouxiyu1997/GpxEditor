import { useEffect, useMemo, useState } from 'react';
import type { DragEndEvent, DivIcon, LatLngTuple, Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import type { EditorMode, TrackPoint } from '@/features/gpx-editor/model/types';
import { useGpxEditorStore } from '@/features/gpx-editor/store/useGpxEditorStore';

const DEFAULT_CENTER: LatLngTuple = [31.87532, 120.55538];
const LABEL_INTERVAL = 10;
const SELECTED_MARKER_ICON = L.divIcon({
  className: 'track-marker-shell',
  html: '<span class="selected-point-marker"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function TrackMap() {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const trackPoints = useGpxEditorStore(state => state.trackPoints);
  const selectedPointId = useGpxEditorStore(state => state.selectedPointId);
  const editMode = useGpxEditorStore(state => state.editMode);
  const fitBoundsToken = useGpxEditorStore(state => state.fitBoundsToken);
  const setSelectedPoint = useGpxEditorStore(state => state.setSelectedPoint);
  const movePoint = useGpxEditorStore(state => state.movePoint);
  const insertPointAfterSelected = useGpxEditorStore(state => state.insertPointAfterSelected);
  const requestFitBounds = useGpxEditorStore(state => state.requestFitBounds);
  const setError = useGpxEditorStore(state => state.setError);

  const polylinePoints = useMemo<LatLngTuple[]>(
    () => trackPoints.map(point => [point.lat, point.lon]),
    [trackPoints],
  );
  const selectedPoint = trackPoints.find(point => point.id === selectedPointId) || null;

  useEffect(() => {
    if (!map || fitBoundsToken === 0 || trackPoints.length === 0) {
      return;
    }

    if (trackPoints.length === 1) {
      map.flyTo([trackPoints[0].lat, trackPoints[0].lon], 14, {
        duration: 0.8,
      });
      return;
    }

    map.flyToBounds(polylinePoints, {
      padding: [48, 48],
      maxZoom: 16,
      duration: 0.9,
    });
  }, [fitBoundsToken, map, polylinePoints, trackPoints]);

  return (
    <div className="absolute inset-0">
      <MapContainer
        ref={setMap}
        center={DEFAULT_CENTER}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer attribution="OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler editMode={editMode} onInsert={insertPointAfterSelected} onInsertError={setError} />

        {polylinePoints.length > 1 ? (
          <Polyline pathOptions={{ color: '#ff7b39', weight: 4, opacity: 0.9 }} positions={polylinePoints} />
        ) : null}

        {trackPoints.map(point => (
          <TrackPointMarker
            key={point.id}
            point={point}
            isSelected={point.id === selectedPointId}
            onSelect={setSelectedPoint}
          />
        ))}

        {selectedPoint ? (
          <Marker
            draggable={editMode === 'drag'}
            eventHandlers={{
              click: () => setSelectedPoint(selectedPoint.id),
              dragend: event => handleDragEnd(event, selectedPoint, movePoint),
            }}
            icon={SELECTED_MARKER_ICON}
            position={[selectedPoint.lat, selectedPoint.lon]}
          />
        ) : null}
      </MapContainer>

      <MapFloatingControls
        canFitTrack={trackPoints.length > 0}
        map={map}
        onFitTrack={() => requestFitBounds()}
        onLocationError={setError}
      />
    </div>
  );
}

function TrackPointMarker({
  point,
  isSelected,
  onSelect,
}: {
  point: TrackPoint;
  isSelected: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <CircleMarker
      center={[point.lat, point.lon]}
      eventHandlers={{
        click: () => onSelect(point.id),
      }}
      pathOptions={{
        color: isSelected ? '#fff2d6' : '#fec89a',
        fillColor: isSelected ? '#ff7b39' : '#f97316',
        fillOpacity: isSelected ? 0.95 : 0.86,
        weight: isSelected ? 3 : 1.5,
      }}
      radius={isSelected ? 7 : 5}
    >
      {point.id % LABEL_INTERVAL === 0 || isSelected ? (
        <Tooltip className="track-tooltip" direction="top" offset={[0, -8]} permanent>
          #{point.id}
        </Tooltip>
      ) : null}
    </CircleMarker>
  );
}

function MapClickHandler({
  editMode,
  onInsert,
  onInsertError,
}: {
  editMode: EditorMode;
  onInsert: (coords: Pick<TrackPoint, 'lon' | 'lat'>) => void;
  onInsertError: (message: string) => void;
}) {
  useMapEvents({
    click(event) {
      if (editMode !== 'insert') {
        return;
      }

      try {
        onInsert({
          lon: event.latlng.lng,
          lat: event.latlng.lat,
        });
      } catch (error) {
        onInsertError(error instanceof Error ? error.message : '插点失败');
      }
    },
  });

  return null;
}

function MapFloatingControls({
  map,
  canFitTrack,
  onFitTrack,
  onLocationError,
}: {
  map: LeafletMap | null;
  canFitTrack: boolean;
  onFitTrack: () => void;
  onLocationError: (message: string) => void;
}) {
  function focusOnCurrentLocation() {
    if (!navigator.geolocation || !map) {
      onLocationError('当前浏览器不支持定位');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        map.flyTo([position.coords.latitude, position.coords.longitude], 14, {
          duration: 0.8,
        });
      },
      () => {
        onLocationError('定位失败，请检查浏览器权限');
      },
    );
  }

  return (
    <div className="pointer-events-auto absolute right-4 top-28 z-[500] flex flex-col gap-2 md:right-6 md:top-36">
      <MapControlButton disabled={!map} label="+" onClick={() => map?.zoomIn()} />
      <MapControlButton disabled={!map} label="-" onClick={() => map?.zoomOut()} />
      <MapControlButton disabled={!canFitTrack} label="Fit" onClick={onFitTrack} />
      <MapControlButton disabled={!map} label="GPS" onClick={focusOnCurrentLocation} />
    </div>
  );
}

function MapControlButton({
  disabled,
  label,
  onClick,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="h-12 min-w-12 rounded-2xl border border-white/15 bg-slate-950/78 px-3 text-sm font-semibold text-slate-50 shadow-panel backdrop-blur transition hover:border-white/30 hover:bg-slate-900/90 disabled:opacity-45"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function handleDragEnd(
  event: DragEndEvent,
  selectedPoint: TrackPoint,
  movePoint: (id: number, patch: Partial<TrackPoint>) => void,
) {
  const nextPosition = event.target.getLatLng();
  movePoint(selectedPoint.id, {
    lon: nextPosition.lng,
    lat: nextPosition.lat,
  });
}
