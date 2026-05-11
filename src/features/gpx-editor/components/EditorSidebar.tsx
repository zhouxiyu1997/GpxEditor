import { useMemo, useState, type ReactNode } from 'react';
import type { EditorMode } from '@/features/gpx-editor/model/types';
import { useGpxEditorStore } from '@/features/gpx-editor/store/useGpxEditorStore';

export function EditorSidebar() {
  const [rangeText, setRangeText] = useState('');
  const trackPoints = useGpxEditorStore(state => state.trackPoints);
  const selectedPointId = useGpxEditorStore(state => state.selectedPointId);
  const editMode = useGpxEditorStore(state => state.editMode);
  const lastError = useGpxEditorStore(state => state.lastError);
  const setEditMode = useGpxEditorStore(state => state.setEditMode);
  const deletePointRange = useGpxEditorStore(state => state.deletePointRange);
  const setError = useGpxEditorStore(state => state.setError);

  const selectedPoint = trackPoints.find(point => point.id === selectedPointId) || null;
  const selectedPointIndex = selectedPointId === null ? -1 : trackPoints.findIndex(point => point.id === selectedPointId);
  const canInsertAfterSelected = selectedPointIndex >= 0 && selectedPointIndex < trackPoints.length - 1;
  const hasTrack = trackPoints.length > 0;

  const modeHint = useMemo(() => {
    if (!hasTrack) {
      return '先导入 GPX 或创建草稿轨迹。';
    }

    if (editMode === 'drag') {
      return '拖拽模式已开启：选中一个点后，直接在地图上拖动它。';
    }

    if (editMode === 'insert') {
      return '插点模式已开启：保持当前选中点，然后点击地图插入新点。';
    }

    return '选择模式：点击地图上的点位查看并切换当前选中项。';
  }, [editMode, hasTrack]);

  function handleDeleteRange() {
    try {
      const [start, end] = parseRange(rangeText);
      deletePointRange(start, end);
      setRangeText('');
    } catch (error) {
      setError(error instanceof Error ? error.message : '删除区间失败');
    }
  }

  return (
    <aside className="panel-surface flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">Editing</span>
        <h2 className="text-2xl font-semibold text-white">轨迹编辑</h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ModeButton active={editMode === 'select'} disabled={false} onClick={() => setEditMode('select')}>
          选择
        </ModeButton>
        <ModeButton active={editMode === 'drag'} disabled={!hasTrack} onClick={() => setEditMode('drag')}>
          拖拽
        </ModeButton>
        <ModeButton
          active={editMode === 'insert'}
          disabled={!canInsertAfterSelected}
          onClick={() => setEditMode('insert')}
        >
          插点
        </ModeButton>
      </div>

      <section className="panel-section flex flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-amber-100">当前选中点</h3>
        {selectedPoint ? (
          <div className="space-y-1 text-sm text-slate-100/90">
            <p>ID #{selectedPoint.id}</p>
            <p>经度 {selectedPoint.lon.toFixed(6)}</p>
            <p>纬度 {selectedPoint.lat.toFixed(6)}</p>
            <p>海拔 {selectedPoint.elevation === null ? '--' : `${selectedPoint.elevation.toFixed(1)} m`}</p>
            <p>时间 {selectedPoint.time ? new Date(selectedPoint.time).toLocaleString() : '--'}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-300/80">先在地图上点击一个轨迹点。</p>
        )}
      </section>

      <section className="panel-section flex flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold text-amber-100">区间删除</h3>
        <input
          className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-400/70 focus:border-amber-300/60"
          placeholder="输入 5-20 或单个编号"
          value={rangeText}
          onChange={event => setRangeText(event.target.value)}
        />
        <button className="editor-button" type="button" disabled={!hasTrack} onClick={handleDeleteRange}>
          删除区间
        </button>
      </section>

      <p className="text-sm leading-6 text-slate-200/90">{modeHint}</p>
      {lastError ? <p className="text-sm text-rose-200">{lastError}</p> : null}
    </aside>
  );
}

function ModeButton({
  active,
  disabled,
  children,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`editor-button px-3 py-2 ${active ? 'editor-button-active' : ''}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function parseRange(input: string): [number, number] {
  const normalized = input.trim();

  if (!normalized) {
    throw new Error('请输入要删除的点编号或区间');
  }

  if (!normalized.includes('-')) {
    const point = Number.parseInt(normalized, 10);
    if (!Number.isInteger(point)) {
      throw new Error('点编号格式不正确');
    }

    return [point, point];
  }

  const [startText, endText] = normalized.split('-').map(value => value.trim());
  const start = Number.parseInt(startText, 10);
  const end = Number.parseInt(endText, 10);

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    throw new Error('删除区间格式不正确');
  }

  return [start, end];
}
