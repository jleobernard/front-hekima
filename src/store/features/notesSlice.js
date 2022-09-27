import { createSlice } from '@reduxjs/toolkit'
import {get} from "../../utils/http";
import * as lodash from 'lodash';
import { notifyError } from './notificationsSlice';

export const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    notes: [],
    filter: {count: 20, offset: 0},
    loading: false,
    creating: false,
    hasMoreNotes: true,
    raz: false
  },
  reducers: {
    searchStarted: (state, action) => {
      state.filter = action.payload
      state.loading = true
    },
    searchDone: (state, action) => {
      state.loading = false
      const notes = action.payload.notes
      const raz = action.payload.raz
      state.notes = raz ? notes : [...state.notes, ...notes]
      state.hasMoreNotes = notes && notes.length > 0
      state.raz = false
    },
    searchError: (state) => {
      state.loading = false
    },
    selectNote: (state, action) => {
      state.selected = action.payload
    },
    saveNote: (state, action) => {
      const newNote = action.payload
      const index = lodash.findIndex(state.notes, n => n.uri === newNote.uri);
      if(index >=0) {
        state.notes[index] = newNote;
      } else {
        state.notes.unshift(newNote);
      }
      state.creating = false
    },
    cancelNoteCreation: state => {
      state.creating = false
    }
  }
})

export const { searchStarted, saveNote, cancelNoteCreation, searchDone, searchError, selectNote } = notesSlice.actions

export default notesSlice.reducer


export const launchSearch = (filter, raz) => {
  return async (dispatch) => {
    dispatch(searchStarted(filter))
    try {
      const notes = await get("/api/notes", filter)
      dispatch(searchDone({notes, raz}))
    } catch(err) {
      dispatch(searchError())
      dispatch(notifyError(err))
    }
  }
}

export const selectNotes = (state) => state.notes.notes
export const selectNotesLoading = (state) => state.notes.loading
export const selectHasMoreNotes = (state) => state.notes.hasMoreNotes
export const selectFilter = (state) => state.notes.filter
export const selectRaz = (state) => state.notes.raz
