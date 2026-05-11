import { beforeEach, describe, expect, it } from 'vitest';
import { resetGpxEditorStore, useGpxEditorStore } from '@/features/gpx-editor/store/useGpxEditorStore';

const SAMPLE_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="unit-test" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Store Test Track</name>
    <trkseg>
      <trkpt lat="31.87532" lon="120.55538">
        <ele>5</ele>
        <time>2024-01-01T00:00:00Z</time>
      </trkpt>
      <trkpt lat="31.87600" lon="120.55620">
        <ele>15</ele>
        <time>2024-01-01T00:10:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

describe('useGpxEditorStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetGpxEditorStore();
  });

  it('imports text and keeps derived state in sync', () => {
    useGpxEditorStore.getState().importText(SAMPLE_GPX);
    const state = useGpxEditorStore.getState();

    expect(state.trackMeta.name).toBe('Store Test Track');
    expect(state.trackPoints).toHaveLength(2);
    expect(state.selectedPointId).toBe(0);
    expect(state.dirty).toBe(false);
    expect(state.stats.totalDistance).toBeGreaterThan(0);
    expect(window.localStorage.getItem('gpx-editor:v1:last-track')).toContain('Store Test Track');
  });

  it('updates points, inserts points, and exports a fresh GPX payload', () => {
    const store = useGpxEditorStore.getState();
    store.importText(SAMPLE_GPX);
    store.setSelectedPoint(0);
    store.movePoint(0, {
      lon: 120.6,
      lat: 31.9,
    });
    store.insertPointAfterSelected({
      lon: 120.58,
      lat: 31.89,
    });

    const exported = useGpxEditorStore.getState().exportCurrentTrack();
    const nextState = useGpxEditorStore.getState();

    expect(nextState.trackPoints).toHaveLength(3);
    expect(nextState.trackPoints[1].id).toBe(1);
    expect(nextState.dirty).toBe(false);
    expect(exported.filename).toBe('Store-Test-Track.gpx');
    expect(exported.content).toContain('<trkseg>');
  });

  it('hydrates from localStorage cache and clears invalid cache safely', () => {
    window.localStorage.setItem('gpx-editor:v1:last-track', SAMPLE_GPX);
    useGpxEditorStore.getState().hydrateFromCache();

    expect(useGpxEditorStore.getState().trackPoints).toHaveLength(2);

    window.localStorage.setItem('gpx-editor:v1:last-track', 'broken-gpx');
    resetGpxEditorStore();
    useGpxEditorStore.getState().hydrateFromCache();

    expect(useGpxEditorStore.getState().trackPoints).toHaveLength(0);
    expect(window.localStorage.getItem('gpx-editor:v1:last-track')).toBeNull();
    expect(useGpxEditorStore.getState().lastError).toBeTruthy();
  });
});
