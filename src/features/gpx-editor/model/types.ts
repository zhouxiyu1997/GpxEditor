export type EditorMode = 'select' | 'drag' | 'insert';

export type TrackPoint = {
  id: number;
  lon: number;
  lat: number;
  elevation: number | null;
  time: string | null;
};

export type TrackMeta = {
  name: string;
  creator: string;
  version: '1.1';
  xmlns: string;
  xmlnsXsi: string;
  schemaLocation: string;
};

export type TrackStats = {
  totalDistance: number;
  totalClimb: number;
  totalDescent: number;
  duration: number | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
};

export type TrackDocument = {
  rawGpx: string;
  trackMeta: TrackMeta;
  trackPoints: TrackPoint[];
};

export type TrackPointPatch = Partial<Pick<TrackPoint, 'lon' | 'lat' | 'elevation' | 'time'>>;

export type DraftTrackCenter = {
  lon?: number;
  lat?: number;
  elevation?: number;
};
