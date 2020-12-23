/*
 *
 * RecommendationEdit constants
 *
 */
import { fromJS } from 'immutable';

export const SAVE = 'impactoss/RecommendationEdit/SAVE';

export const DEPENDENCIES = [
  'user_roles',
  'recommendations',
  'users',
  'categories',
  'taxonomies',
  'measures',
  'indicators',
  'recommendation_measures',
  'recommendation_categories',
  'recommendation_indicators',
  'measure_categories',
];

export const FORM_INITIAL = fromJS({
  id: '',
  attributes: {
    title: '',
    description: '',
    reference: '',
    accepted: '',
    response: '',
    draft: '',
  },
  associatedTaxonomies: {},
  associatedMeasures: [],
  associatedIndicators: [],
});
