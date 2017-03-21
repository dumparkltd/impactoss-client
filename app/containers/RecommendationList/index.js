/*
 *
 * RecommendationList
 *
 */

import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';

import EntityList from 'containers/EntityList';
import Page from 'components/Page';

import messages from './messages';

export class RecommendationList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    location: PropTypes.object.isRequired,
  }

  mapToEntityList = ({ id, attributes }) => ({
    id,
    title: attributes.title,
    linkTo: `/recommendations/${id}`,
    reference: id,
    status: attributes.draft ? 'draft' : null,
  })

  render() {
    return (
      <div>
        <Helmet
          title="SADATA - List Recommendations"
          meta={[
            { name: 'description', content: 'Description of RecommendationList' },
          ]}
        />
        <Page
          title={this.context.intl.formatMessage(messages.header)}
          actions={[]}
        >
          <Link to="recommendations/new">Add Recommendation</Link>
          <EntityList
            location={this.props.location}
            mapToEntityList={this.mapToEntityList}
            path="recommendations"
          />
        </Page>
      </div>
    );
  }
}

RecommendationList.contextTypes = {
  intl: React.PropTypes.object.isRequired,
};

export default RecommendationList;
