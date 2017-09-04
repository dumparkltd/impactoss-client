import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import EntityListNestedReportItem from './EntityListNestedItem/EntityListNestedReportItem';
import EntityListNestedReportDateItem from './EntityListNestedItem/EntityListNestedReportDateItem';
import EntityListNestedNoItem from './EntityListNestedItem/EntityListNestedNoItem';

const ChildItems = styled.span`
  display: inline-block;
  width: 50%;
  vertical-align: top;
`;

export class EntityListNestedReportList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  render() {
    const { reports, dates, onEntityClick, isContributor, nestLevel } = this.props;
    return (
      <ChildItems>
        { isContributor && dates &&
          <EntityListNestedReportDateItem
            dates={dates}
          />
        }
        { reports.size === 0 &&
          <EntityListNestedNoItem type="reports" nestLevel={nestLevel} />
        }
        {
          reports.map((report, i) =>
            <EntityListNestedReportItem
              key={i}
              report={report}
              onEntityClick={() => onEntityClick(report.get('id'), 'reports')}
            />
          )
        }
      </ChildItems>
    );
  }
}

EntityListNestedReportList.propTypes = {
  reports: PropTypes.instanceOf(List),
  dates: PropTypes.instanceOf(Map),
  onEntityClick: PropTypes.func,
  isContributor: PropTypes.bool,
  nestLevel: PropTypes.number,
};

export default EntityListNestedReportList;
