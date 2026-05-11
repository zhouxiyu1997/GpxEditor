import { useGpxEditorStore } from '@/features/gpx-editor/store/useGpxEditorStore';

export function StatsBar() {
  const stats = useGpxEditorStore(state => state.stats);

  return (
    <footer className="panel-surface p-4">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="总距离" value={formatDistance(stats.totalDistance)} />
        <StatCard label="总爬升" value={formatElevation(stats.totalClimb)} />
        <StatCard label="总下降" value={formatElevation(stats.totalDescent)} />
        <StatCard label="总时长" value={formatDuration(stats.duration)} />
        <StatCard label="平均速度" value={formatSpeed(stats.avgSpeed)} />
        <StatCard label="最大速度" value={formatSpeed(stats.maxSpeed)} />
      </div>
    </footer>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-section flex flex-col gap-2 p-4">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/80">{label}</span>
      <strong className="text-xl font-semibold text-white">{value}</strong>
    </div>
  );
}

function formatDistance(value: number): string {
  if (value <= 0) {
    return '0 m';
  }

  return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${value.toFixed(0)} m`;
}

function formatElevation(value: number): string {
  return `${Math.max(0, value).toFixed(0)} m`;
}

function formatDuration(value: number | null): string {
  if (!value) {
    return '--';
  }

  const totalSeconds = Math.round(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map(unit => String(unit).padStart(2, '0')).join(':');
}

function formatSpeed(value: number | null): string {
  if (!value) {
    return '--';
  }

  return `${(value * 3.6).toFixed(2)} km/h`;
}
