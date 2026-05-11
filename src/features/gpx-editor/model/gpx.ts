import type { DraftTrackCenter, TrackDocument, TrackMeta, TrackPoint, TrackPointPatch, TrackStats } from './types';

const DEFAULT_NAMESPACE = 'http://www.topografix.com/GPX/1/1';
const DEFAULT_SCHEMA_LOCATION =
  'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd';
const EARTH_RADIUS_METERS = 6371000;

export function createDefaultTrackMeta(overrides: Partial<TrackMeta> = {}): TrackMeta {
  return {
    name: 'Untitled Track',
    creator: 'GPX Editor',
    version: '1.1',
    xmlns: DEFAULT_NAMESPACE,
    xmlnsXsi: 'http://www.w3.org/2001/XMLSchema-instance',
    schemaLocation: DEFAULT_SCHEMA_LOCATION,
    ...overrides,
  };
}

export function createEmptyStats(): TrackStats {
  return {
    totalDistance: 0,
    totalClimb: 0,
    totalDescent: 0,
    duration: null,
    avgSpeed: null,
    maxSpeed: null,
  };
}

export function normalizeTrackPoints(points: Array<Partial<TrackPoint>>): TrackPoint[] {
  return points.map((point, index) => ({
    id: index,
    lon: toFiniteNumber(point.lon, 0),
    lat: toFiniteNumber(point.lat, 0),
    elevation: toOptionalNumber(point.elevation),
    time: normalizeTime(point.time),
  }));
}

export function parseGpx(text: string): TrackDocument {
  if (!text.trim()) {
    throw new Error('GPX 内容为空');
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  const parserError = xmlDoc.querySelector('parsererror');

  if (parserError) {
    throw new Error('GPX 解析失败');
  }

  const root = xmlDoc.querySelector('gpx') || xmlDoc.getElementsByTagName('gpx')[0] || xmlDoc.documentElement;
  const track = root.getElementsByTagName('trk')[0];

  if (!track) {
    throw new Error('GPX 中未找到轨迹数据');
  }

  const trackMeta = createDefaultTrackMeta({
    name: readText(track.getElementsByTagName('name')[0]) || 'Untitled Track',
    creator: root.getAttribute('creator') || 'GPX Editor',
    version: '1.1',
    xmlns: root.getAttribute('xmlns') || DEFAULT_NAMESPACE,
    xmlnsXsi: root.getAttribute('xmlns:xsi') || 'http://www.w3.org/2001/XMLSchema-instance',
    schemaLocation: root.getAttribute('xsi:schemaLocation') || DEFAULT_SCHEMA_LOCATION,
  });

  const segments = Array.from(track.getElementsByTagName('trkseg'));
  const points: Array<Partial<TrackPoint>> = [];

  segments.forEach(segment => {
    Array.from(segment.getElementsByTagName('trkpt')).forEach(trackPoint => {
      points.push({
        lon: toFiniteNumber(trackPoint.getAttribute('lon'), 0),
        lat: toFiniteNumber(trackPoint.getAttribute('lat'), 0),
        elevation: toOptionalNumber(readText(trackPoint.getElementsByTagName('ele')[0])),
        time: normalizeTime(readText(trackPoint.getElementsByTagName('time')[0])),
      });
    });
  });

  return {
    rawGpx: text,
    trackMeta,
    trackPoints: normalizeTrackPoints(points),
  };
}

export function serializeGpx(document: Pick<TrackDocument, 'trackMeta' | 'trackPoints'>): string {
  const trackMeta = createDefaultTrackMeta(document.trackMeta);
  const trackPoints = normalizeTrackPoints(document.trackPoints);
  const pointNodes = trackPoints.map(point => {
    const children: string[] = [];

    if (point.elevation !== null) {
      children.push(`<ele>${escapeXml(String(point.elevation))}</ele>`);
    }

    if (point.time) {
      children.push(`<time>${escapeXml(point.time)}</time>`);
    }

    return `<trkpt lat="${escapeXml(String(point.lat))}" lon="${escapeXml(String(point.lon))}">${children.join(
      '',
    )}</trkpt>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<gpx version="${escapeXml(trackMeta.version)}" creator="${escapeXml(trackMeta.creator)}" xmlns="${escapeXml(
      trackMeta.xmlns,
    )}" xmlns:xsi="${escapeXml(trackMeta.xmlnsXsi)}" xsi:schemaLocation="${escapeXml(trackMeta.schemaLocation)}">`,
    '  <trk>',
    `    <name>${escapeXml(trackMeta.name)}</name>`,
    `    <trkseg>${pointNodes.join('')}</trkseg>`,
    '  </trk>',
    '</gpx>',
  ].join('\n');
}

export function computeStats(points: TrackPoint[]): TrackStats {
  if (points.length === 0) {
    return createEmptyStats();
  }

  let totalDistance = 0;
  let totalClimb = 0;
  let totalDescent = 0;
  let maxSpeed = 0;

  points.forEach((point, index) => {
    if (index === 0) {
      return;
    }

    const previous = points[index - 1];
    const distance = getSegmentDistance(previous, point);
    totalDistance += distance;

    if (previous.elevation !== null && point.elevation !== null) {
      const elevationDelta = point.elevation - previous.elevation;
      if (elevationDelta > 0) {
        totalClimb += elevationDelta;
      } else if (elevationDelta < 0) {
        totalDescent += Math.abs(elevationDelta);
      }
    }

    const durationSeconds = getSegmentDuration(previous.time, point.time);
    if (durationSeconds && durationSeconds > 0) {
      maxSpeed = Math.max(maxSpeed, distance / durationSeconds);
    }
  });

  const duration = getTrackDuration(points);
  return {
    totalDistance,
    totalClimb,
    totalDescent,
    duration,
    avgSpeed: duration && duration > 0 ? totalDistance / duration : null,
    maxSpeed: maxSpeed > 0 ? maxSpeed : null,
  };
}

export function deleteRange(points: TrackPoint[], start: number, end: number): TrackPoint[] {
  const safeStart = Number.parseInt(String(start), 10);
  const safeEnd = Number.parseInt(String(end), 10);

  if (
    !Number.isInteger(safeStart) ||
    !Number.isInteger(safeEnd) ||
    safeStart < 0 ||
    safeEnd < 0 ||
    safeStart > safeEnd ||
    safeEnd >= points.length
  ) {
    throw new Error('删除区间无效');
  }

  return normalizeTrackPoints(points.filter((_, index) => index < safeStart || index > safeEnd));
}

export function updatePoint(points: TrackPoint[], id: number, patch: TrackPointPatch): TrackPoint[] {
  const index = points.findIndex(point => point.id === id);

  if (index === -1) {
    throw new Error('未找到要更新的轨迹点');
  }

  return normalizeTrackPoints(
    points.map(point => {
      if (point.id !== id) {
        return point;
      }

      return {
        ...point,
        lon: patch.lon === undefined ? point.lon : toFiniteNumber(patch.lon, point.lon),
        lat: patch.lat === undefined ? point.lat : toFiniteNumber(patch.lat, point.lat),
        elevation: patch.elevation === undefined ? point.elevation : toOptionalNumber(patch.elevation),
        time: patch.time === undefined ? point.time : normalizeTime(patch.time),
      };
    }),
  );
}

export function insertPointAfter(points: TrackPoint[], id: number, point: Partial<TrackPoint>): TrackPoint[] {
  const index = points.findIndex(trackPoint => trackPoint.id === id);

  if (index === -1) {
    throw new Error('未找到插入位置');
  }

  if (index === points.length - 1) {
    throw new Error('当前点后没有可插入的位置');
  }

  const nextPoints: Array<TrackPoint | Partial<TrackPoint>> = [...points];
  nextPoints.splice(index + 1, 0, {
    lon: toFiniteNumber(point.lon, points[index].lon),
    lat: toFiniteNumber(point.lat, points[index].lat),
    elevation: toOptionalNumber(point.elevation),
    time: normalizeTime(point.time),
  });

  return normalizeTrackPoints(nextPoints);
}

export function createInterpolatedPoint(
  previousPoint: TrackPoint,
  nextPoint: TrackPoint,
  coords: Pick<TrackPoint, 'lon' | 'lat'>,
): Partial<TrackPoint> {
  return {
    lon: toFiniteNumber(coords.lon, previousPoint.lon),
    lat: toFiniteNumber(coords.lat, previousPoint.lat),
    elevation: interpolateNumber(previousPoint.elevation, nextPoint.elevation),
    time: interpolateTime(previousPoint.time, nextPoint.time),
  };
}

export function createDraftTrack(center: DraftTrackCenter = {}): TrackDocument {
  const baseLon = toFiniteNumber(center.lon, 120.55538);
  const baseLat = toFiniteNumber(center.lat, 31.87532);
  const elevation = toFiniteNumber(center.elevation, 0);
  const startedAt = new Date();
  const finishedAt = new Date(startedAt.getTime() + 5 * 60 * 1000);
  const trackMeta = createDefaultTrackMeta({
    name: 'Draft Track',
  });
  const trackPoints = normalizeTrackPoints([
    {
      lon: baseLon - 0.002,
      lat: baseLat,
      elevation,
      time: startedAt.toISOString(),
    },
    {
      lon: baseLon + 0.002,
      lat: baseLat,
      elevation,
      time: finishedAt.toISOString(),
    },
  ]);

  return {
    rawGpx: serializeGpx({
      trackMeta,
      trackPoints,
    }),
    trackMeta,
    trackPoints,
  };
}

export function formatTrackFilename(name: string): string {
  const safeName = Array.from(name.trim() || 'track')
    .map(character => {
      const code = character.charCodeAt(0);
      if (code < 32 || '<>:"/\\|?*'.includes(character)) {
        return '-';
      }

      return character;
    })
    .join('')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return safeName || 'track';
}

function getTrackDuration(points: TrackPoint[]): number | null {
  const validTimes = points
    .map(point => toDate(point.time))
    .filter((value): value is Date => value !== null)
    .map(date => date.getTime());

  if (validTimes.length < 2) {
    return null;
  }

  const duration = (validTimes[validTimes.length - 1] - validTimes[0]) / 1000;
  return duration > 0 ? duration : null;
}

function getSegmentDistance(previous: TrackPoint, next: TrackPoint): number {
  const surfaceDistance = haversineDistance(previous.lat, previous.lon, next.lat, next.lon);
  const elevationDelta = toFiniteNumber(next.elevation, 0) - toFiniteNumber(previous.elevation, 0);

  return Math.sqrt(surfaceDistance ** 2 + elevationDelta ** 2);
}

function getSegmentDuration(previousTime: string | null, nextTime: string | null): number | null {
  const previous = toDate(previousTime);
  const next = toDate(nextTime);

  if (!previous || !next) {
    return null;
  }

  const duration = (next.getTime() - previous.getTime()) / 1000;
  return duration > 0 ? duration : null;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const startLat = toRadians(lat1);
  const endLat = toRadians(lat2);
  const a =
    Math.sin(deltaLat / 2) ** 2 + Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function interpolateNumber(previous: number | null, next: number | null): number | null {
  if (previous === null && next === null) {
    return null;
  }

  if (previous === null) {
    return next;
  }

  if (next === null) {
    return previous;
  }

  return (previous + next) / 2;
}

function interpolateTime(previous: string | null, next: string | null): string | null {
  const previousDate = toDate(previous);
  const nextDate = toDate(next);

  if (!previousDate && !nextDate) {
    return null;
  }

  if (!previousDate) {
    return nextDate?.toISOString() || null;
  }

  if (!nextDate) {
    return previousDate.toISOString();
  }

  return new Date((previousDate.getTime() + nextDate.getTime()) / 2).toISOString();
}

function readText(node: Element | undefined): string {
  return node?.textContent?.trim() || '';
}

function normalizeTime(value: string | Date | null | undefined): string | null {
  const date = toDate(value);
  return date ? date.toISOString() : null;
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number.parseFloat(String(value));
  return Number.isFinite(number) ? number : null;
}

function toFiniteNumber(value: unknown, fallback: number): number {
  const number = Number.parseFloat(String(value));
  return Number.isFinite(number) ? number : fallback;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
