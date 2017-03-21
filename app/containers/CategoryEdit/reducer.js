/*
*
* CategoryEdit reducer
*
*/

import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { combineForms } from 'react-redux-form/immutable';

import {
  SAVE_SENDING,
  SAVE_ERROR,
  SAVE_SUCCESS,
} from './constants';

const initialState = fromJS({
  id: null,
  saveSending: false,
  saveSuccess: false,
  saveError: false,
});

function categoryEditReducer(state = initialState, action) {
  switch (action.type) {
    case SAVE_SENDING:
      return state
        .set('saveSending', true)
        .set('saveSuccess', false)
        .set('saveError', false);
    case SAVE_SUCCESS:
      return state
        .set('saveSending', false)
        .set('saveSuccess', true);
    case SAVE_ERROR:
      return state
        .set('saveSending', false)
        .set('saveError', action.error);
    default:
      return state;
  }
}

// tim: I don't know how to pull from the global state to set these now, It doesn't seem to be possible
const categoryForm = fromJS({
  title: '',
  description: '',
  short_title: '',
  url: '',
  taxonomy_id: '',
});

export default combineReducers({
  page: categoryEditReducer,
  form: combineForms({
    category: categoryForm,
  }, 'categoryEdit.form'),
});