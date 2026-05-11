import { create } from 'zustand';
import {
  computeStats,
  createDefaultTrackMeta,
  createDraftTrack,
  createEmptyStats,
  createInterpolatedPoint,
  deleteRange,
  formatTrackFilename,
  insertPointAfter,
  parseGpx,
  serializeGpx,
  updatePoint,
} from '@/features/gpx-editor/model/gpx';
import type { DraftTrackCenter, EditorMode, TrackMeta, TrackPoint, TrackStats } from '@/features/gpx-editor/model/types';

const STORAGE_KEY = 'gpx-editor:v1:last-track';

type GpxEditorState = {
  rawGpx: string;
  trackMeta: TrackMeta;
  trackPoints: TrackPoint[];
  stats: TrackStats;
  selectedPointId: number | null;
  editMode: EditorMode;
  dirty: boolean;
  lastError: string;
  fitBoundsToken: number;
  hasHydratedFromCache: boolean;
};

type GpxEditorActions = {
  importFile: (file: File) => Promise<void>;
  importText: (text: string) => void;
  createDraft: (center?: DraftTrackCenter) => void;
  clearTrack: () => void;
  setSelectedPoint: (id: number | null) => void;
  setEditMode: (mode: EditorMode) => void;
  movePoint: (id: number, patch: Partial<TrackPoint>) => void;
  insertPointAfterSelected: (coords: Pick<TrackPoint, 'lon' | 'lat'>) => void;
  deletePointRange: (start: number, end: number) => void;
  exportCurrentTrack: () => { filename: string; content: string };
  hydrateFromCache: () => void;
  requestFitBounds: () => void;
  clearError: () => void;
  setError: (message: string) => void;
};

type GpxEditorStore = GpxEditorState & GpxEditorActions;

function createDefaultState(): GpxEditorState {
  return {
    rawGpx: '',
    trackMeta: createDefaultTrackMeta(),
    trackPoints: [],
    stats: createEmptyStats(),
    selectedPointId: null,
    editMode: 'select',
    dirty: false,
    lastError: '',
    fitBoundsToken: 0,
    hasHydratedFromCache: false,
  };
}

export const useGpxEditorStore = create<GpxEditorStore>((set, get) => ({
  ...createDefaultState(),
  async importFile(file) {
    if (!file) {
      throw new Error('未选择 GPX 文件');
    }

    const text = await file.text();
    get().importText(text);
  },
  importText(text) {
    const parsed = parseGpx(text);
    applyTrackDocument(set, parsed.rawGpx, parsed.trackMeta, parsed.trackPoints, false);
    persistRawTrack(parsed.rawGpx);
  },
  createDraft(center) {
    const draft = createDraftTrack(center);
    applyTrackDocument(set, draft.rawGpx, draft.trackMeta, draft.trackPoints, true);
    persistRawTrack(draft.rawGpx);
  },
  clearTrack() {
    set({
      ...createDefaultState(),
      hasHydratedFromCache: true,
    });
    removePersistedTrack();
  },
  setSelectedPoint(id) {
    set({
      selectedPointId: id,
    });
  },
  setEditMode(mode) {
    set({
      editMode: mode,
    });
  },
  movePoint(id, patch) {
    const nextPoints = updatePoint(get().trackPoints, id, patch);
    applyPointMutation(set, get().trackMeta, nextPoints, id);
  },
  insertPointAfterSelected(coords) {
    const { selectedPointId, trackPoints } = get();

    if (selectedPointId === null) {
      throw new Error('请先选中一个轨迹点');
    }

    const currentIndex = trackPoints.findIndex(point => point.id === selectedPointId);

    if (currentIndex === -1 || currentIndex >= trackPoints.length - 1) {
      throw new Error('当前选中点后没有可插入的位置');
    }

    const insertedPoint = createInterpolatedPoint(trackPoints[currentIndex], trackPoints[currentIndex + 1], coords);
    const nextPoints = insertPointAfter(trackPoints, selectedPointId, insertedPoint);
    applyPointMutation(set, get().trackMeta, nextPoints, currentIndex + 1);
  },
  deletePointRange(start, end) {
    const nextPoints = deleteRange(get().trackPoints, start, end);
    const nextSelectedPointId = nextPoints.length === 0 ? null : Math.min(start, nextPoints.length - 1);
    applyPointMutation(set, get().trackMeta, nextPoints, nextSelectedPointId);
  },
  exportCurrentTrack() {
    const { trackMeta, trackPoints } = get();

    if (trackPoints.length === 0) {
      throw new Error('当前没有可导出的轨迹');
    }

    const content = serializeGpx({
      trackMeta,
      trackPoints,
    });

    set({
      rawGpx: content,
      dirty: false,
      lastError: '',
    });
    persistRawTrack(content);

    return {
      filename: `${formatTrackFilename(trackMeta.name)}.gpx`,
      content,
    };
  },
  hydrateFromCache() {
    if (get().hasHydratedFromCache) {
      return;
    }

    const cached = readPersistedTrack();
    if (!cached) {
      set({
        hasHydratedFromCache: true,
      });
      return;
    }

    try {
      const parsed = parseGpx(cached);
      applyTrackDocument(set, parsed.rawGpx, parsed.trackMeta, parsed.trackPoints, false, true);
    } catch (error) {
      removePersistedTrack();
      set({
        ...createDefaultState(),
        hasHydratedFromCache: true,
        lastError: error instanceof Error ? error.message : '缓存轨迹恢复失败',
      });
    }
  },
  requestFitBounds() {
    set(state => ({
      fitBoundsToken: state.fitBoundsToken + 1,
    }));
  },
  clearError() {
    set({
      lastError: '',
    });
  },
  setError(message) {
    set({
      lastError: message,
    });
  },
}));

export function resetGpxEditorStore() {
  useGpxEditorStore.setState(createDefaultState());
}

function applyTrackDocument(
  set: (partial: Partial<GpxEditorStore> | ((state: GpxEditorStore) => Partial<GpxEditorStore>)) => void,
  rawGpx: string,
  trackMeta: TrackMeta,
  trackPoints: TrackPoint[],
  dirty: boolean,
  hydratedFromCache = true,
) {
  set(state => ({
    rawGpx,
    trackMeta: createDefaultTrackMeta(trackMeta),
    trackPoints,
    stats: computeStats(trackPoints),
    selectedPointId: trackPoints[0]?.id ?? null,
    editMode: 'select',
    dirty,
    lastError: '',
    fitBoundsToken: state.fitBoundsToken + 1,
    hasHydratedFromCache: hydratedFromCache,
  }));
}

function applyPointMutation(
  set: (partial: Partial<GpxEditorStore> | ((state: GpxEditorStore) => Partial<GpxEditorStore>)) => void,
  trackMeta: TrackMeta,
  trackPoints: TrackPoint[],
  selectedPointId: number | null,
) {
  const rawGpx = serializeGpx({
    trackMeta,
    trackPoints,
  });

  persistRawTrack(rawGpx);
  set({
    rawGpx,
    trackPoints,
    stats: computeStats(trackPoints),
    selectedPointId,
    dirty: true,
    lastError: '',
  });
}

function persistRawTrack(rawGpx: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, rawGpx);
}

function readPersistedTrack(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
}

function removePersistedTrack() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
