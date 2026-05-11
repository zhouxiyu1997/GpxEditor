import { useRef, useState, type ChangeEvent } from 'react';
import { useGpxEditorStore } from '@/features/gpx-editor/store/useGpxEditorStore';

export function EditorToolbar() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const trackName = useGpxEditorStore(state => state.trackMeta.name);
  const pointCount = useGpxEditorStore(state => state.trackPoints.length);
  const dirty = useGpxEditorStore(state => state.dirty);
  const hasTrack = pointCount > 0;
  const lastError = useGpxEditorStore(state => state.lastError);
  const importFile = useGpxEditorStore(state => state.importFile);
  const createDraft = useGpxEditorStore(state => state.createDraft);
  const clearTrack = useGpxEditorStore(state => state.clearTrack);
  const exportCurrentTrack = useGpxEditorStore(state => state.exportCurrentTrack);
  const setError = useGpxEditorStore(state => state.setError);
  const clearError = useGpxEditorStore(state => state.clearError);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.target.files || []);
    event.target.value = '';

    if (!file) {
      return;
    }

    setIsImporting(true);
    try {
      await importFile(file);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'GPX 导入失败');
    } finally {
      setIsImporting(false);
    }
  }

  function handleExport() {
    try {
      const { filename, content } = exportCurrentTrack();
      const blob = new Blob([content], { type: 'application/gpx+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      clearError();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'GPX 导出失败');
    }
  }

  function handleNewDraft() {
    createDraft();
    clearError();
  }

  function handleClearTrack() {
    clearTrack();
  }

  return (
    <header className="panel-surface p-4 md:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="editor-button-primary"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? '导入中...' : '导入 GPX'}
          </button>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".gpx,application/gpx+xml,text/xml,application/xml"
            onChange={handleFileChange}
          />
          <button className="editor-button" type="button" onClick={handleNewDraft}>
            新建草稿轨迹
          </button>
          <button className="editor-button" type="button" onClick={handleExport} disabled={!hasTrack}>
            导出 GPX
          </button>
          <button className="editor-button" type="button" onClick={handleClearTrack} disabled={!hasTrack}>
            清空
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="editor-chip">{hasTrack ? trackName : 'No Track Loaded'}</span>
          <span className="text-sm text-slate-200/90">点数 {pointCount}</span>
          <span className="text-sm text-slate-200/90">{dirty ? '存在未导出修改' : '当前状态已同步'}</span>
        </div>

        {lastError ? <p className="text-sm text-rose-200">{lastError}</p> : null}
      </div>
    </header>
  );
}
