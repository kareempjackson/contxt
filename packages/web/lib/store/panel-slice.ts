import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MemoryEntryType } from '@mycontxt/core';

type PanelMode = 'view' | 'edit' | 'create';

interface PanelState {
  entryId: string | null;
  mode: PanelMode;
  createType: MemoryEntryType | null;
}

const initialState: PanelState = {
  entryId: null,
  mode: 'view',
  createType: null,
};

export const panelSlice = createSlice({
  name: 'panel',
  initialState,
  reducers: {
    openEntry(state, action: PayloadAction<string>) {
      state.entryId = action.payload;
      state.mode = 'view';
      state.createType = null;
    },
    editEntry(state, action: PayloadAction<string>) {
      state.entryId = action.payload;
      state.mode = 'edit';
      state.createType = null;
    },
    startCreate(state, action: PayloadAction<MemoryEntryType>) {
      state.entryId = null;
      state.mode = 'create';
      state.createType = action.payload;
    },
    closePanel(state) {
      state.entryId = null;
      state.mode = 'view';
      state.createType = null;
    },
  },
});

export const { openEntry, editEntry, startCreate, closePanel } = panelSlice.actions;
export default panelSlice.reducer;
