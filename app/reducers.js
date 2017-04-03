/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */
import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import { browserHistory } from 'react-router';

import globalReducer from 'containers/App/reducer';
import languageProviderReducer from 'containers/LanguageProvider/reducer';
import entityListFilterReducer from 'containers/EntityListFilters/reducer';

/*
 * routeReducer
 *
 * The reducer merges route location changes into our immutable state.
 * The change is necessitated by moving to react-router-redux@4
 *
 */
const loginRoutes = ['/login', '/register'];
// Initial routing state
const routeInitialState = fromJS({
  locationBeforeTransitions: {
    ...browserHistory.getCurrentLocation(),
    pathnameOnAuthChange: loginRoutes.indexOf(browserHistory.getCurrentLocation().pathname) > -1
      ? '/'
      : browserHistory.getCurrentLocation().pathname,
    // stay on same path on authenticateSuccess unless on login or register
  },
});

/**
 * Merge route into the global application state and remember previous route
 */
function routeReducer(state = routeInitialState, action) {
  switch (action.type) {
    /* istanbul ignore next */
    case LOCATION_CHANGE:
      return state.merge({
        locationBeforeTransitions: {
          ...action.payload,
          pathnamePrevious: state.getIn(['locationBeforeTransitions', 'pathname']),
        },
      });
    default:
      return state;
  }
}

/**
 * Creates the main reducer with the asynchronously loaded ones
 */
export default function createReducer(asyncReducers) {
  return combineReducers({
    route: routeReducer,
    global: globalReducer,
    language: languageProviderReducer,
    entityListFilters: entityListFilterReducer,
    ...asyncReducers,
  });
}
