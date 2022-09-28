import { createSlice } from '@reduxjs/toolkit'

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    message: '',
    level: ''
  },
  reducers: {
    notifyInfo: (state, action) => {
      state.message = action.payload
      state.level = 'info'
    },
    notifyWarn: (state, action) => {
      state.message = action.payload
      state.level = 'warn'
    },
    notifyError: (state, action) => {
      state.message = action.payload
      state.level = 'error'
    },
  }
})

export const { notifyInfo, notifyWarn, notifyError } = notificationsSlice.actions

export default notificationsSlice.reducer

export const selectLevel = (state) => state.notifications.level
export const selectMessage = (state) => state.notifications.message