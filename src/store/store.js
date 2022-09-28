import { configureStore } from '@reduxjs/toolkit'
import notesReducer from './features/notesSlice'
import notificationsReducer from './features/notificationsSlice'

export default configureStore({
  reducer: {
    notes: notesReducer,
    notifications: notificationsReducer
  }
})