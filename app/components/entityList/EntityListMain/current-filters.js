import { find, forEach } from 'lodash/collection';
import { upperFirst } from 'lodash/string';

import { lowerCase } from 'utils/string';
import isNumber from 'utils/is-number';
import asList from 'utils/as-list';


export const currentFilters = ({
  filters,
  taxonomies,
  connections,
  connectedTaxonomies,
  locationQuery,
  onTagClick,
},
withoutMessage,
formatLabel
) => {
  let filterTags = [];
  if (filters.taxonomies && taxonomies) {
    filterTags = filterTags.concat(getCurrentTaxonomyFilters(
      filters.taxonomies,
      taxonomies,
      locationQuery,
      onTagClick,
      withoutMessage
    ));
  }
  if (filters.connectedTaxonomies && connectedTaxonomies) {
    filterTags = filterTags.concat(getCurrentConnectedTaxonomyFilters(
      filters.connectedTaxonomies,
      connectedTaxonomies,
      locationQuery,
      onTagClick
    ));
  }
  if (filters.connections && connections) {
    filterTags = filterTags.concat(getCurrentConnectionFilters(
      filters.connections,
      connections,
      locationQuery,
      onTagClick,
      withoutMessage,
      formatLabel
    ));
  }
  if (filters.attributes) {
    filterTags = filterTags.concat(getCurrentAttributeFilters(
      filters.attributes.options,
      locationQuery,
      onTagClick
    ));
  }
  return filterTags;
};
const getCategoryLabel = (category) => {
  const label = category.getIn(['attributes', 'short_title']) && category.getIn(['attributes', 'short_title']).trim().length > 0
    ? category.getIn(['attributes', 'short_title'])
    : category.getIn(['attributes', 'title']) || category.getIn(['attributes', 'name']);
  return label.length > 10 ? `${label.substring(0, 10)}...` : label;
};

const getConnectionLabel = (connection, value) => {
  const label = connection
    ? connection.getIn(['attributes', 'title'])
      || connection.getIn(['attributes', 'friendly_name'])
      || connection.getIn(['attributes', 'name'])
    : upperFirst(value);
  return label.length > 20 ? `${label.substring(0, 20)}...` : label;
};

const getCurrentTaxonomyFilters = (
  taxonomyFilters,
  taxonomies,
  locationQuery,
  onClick,
  withoutMessage
) => {
  const tags = [];
  if (locationQuery.get(taxonomyFilters.query)) {
    const locationQueryValue = locationQuery.get(taxonomyFilters.query);
    taxonomies.forEach((taxonomy) => {
      asList(locationQueryValue).forEach((queryValue) => {
        const value = queryValue.toString();
        if (taxonomy.getIn(['categories', value])) {
          const category = taxonomy.getIn(['categories', value]);
          tags.push({
            label: getCategoryLabel(category),
            type: 'taxonomies',
            id: taxonomy.get('id'),
            onClick: () => onClick({
              value,
              query: taxonomyFilters.query,
              checked: false,
            }),
          });
        }
      });
    });
  }
  if (locationQuery.get('without')) {
    const locationQueryValue = locationQuery.get('without');
    taxonomies.forEach((taxonomy) => {
      asList(locationQueryValue).forEach((queryValue) => {
        // numeric means taxonomy
        if (isNumber(queryValue) && taxonomy.get('id') === queryValue) {
          const value = queryValue.toString();
          tags.push({
            label: `${withoutMessage} ${lowerCase(taxonomy.getIn(['attributes', 'title']))}`,
            type: 'taxonomies',
            id: taxonomy.get('id'),
            without: true,
            onClick: () => onClick({
              value,
              query: 'without',
              checked: false,
            }),
          });
        }
      });
    });
  }
  return tags;
};


const getCurrentConnectedTaxonomyFilters = (
  taxonomyFilters,
  connectedTaxonomies,
  locationQuery,
  onClick
) => {
  const tags = [];
  if (locationQuery.get(taxonomyFilters.query)) {
    const locationQueryValue = locationQuery.get(taxonomyFilters.query);
    connectedTaxonomies.forEach((taxonomy) => {
      asList(locationQueryValue).forEach((queryValue) => {
        const valueSplit = queryValue.split(':');
        if (valueSplit.length > 0) {
          const value = valueSplit[1].toString();
          if (taxonomy.getIn(['categories', value])) {
            const category = taxonomy.getIn(['categories', value]);
            tags.push({
              label: getCategoryLabel(category),
              type: 'taxonomies',
              id: taxonomy.get('id'),
              onClick: () => onClick({
                value: queryValue,
                query: taxonomyFilters.query,
                checked: false,
              }),
            });
          }
        }
      });
    });
  }
  return tags;
};
const getCurrentConnectionFilters = (
  connectionFilters,
  connections,
  locationQuery,
  onClick,
  withoutMessage,
  formatLabel
) => {
  const tags = [];
  forEach(connectionFilters.options, (option) => {
    if (locationQuery.get(connectionFilters.query) && connections.get(option.path)) {
      const locationQueryValue = locationQuery.get(connectionFilters.query);
      asList(locationQueryValue).forEach((queryValue) => {
        const valueSplit = queryValue.split(':');
        if (valueSplit.length > 0) {
          if (option.path === valueSplit[0]) {
            const value = valueSplit[1].toString();
            const connection = connections.getIn([option.path, value]);
            if (connection) {
              tags.push({
                label: getConnectionLabel(connection, value),
                type: option.path,
                onClick: () => onClick({
                  value: queryValue,
                  query: connectionFilters.query,
                  checked: false,
                }),
              });
            }
          }
        }
      });
    }
  });

  if (locationQuery.get('without')) {
    const locationQueryValue = locationQuery.get('without');
    forEach(connectionFilters.options, (option) => {
      asList(locationQueryValue).forEach((queryValue) => {
        // numeric means taxonomy
        if (option.path === queryValue) {
          tags.push({
            label: `${withoutMessage} ${lowerCase(formatLabel(option.label))}`,
            type: option.path,
            without: true,
            onClick: () => onClick({
              value: queryValue,
              query: 'without',
              checked: false,
            }),
          });
        }
      });
    });
  }
  return tags;
};
const getCurrentAttributeFilters = (attributeFiltersOptions, locationQuery, onClick) => {
  const tags = [];
  if (locationQuery.get('where')) {
    const locationQueryValue = locationQuery.get('where');
    forEach(attributeFiltersOptions, (option) => {
      if (locationQueryValue) {
        asList(locationQueryValue).forEach((queryValue) => {
          const valueSplit = queryValue.split(':');
          if (valueSplit[0] === option.attribute && valueSplit.length > 0) {
            const value = valueSplit[1];
            if (option.extension) {
              // TODO: show display value not query queryValue
              tags.push({
                label: `${option.label}:${value}`,
                type: 'attributes',
                onClick: () => onClick({
                  value: queryValue,
                  query: 'where',
                  checked: false,
                }),
              });
            } else if (option.options) {
              const attribute = find(option.options, (o) => o.value.toString() === value);
              let label = attribute ? attribute.label : upperFirst(value);
              label = label.length > 10 ? `${label.substring(0, 10)}...` : label;
              tags.push({
                label,
                type: 'attributes',
                onClick: () => onClick({
                  value: queryValue,
                  query: 'where',
                  checked: false,
                }),
              });
            }
          }
        });
      }
    });
  }
  return tags;
};