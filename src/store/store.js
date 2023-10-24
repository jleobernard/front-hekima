import { configureStore } from '@reduxjs/toolkit'
import notificationsReducer from './features/notificationsSlice'

export default configureStore({
  reducer: {
    notifications: notificationsReducer
  }
})