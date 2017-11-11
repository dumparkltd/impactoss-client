/*
 *
 * CategoryNew constants
 *
 */

import { fromJS } from 'immutable';

export const SAVE = 'impactoss/CategoryNew/SAVE';

export const DEPENDENCIES = [
  'measures',
  'sdgtargets',
  'recommendations',
  'users',
  'user_roles',
  'categories',
  'taxonomies',
  'measure_categories',
  'sdgtarget_categories',
  'recommendation_categories',
];

export const FORM_INITIAL = fromJS({
  attributes: {
    title: '',
    description: '',
    short_title: '',
    url: '',
    manager_id: '',
    taxonomy_id: '',
    reference: '',
    user_only: false,
    draft: true,
  },
  associatedSdgTargets: [],
  associatedMeasures: [],
  associatedRecommendations: [],
  associatedUser: [],
});
