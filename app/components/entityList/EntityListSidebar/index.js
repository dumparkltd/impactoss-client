/*
 *
 * EntityListSidebar
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { filter } from 'lodash/collection';
import { isEqual } from 'lodash/lang';

import { FILTERS_PANEL, EDIT_PANEL } from 'containers/App/constants';
import { FILTER_FORM_MODEL, EDIT_FORM_MODEL } from 'containers/EntityListForm/constants';

import Scrollable from 'components/styled/Scrollable';
import ButtonToggle from 'components/buttons/ButtonToggle';
import SupTitle from 'components/SupTitle';

import EntityListForm from 'containers/EntityListForm';
import appMessages from 'containers/App/messages';

import EntityListSidebarGroups from './EntityListSidebarGroups';

import { makeFilterGroups } from './filterGroupsFactory';
import { makeEditGroups } from './editGroupsFactory';
import { makeActiveFilterOptions } from './filterOptionsFactory';
import { makeActiveEditOptions } from './editOptionsFactory';

import messages from './messages';

const Styled = styled.div``;
const Main = styled.div``;
const Header = styled.div`
  padding: 3em 2em 1em;
  background-color: ${palette('light', 2)}
`;
const ListEntitiesEmpty = styled.div`
  padding: 3em 2em 1em;
`;

export class EntityListSidebar extends React.Component { // eslint-disable-line react/prefer-stateless-function

  constructor() {
    super();
    this.state = {
      activeOption: null,
    };
  }
  componentWillMount() {
    this.setState({ activeOption: null });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activePanel !== this.props.activePanel) {
      // close and reset option panel
      this.setState({ activeOption: null });
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    // console.log('locationQuery.where',!isEqual(this.props.locationQuery.where, nextProps.locationQuery.where))
    // console.log('locationQuery.without',!isEqual(this.props.locationQuery.without, nextProps.locationQuery.without))
    // console.log('locationQuery.cat',!isEqual(this.props.locationQuery.cat, nextProps.locationQuery.cat))
    // console.log('locationQuery.catx',!isEqual(this.props.locationQuery.catx, nextProps.locationQuery.catx))
    // console.log('entityIdsSelected',this.props.entityIdsSelected !== nextProps.entityIdsSelected)
    // console.log('activePanel',this.props.activePanel !== nextProps.activePanel)
    // console.log('state',!isEqual(this.state, nextState));
    // TODO consider targeting specific query params, eg where, without, cat, catx but also recommendations, etc
    return !isEqual(this.props.locationQuery, nextProps.locationQuery)
      || this.props.entityIdsSelected !== nextProps.entityIdsSelected
      || this.props.activePanel !== nextProps.activePanel
      || !isEqual(this.state, nextState);
  }

  onShowForm = (option) => {
    this.setState({ activeOption: option.active ? null : option });
  };

  onHideForm = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ activeOption: null });
  };

  getSidebarButtons = () => ([
    {
      label: this.context.intl.formatMessage(messages.header.filterButton),
      panel: FILTERS_PANEL,
      icon: 'filter',
    },
    {
      label: this.context.intl.formatMessage(messages.header.editButton),
      panel: EDIT_PANEL,
      icon: 'edit',
    },
  ]);

  getFormButtons = (activePanel) => {
    const buttons = [{
      type: 'simple',
      title: (activePanel === EDIT_PANEL)
        ? this.context.intl.formatMessage(appMessages.buttons.cancel)
        : this.context.intl.formatMessage(appMessages.buttons.close),
      onClick: this.onHideForm,
    }];
    if (activePanel === EDIT_PANEL) {
      buttons.push({
        type: 'primary',
        title: this.context.intl.formatMessage(appMessages.buttons.assign),
        submit: true,
        // TODO consider making button inactive when form unchanged
      });
    }
    return buttons;
  }


  render() {
    // console.log('EntityListSidebar.render')
    const {
      filters,
      edits,
      taxonomies,
      connections,
      connectedTaxonomies,
      entitiesSorted,
      onAssign,
      canEdit,
      activePanel,
      onPanelSelect,
      locationQuery,
      formatLabel,
    } = this.props;

    const entityIdsSelected = this.props.entityIdsSelected && this.props.entityIdsSelected.toJS();
    const entitiesSelected = filter(entitiesSorted, (entity) => entityIdsSelected.indexOf(entity.id) >= 0);

    const activeOption = this.state.activeOption;
    const hasSelected = entitiesSelected && entitiesSelected.length > 0;
    const hasEntities = entitiesSorted && entitiesSorted.length > 0;
    const formModel = activePanel === FILTERS_PANEL ? FILTER_FORM_MODEL : EDIT_FORM_MODEL;

    let panelGroups = null;
    if (activePanel === FILTERS_PANEL) {
      panelGroups = makeFilterGroups(
        filters, taxonomies, connections, connectedTaxonomies, activeOption, {
          attributes: this.context.intl.formatMessage(messages.filterGroupLabel.attributes),
          taxonomies: this.context.intl.formatMessage(messages.filterGroupLabel.taxonomies),
          connections: this.context.intl.formatMessage(messages.filterGroupLabel.connections),
          connectedTaxonomies: this.context.intl.formatMessage(messages.filterGroupLabel.connectedTaxonomies),
        },
        formatLabel
      );
    } else if (activePanel === EDIT_PANEL && canEdit && hasSelected) {
      panelGroups = makeEditGroups(
        edits, taxonomies, connections, activeOption, {
          attributes: this.context.intl.formatMessage(messages.editGroupLabel.attributes),
          taxonomies: this.context.intl.formatMessage(messages.editGroupLabel.taxonomies),
          connections: this.context.intl.formatMessage(messages.editGroupLabel.connections),
        },
        formatLabel
      );
    }
    let formOptions = null;
    if (activeOption) {
      if (activePanel === FILTERS_PANEL) {
        formOptions = makeActiveFilterOptions(
          entitiesSorted,
          filters,
          activeOption,
          locationQuery,
          taxonomies,
          connections,
          connectedTaxonomies, {
            titlePrefix: this.context.intl.formatMessage(messages.filterFormTitlePrefix),
            without: this.context.intl.formatMessage(messages.filterFormWithoutPrefix),
          },
          formatLabel,
        );
      } else if (activePanel === EDIT_PANEL && canEdit && hasSelected) {
        formOptions = makeActiveEditOptions(
          entitiesSelected, edits, activeOption, taxonomies, connections, {
            title: `${this.context.intl.formatMessage(messages.editFormTitlePrefix)} ${entitiesSelected.length} ${this.context.intl.formatMessage(messages.editFormTitlePostfix)}`,
          }
        );
      }
    }

    return (
      <Styled>
        <Scrollable>
          <Header>
            {canEdit &&
              <ButtonToggle
                options={this.getSidebarButtons()}
                activePanel={activePanel}
                onSelect={onPanelSelect}
              />}
            {!canEdit &&
              <SupTitle title={this.context.intl.formatMessage(messages.header.filter)} />
            }
          </Header>
          <Main>
            { (activePanel === FILTERS_PANEL || (activePanel === EDIT_PANEL && hasSelected && hasEntities)) &&
              <EntityListSidebarGroups
                groups={panelGroups}
                onShowForm={this.onShowForm}
              />
            }
            { activePanel === EDIT_PANEL && !hasEntities &&
              <ListEntitiesEmpty>
                <FormattedMessage {...messages.entitiesNotFound} />
              </ListEntitiesEmpty>
            }
            { activePanel === EDIT_PANEL && hasEntities && !hasSelected &&
              <ListEntitiesEmpty>
                <FormattedMessage {...messages.entitiesNotSelected} />
              </ListEntitiesEmpty>
            }
          </Main>
        </Scrollable>
        { formOptions &&
          <EntityListForm
            model={formModel}
            formOptions={formOptions}
            buttons={this.getFormButtons(activePanel)}
            onCancel={this.onHideForm}
            onSubmit={activePanel === EDIT_PANEL
              ? (associations) => {
                // close and reset option panel
                this.setState({ activeOption: null });
                onAssign(associations, activeOption);
              }
              : null
            }
          />
        }
      </Styled>
    );
  }
}
EntityListSidebar.propTypes = {
  locationQuery: PropTypes.object,
  canEdit: PropTypes.bool,
  filters: PropTypes.object,
  edits: PropTypes.object,
  taxonomies: PropTypes.object,
  connections: PropTypes.object,
  connectedTaxonomies: PropTypes.object,
  entitiesSorted: PropTypes.array,
  entityIdsSelected: PropTypes.object,
  activePanel: PropTypes.string,
  onAssign: PropTypes.func.isRequired,
  onPanelSelect: PropTypes.func.isRequired,
  formatLabel: PropTypes.func.isRequired,
};

EntityListSidebar.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default EntityListSidebar;
