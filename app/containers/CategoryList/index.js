/*
 *
 * Taxonomies
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import styled from 'styled-components';

import {
  mapToCategoryList,
  mapToTaxonomyList,
  getCategoryMaxCount,
} from 'utils/taxonomies';

// containers
import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import {
  getEntities,
  isReady,
  isUserManager,
} from 'containers/App/selectors';
import { CONTENT_LIST } from 'containers/App/constants';
import appMessages from 'containers/App/messages';

// components
import ContainerWithSidebar from 'components/styled/Container/ContainerWithSidebar';
import Container from 'components/styled/Container';
import Sidebar from 'components/styled/Sidebar';
import Scrollable from 'components/styled/Scrollable';
import Loading from 'components/Loading';

import ContentHeader from 'components/ContentHeader';
import CategoryListItems from 'components/categoryList/CategoryListItems';
import TaxonomySidebar from 'components/categoryList/TaxonomySidebar';

// relative
import messages from './messages';

const Content = styled.div`
  padding: 0 4em;
`;

export class CategoryList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  // make sure to load all data from server
  componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }
  componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }
  getTaxTitle = (id) =>
    this.context.intl.formatMessage(appMessages.entities.taxonomies[id].plural);

  getCountAttributes = (taxonomy) => {
    const attributes = [];
    if (taxonomy.attributes.tags_recommendations) {
      attributes.push({
        attribute: 'recommendations',
        label: this.context.intl.formatMessage(appMessages.entities.recommendations.plural),
      });
    }
    if (taxonomy.attributes.tags_sdgtargets) {
      attributes.push({
        attribute: 'sdgtargets',
        label: this.context.intl.formatMessage(appMessages.entities.sdgtargets.plural),
      });
    }
    if (taxonomy.attributes.tags_measures) {
      attributes.push({
        attribute: 'measures',
        label: this.context.intl.formatMessage(appMessages.entities.measures.plural),
      });
    }
    return attributes;
  }

  getListColumns = (taxonomy, categories, countAttributes) => {
    const TITLE_COL_RATIO = 0.4;
    const columns = [
      {
        type: 'title',
        header: this.context.intl.formatMessage(appMessages.entities.taxonomies[taxonomy.id].single),
        width: TITLE_COL_RATIO * 100,
      },
    ];
    return columns.concat(countAttributes.map((attribute, i) => ({
      type: 'count',
      header: attribute.label,
      width: ((1 - TITLE_COL_RATIO) / countAttributes.length) * 100,
      maxCount: getCategoryMaxCount(categories, attribute.attribute),
      countsIndex: i,
      entity: attribute.attribute,
    })));
  }
  render() {
    const { taxonomies, categories, dataReady, isManager, onPageLink, params } = this.props;
    const reference = typeof params.id !== 'undefined' ? parseInt(params.id, 10) : 1;
    const contentTitle = this.getTaxTitle(reference);
    const taxonomy = dataReady ? taxonomies[reference] : null;

    const buttons = dataReady && isManager
      ? [{
        type: 'add',
        title: this.context.intl.formatMessage(messages.add),
        onClick: () => this.props.handleNew(taxonomy.id),
      }]
      : null;

    const countAttributes = dataReady ? this.getCountAttributes(taxonomy) : [];

    return (
      <div>
        <Helmet
          title={`${this.context.intl.formatMessage(messages.supTitle)}: ${contentTitle}`}
          meta={[
            { name: 'description', content: this.context.intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Sidebar>
          <Scrollable>
            <TaxonomySidebar
              taxonomies={mapToTaxonomyList(taxonomies, onPageLink, reference, false)}
            />
          </Scrollable>
        </Sidebar>
        <ContainerWithSidebar>
          <Container>
            <Content>
              <ContentHeader
                type={CONTENT_LIST}
                icon="categories"
                supTitle={this.context.intl.formatMessage(messages.supTitle)}
                title={contentTitle}
                buttons={buttons}
              />
              { !dataReady &&
                <Loading />
              }
              { dataReady &&
                <CategoryListItems
                  columns={this.getListColumns(taxonomy, categories, countAttributes)}
                  categories={mapToCategoryList(categories, onPageLink, countAttributes)}
                />
              }
            </Content>
          </Container>
        </ContainerWithSidebar>
      </div>
    );
  }
}

CategoryList.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  onPageLink: PropTypes.func,
  handleNew: PropTypes.func,
  taxonomies: PropTypes.object,
  categories: PropTypes.object,
  dataReady: PropTypes.bool,
  isManager: PropTypes.bool,
  params: PropTypes.object,
};

CategoryList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  isManager: isUserManager(state),
  dataReady: isReady(state, { path: [
    'categories',
    'taxonomies',
    'recommendation_categories',
    'recommendations',
    'measure_categories',
    'measures',
    'sdgtarget_categories',
    'sdgtargets',
    'user_roles',
  ] }),
  taxonomies: getEntities(
    state,
    {
      path: 'taxonomies',
      out: 'js',
    },
  ),
  categories: getEntities(
    state,
    {
      out: 'js',
      path: 'categories',
      where: {
        taxonomy_id: typeof props.params.id !== 'undefined' ? props.params.id : 1,
      },
      extend: [
        {
          type: 'count',
          path: 'recommendation_categories',
          key: 'category_id',
          reverse: true,
          as: 'recommendations',
          connected: {
            path: 'recommendations',
            key: 'recommendation_id',
            forward: true,
          },
        },
        {
          type: 'count',
          path: 'measure_categories',
          key: 'category_id',
          reverse: true,
          as: 'measures',
          connected: {
            path: 'measures',
            key: 'measure_id',
            forward: true,
          },
        },
        {
          type: 'count',
          path: 'sdgtarget_categories',
          key: 'category_id',
          reverse: true,
          as: 'sdgtargets',
          connected: {
            path: 'sdgtargets',
            key: 'sdgtarget_id',
            forward: true,
          },
        },
      ],
    }
  ),
});

function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      dispatch(loadEntitiesIfNeeded('categories'));
      dispatch(loadEntitiesIfNeeded('taxonomies'));
      dispatch(loadEntitiesIfNeeded('recommendation_categories'));
      dispatch(loadEntitiesIfNeeded('recommendations'));
      dispatch(loadEntitiesIfNeeded('measure_categories'));
      dispatch(loadEntitiesIfNeeded('measures'));
      dispatch(loadEntitiesIfNeeded('sdgtarget_categories'));
      dispatch(loadEntitiesIfNeeded('sdgtargets'));
      dispatch(loadEntitiesIfNeeded('user_roles'));
    },
    handleNew: (taxonomyId) => {
      dispatch(updatePath(`/categories/${taxonomyId}/new`));
    },
    onPageLink: (path) => {
      dispatch(updatePath(path));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryList);
