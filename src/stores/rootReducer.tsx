import { combineReducers } from '@reduxjs/toolkit';
import tagsViewReducer from './tags-view.store';
import userReducer from './user.store';
import menuReducer from './menu.store';

const rootReducer = combineReducers({
  tagsView: tagsViewReducer,
  user: userReducer,
  menu: menuReducer
});

export default rootReducer;
