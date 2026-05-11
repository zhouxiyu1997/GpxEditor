import { useEffect } from 'react';
import { EditorSidebar } from '@/features/gpx-editor/components/EditorSidebar';
import { EditorToolbar } from '@/features/gpx-editor/components/EditorToolbar';
import { StatsBar } from '@/features/gpx-editor/components/StatsBar';
import { TrackMap } from '@/features/gpx-editor/map/TrackMap';
import { useGpxEditorStore } from '@/features/gpx-editor/store/useGpxEditorStore';

export function GpxEditorShell() {
  const hydrateFromCache = useGpxEditorStore(state => state.hydrateFromCache);

  useEffect(() => {
    hydrateFromCache();
  }, [hydrateFromCache]);

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-50">
      <TrackMap />
      <div className="pointer-events-none relative z-[400] flex min-h-screen flex-col gap-4 p-4 md:p-6">
        <div className="pointer-events-auto">
          <EditorToolbar />
        </div>
        <div className="flex flex-1 items-start justify-between gap-4">
          <div className="pointer-events-auto w-full max-w-sm">
            <EditorSidebar />
          </div>
        </div>
        <div className="pointer-events-auto">
          <StatsBar />
        </div>
      </div>
    </div>
  );
}
