import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { EditorSidebar } from '@/features/gpx-editor/components/EditorSidebar';
import { createDraftTrack } from '@/features/gpx-editor/model/gpx';
import { resetGpxEditorStore, useGpxEditorStore } from '@/features/gpx-editor/store/useGpxEditorStore';

describe('EditorSidebar', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetGpxEditorStore();
  });

  it('shows selected point details from the store', () => {
    const draft = createDraftTrack();
    useGpxEditorStore.setState({
      rawGpx: draft.rawGpx,
      trackMeta: draft.trackMeta,
      trackPoints: draft.trackPoints,
      selectedPointId: 0,
    });

    render(<EditorSidebar />);

    expect(screen.getByText('当前选中点')).toBeInTheDocument();
    expect(screen.getByText(/ID #0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '拖拽' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '插点' })).toBeEnabled();
  });

  it('surfaces validation errors when a delete range is malformed', async () => {
    const user = userEvent.setup();
    const draft = createDraftTrack();
    useGpxEditorStore.setState({
      rawGpx: draft.rawGpx,
      trackMeta: draft.trackMeta,
      trackPoints: draft.trackPoints,
      selectedPointId: 0,
    });
    render(<EditorSidebar />);

    await user.type(screen.getByPlaceholderText('输入 5-20 或单个编号'), 'abc');
    await user.click(screen.getByRole('button', { name: '删除区间' }));

    expect(screen.getByText('点编号格式不正确')).toBeInTheDocument();
  });
});
