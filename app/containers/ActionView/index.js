/*
 *
 * ActionView
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';

import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';

import { CONTENT_SINGLE } from 'containers/App/constants';

import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import EntityView from 'components/EntityView';

import {
  getEntity,
  getEntities,
  isReady,
  isUserManager,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import messages from './messages';

export class ActionView extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }
  componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }
  getHeaderMainFields = (entity, isManager) => ([ // fieldGroups
    { // fieldGroup
      fields: [
        {
          type: 'title',
          value: entity.attributes.title,
          isManager,
        },
      ],
    },
  ]);
  getHeaderAsideFields = (entity, isManager) => {
    if (!isManager) {
      return [
        {
          fields: [
            {
              type: 'referenceStatus',
              fields: [
                {
                  id: 'reference',
                  value: entity.id,
                  large: true,
                },
              ],
            },
          ],
        },
      ];
    }
    return [
      {
        fields: [
          {
            type: 'referenceStatus',
            fields: [
              {
                type: 'reference',
                value: entity.id,
              },
              {
                type: 'status',
                value: entity.attributes.draft,
              },
            ],
          },
          {
            type: 'meta',
            fields: [
              {
                label: this.context.intl.formatMessage(appMessages.attributes.meta.updated_at),
                value: this.context.intl.formatDate(new Date(entity.attributes.updated_at)),
              },
              {
                label: this.context.intl.formatMessage(appMessages.attributes.meta.updated_by),
                value: entity.user && entity.user.attributes.name,
              },
            ],
          },
        ],
      },
    ];
  }
  getBodyMainFields = (entity, recommendations, indicators) => ([
    {
      fields: [
        {
          type: 'description',
          value: entity.attributes.description,
        },
      ],
    },
    {
      label: 'Connections',
      icon: 'connections',
      fields: [
        {
          type: 'list',
          label: this.context.intl.formatMessage(appMessages.entities.recommendations.plural),
          entityType: 'recommendations',
          values: this.mapRecommendations(recommendations),
        },
        {
          type: 'list',
          label: this.context.intl.formatMessage(appMessages.entities.indicators.plural),
          entityType: 'indicators',
          values: this.mapIndicators(indicators),
        },
      ],
    },
  ]);
  getBodyAsideFields = (entity, taxonomies) => ([ // fieldGroups
    {
      type: 'dark',
      fields: [
        {
          type: 'date',
          value: entity.attributes.target_date && this.context.intl.formatDate(new Date(entity.attributes.target_date)),
          label: this.context.intl.formatMessage(appMessages.attributes.target_date),
          showEmpty: this.context.intl.formatMessage(appMessages.attributes.targetDateEmpty),
        },
      ],
    },
    { // fieldGroup
      label: this.context.intl.formatMessage(appMessages.entities.taxonomies.plural),
      icon: 'categories',
      fields: Object.values(taxonomies).map((taxonomy) => ({
        type: 'list',
        label: this.context.intl.formatMessage(appMessages.entities.taxonomies[taxonomy.id].plural),
        entityType: 'taxonomies',
        id: taxonomy.id,
        values: this.mapCategoryOptions(taxonomy.categories),
      })),
    },
  ]);

  getFields = (entity, isManager, recommendations, indicators, taxonomies) => ({
    header: {
      main: this.getHeaderMainFields(entity, isManager),
      aside: this.getHeaderAsideFields(entity, isManager),
    },
    body: {
      main: this.getBodyMainFields(entity, recommendations, indicators),
      aside: this.getBodyAsideFields(entity, taxonomies),
    },
  });

  mapIndicators = (indicators) =>
    Object.values(indicators).map((indicator) => ({
      label: indicator.attributes.title,
      linkTo: `/indicators/${indicator.id}`,
    }))

  mapRecommendations = (recommendations) =>
    Object.values(recommendations).map((recommendation) => ({
      label: recommendation.attributes.title,
      linkTo: `/recommendations/${recommendation.id}`,
    }))

  mapCategoryOptions = (categories) => categories
    ? Object.values(categories).map((cat) => ({
      label: cat.attributes.title,
      linkTo: `/category/${cat.id}`,
    }))
    : []

  render() {
    const { action, dataReady, isManager, recommendations, indicators, taxonomies } = this.props;

    const buttons = isManager
    ? [
      {
        type: 'edit',
        onClick: () => this.props.handleEdit(this.props.params.id),
      },
      {
        type: 'close',
        onClick: this.props.handleClose,
      },
    ]
    : [{
      type: 'close',
      onClick: this.props.handleClose,
    }];

    return (
      <div>
        <Helmet
          title={`${this.context.intl.formatMessage(messages.pageTitle)}: ${this.props.params.id}`}
          meta={[
            { name: 'description', content: this.context.intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Content>
          <ContentHeader
            title={this.context.intl.formatMessage(messages.pageTitle)}
            type={CONTENT_SINGLE}
            icon="actions"
            buttons={buttons}
          />
          { !action && !dataReady &&
            <Loading />
          }
          { !action && dataReady &&
            <div>
              <FormattedMessage {...messages.notFound} />
            </div>
          }
          { action && dataReady &&
            <EntityView
              fields={this.getFields(action, isManager, recommendations, indicators, taxonomies)}
            />
          }
        </Content>
      </div>
    );
  }
}

ActionView.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  action: PropTypes.object,
  dataReady: PropTypes.bool,
  isManager: PropTypes.bool,
  taxonomies: PropTypes.object,
  recommendations: PropTypes.object,
  indicators: PropTypes.object,
  params: PropTypes.object,
};

ActionView.contextTypes = {
  intl: React.PropTypes.object.isRequired,
};


const mapStateToProps = (state, props) => ({
  isManager: isUserManager(state),
  dataReady: isReady(state, { path: [
    'measures',
    'users',
    'taxonomies',
    'categories',
    'recommendations',
    'recommendation_measures',
    'measure_categories',
    'indicators',
    'measure_indicators',
  ] }),
  action: getEntity(
    state,
    {
      id: props.params.id,
      path: 'measures',
      out: 'js',
      extend: {
        type: 'single',
        path: 'users',
        key: 'last_modified_user_id',
        as: 'user',
      },
    },
  ),
  // all connected categories for all action-taggable taxonomies
  taxonomies: getEntities(
    state,
    {
      path: 'taxonomies',
      where: {
        tags_measures: true,
      },
      extend: {
        path: 'categories',
        key: 'taxonomy_id',
        reverse: true,
        connected: {
          path: 'measure_categories',
          key: 'category_id',
          where: {
            measure_id: props.params.id,
          },
        },
      },
      out: 'js',
    },
  ),
  // all connected recommendations
  recommendations: getEntities(
    state, {
      path: 'recommendations',
      out: 'js',
      connected: {
        path: 'recommendation_measures',
        key: 'recommendation_id',
        where: {
          measure_id: props.params.id,
        },
      },
    },
  ),
  // all connected indicators
  indicators: getEntities(
    state, {
      path: 'indicators',
      out: 'js',
      connected: {
        path: 'measure_indicators',
        key: 'indicator_id',
        where: {
          measure_id: props.params.id,
        },
      },
    },
  ),
});

function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      dispatch(loadEntitiesIfNeeded('measures'));
      dispatch(loadEntitiesIfNeeded('users'));
      dispatch(loadEntitiesIfNeeded('taxonomies'));
      dispatch(loadEntitiesIfNeeded('categories'));
      dispatch(loadEntitiesIfNeeded('measure_categories'));
      dispatch(loadEntitiesIfNeeded('recommendations'));
      dispatch(loadEntitiesIfNeeded('recommendation_measures'));
      dispatch(loadEntitiesIfNeeded('indicators'));
      dispatch(loadEntitiesIfNeeded('measure_indicators'));
      dispatch(loadEntitiesIfNeeded('user_roles'));
    },
    handleEdit: (actionId) => {
      dispatch(updatePath(`/actions/edit/${actionId}`));
    },
    handleClose: () => {
      dispatch(updatePath('/actions'));
      // TODO should be "go back" if history present or to actions list when not
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionView);
