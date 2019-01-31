import { combineReducers } from 'redux'
import userReducer from './reducers/userReducer.js'
import transferReducer from './reducers/transferReducer.js'

export default combineReducers({
  userReducer,
  transferReducer
})
