import { describe, expect, it } from 'vitest';
import {
  computeStats,
  createInterpolatedPoint,
  deleteRange,
  insertPointAfter,
  parseGpx,
  serializeGpx,
  updatePoint,
} from '@/features/gpx-editor/model/gpx';

const SAMPLE_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="unit-test" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Morning Run</name>
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
    <trkseg>
      <trkpt lat="31.87680" lon="120.55740">
        <time>2024-01-01T00:20:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

describe('gpx model', () => {
  it('parses and serializes GPX while preserving metadata and point order', () => {
    const parsed = parseGpx(SAMPLE_GPX);

    expect(parsed.trackMeta.name).toBe('Morning Run');
    expect(parsed.trackMeta.creator).toBe('unit-test');
    expect(parsed.trackPoints).toHaveLength(3);
    expect(parsed.trackPoints[2].elevation).toBeNull();

    const serialized = serializeGpx(parsed);
    const reparsed = parseGpx(serialized);

    expect(reparsed.trackMeta.name).toBe('Morning Run');
    expect(reparsed.trackPoints).toHaveLength(3);
    expect(reparsed.trackPoints[0].id).toBe(0);
    expect(reparsed.trackPoints[2].lon).toBeCloseTo(120.5574, 4);
  });

  it('computes stats when some points are missing elevation or time', () => {
    const { trackPoints } = parseGpx(SAMPLE_GPX);
    const stats = computeStats(trackPoints);

    expect(stats.totalDistance).toBeGreaterThan(0);
    expect(stats.totalClimb).toBe(10);
    expect(stats.totalDescent).toBe(0);
    expect(stats.duration).toBe(1200);
    expect(stats.avgSpeed).toBeGreaterThan(0);
    expect(stats.maxSpeed).toBeGreaterThan(0);
  });

  it('supports delete, update, and insert mutations with normalized ids', () => {
    const { trackPoints } = parseGpx(SAMPLE_GPX);
    const shortened = deleteRange(trackPoints, 1, 1);

    expect(shortened).toHaveLength(2);
    expect(shortened[1].id).toBe(1);

    const moved = updatePoint(shortened, 1, {
      lon: 120.66,
      lat: 31.99,
      elevation: 22,
    });

    expect(moved[1].lon).toBe(120.66);
    expect(moved[1].lat).toBe(31.99);
    expect(moved[1].elevation).toBe(22);

    const insertedPoint = createInterpolatedPoint(moved[0], moved[1], {
      lon: 120.61,
      lat: 31.93,
    });
    const inserted = insertPointAfter(moved, 0, insertedPoint);

    expect(inserted).toHaveLength(3);
    expect(inserted[1].id).toBe(1);
    expect(inserted[1].lon).toBe(120.61);
    expect(inserted[2].id).toBe(2);
  });
});
