import { find, forEach, map } from 'lodash/collection';
import { optionChecked, attributeOptionChecked } from './utils';

export const makeActiveFilterOptions = (entities, props) => {
  // create filterOptions
  switch (props.activeFilterOption.group) {
    case 'taxonomies':
      return makeTaxonomyFilterOptions(entities, props);
    case 'connectedTaxonomies':
      return makeConnectedTaxonomyFilterOptions(entities, props);
    case 'connections':
      return makeConnectionFilterOptions(entities, props);
    case 'attributes':
      return makeAttributeFilterOptions(entities, props);
    default:
      return null;
  }
};

export const makeAttributeFilterOptions = (entities, { filters, activeFilterOption, location }) => {
  const locationQuery = location.query;

  const filterOptions = {
    groupId: 'attributes',
    options: {},
  };
  // the attribute option
  const option = find(filters.attributes.options, (o) => o.attribute === activeFilterOption.optionId);
  if (option) {
    const locationQueryValue = locationQuery.where;
    if (entities.length === 0) {
      if (locationQueryValue && option.options) {
        forEach(Array.isArray(locationQueryValue) ? locationQueryValue : [locationQueryValue], (queryValue) => {
          if (attributeOptionChecked(queryValue, option.attribute)) {
            const locationQueryValueAttribute = queryValue.split(':');
            if (locationQueryValueAttribute.length > 1) {
              const locationAttribute = locationQueryValueAttribute[1];
              forEach(option.options, (attribute) => {
                if (attribute.value.toString() === locationAttribute) {
                  filterOptions.options[attribute.value] = {
                    label: attribute.label ? attribute.label : attribute.value,
                    value: `${option.attribute}:${attribute.value}`,
                    count: 0,
                    query: 'where',
                    checked: true,
                  };
                }
              });
            }
          }
        });
      }
    } else {
      forEach(Object.values(entities), (entity) => {
        // filterOptions.title = filterOptions.title || option.label;
        // filterOptions.search = filterOptions.search || option.search;
        if (typeof entity.attributes[option.attribute] !== 'undefined' && entity.attributes[option.attribute] !== null) {
          const value = entity.attributes[option.attribute].toString();
          const queryValue = `${option.attribute}:${value}`;
          // add connected entities if not present otherwise increase count
          if (option.extension && !!entity[option.extension.key]) {
            const extension = Object.values(entity[option.extension.key])[0];
            filterOptions.options[value] = {
              label: extension ? extension.attributes[option.extension.label] : value,
              value: queryValue,
              count: 1,
              query: 'where',
              checked: optionChecked(locationQueryValue, queryValue),
            };
          } else if (filterOptions.options[value]) {
            filterOptions.options[value].count += 1;
          } else if (option.options) {
            const attribute = find(option.options, (o) => o.value.toString() === value);
            filterOptions.options[value] = {
              label: attribute ? attribute.label : value,
              value: queryValue,
              count: 1,
              query: 'where',
              checked: optionChecked(locationQueryValue, queryValue),
            };
          }
        } else if (option.extension && option.extension.without) {
          if (filterOptions.options.without) {
            // no connection present
            // add without option
            filterOptions.options.without.count += 1;
          } else {
            const queryValue = `${option.attribute}:null`;
            filterOptions.options.without = {
              label: `Without ${option.label}`,
              value: queryValue,
              count: 1,
              query: 'where',
              checked: optionChecked(locationQueryValue, queryValue),
            };
          }
        }
      });  // for each entities
    } // if (entities.length === 0) {
  } // if option
  return filterOptions;
};

//
//
//
export const makeTaxonomyFilterOptions = (entities, { filters, taxonomies, activeFilterOption, location }) => {
  const locationQuery = location.query;

  const filterOptions = {
    groupId: 'taxonomies',
    search: filters.taxonomies.search,
    options: {},
  };
  // get the active taxonomy
  const taxonomy = taxonomies[parseInt(activeFilterOption.optionId, 10)];
  if (taxonomy) {
    if (entities.length === 0) {
      if (locationQuery[filters.taxonomies.query]) {
        const locationQueryValue = locationQuery[filters.taxonomies.query];
        forEach(Array.isArray(locationQueryValue) ? locationQueryValue : [locationQueryValue], (queryValue) => {
          const value = parseInt(queryValue, 10);
          if (taxonomy.categories[value]) {
            filterOptions.options[value] = {
              label: taxonomy.categories[value].attributes.title || taxonomy.categories[value].attributes.name,
              value,
              count: 0,
              query: filters.taxonomies.query,
              checked: true,
            };
          }
        });
      }
      // check for checked without options
      if (locationQuery.without) {
        const locationQueryValue = locationQuery.without;
        forEach(Array.isArray(locationQueryValue) ? locationQueryValue : [locationQueryValue], (queryValue) => {
          // numeric means taxonomy
          if (!isNaN(parseFloat(queryValue)) && isFinite(queryValue) && taxonomy.id === queryValue) {
            const value = parseInt(queryValue, 10);
            filterOptions.options[value] = {
              label: `Without ${taxonomy.attributes.title}`,
              value,
              count: 0,
              query: 'without',
              checked: true,
            };
          }
        });
      }
    } else {
      forEach(Object.values(entities), (entity) => {
        // if entity has taxonomies
        if (entity.taxonomies) {
          // add categories from entities if not present otherwise increase count
          const categoryIds = map(map(Object.values(entity.taxonomies), 'attributes'), 'category_id');
          forEach(categoryIds, (catId) => {
            // if category is of current taxonomy
            if (taxonomy.categories && Object.keys(taxonomy.categories).indexOf(catId.toString()) > -1) {
              // if taxonomy active add filter option
              if (activeFilterOption.optionId === taxonomy.id.toString()) {
                filterOptions.title = filterOptions.title || taxonomy.attributes.title;
                // if category already added
                if (filterOptions.options[catId]) {
                  filterOptions.options[catId].count += 1;
                } else {
                  filterOptions.options[catId] = {
                    label: taxonomy.categories[catId].attributes.title || taxonomy.categories[catId].attributes.name,
                    value: catId,
                    count: 1,
                    query: filters.taxonomies.query,
                    checked: optionChecked(locationQuery[filters.taxonomies.query], catId),
                  };
                }
              }
            }
          });
        } else if (filterOptions.options.without) {
          filterOptions.options.without.count += 1;
        } else {
          filterOptions.options.without = {
            label: `Without ${taxonomy.attributes.title}`,
            value: taxonomy.id,
            count: 1,
            query: 'without',
            checked: optionChecked(locationQuery.without, taxonomy.id),
          };
        }
      });  // for each entities
    }
  }
  return filterOptions;
};

//
//
//
export const makeConnectionFilterOptions = (entities, { filters, connections, activeFilterOption, location }) => {
  const locationQuery = location.query;

  const filterOptions = {
    groupId: 'connections',
    options: {},
  };
  // get the active option
  const option = find(filters.connections.options, (o) => o.path === activeFilterOption.optionId);
  // if option active
  if (option) {
    // if no entities found show any active options
    if (entities.length === 0) {
      if (locationQuery[option.query]) {
        const locationQueryValue = locationQuery[option.query];
        forEach(Array.isArray(locationQueryValue) ? locationQueryValue : [locationQueryValue], (queryValue) => {
          const value = parseInt(queryValue, 10);
          const label = connections[option.path] && connections[option.path][value]
            ? connections[option.path][value].attributes.title
            : value;
          filterOptions.options[value] = {
            label,
            value,
            count: 0,
            query: option.query,
            checked: true,
          };
        });
      }
      // also check for active without options
      if (locationQuery.without) {
        const locationQueryValue = locationQuery.without;
        forEach(Array.isArray(locationQueryValue) ? locationQueryValue : [locationQueryValue], (queryValue) => {
          if (option.query === queryValue) {
            filterOptions.options[queryValue] = {
              label: `Without ${option.label}`,
              value: queryValue,
              count: 0,
              query: 'without',
              checked: true,
            };
          }
        });
      }
    } else {
      forEach(Object.values(entities), (entity) => {
        filterOptions.title = filterOptions.title || option.label;
        filterOptions.search = filterOptions.search || option.search;
        // if entity has connected entities
        if (entity[option.path]) {
          // add connected entities if not present otherwise increase count
          const connectedIds = {
            [option.path]: map(map(Object.values(entity[option.path]), 'attributes'), option.key),
          };
          forEach(connectedIds[option.path], (connectedId) => {
            const connection = connections[option.path][connectedId];
            // if not taxonomy already considered
            if (connection) {
              // if category already added
              if (filterOptions.options[connectedId]) {
                filterOptions.options[connectedId].count += 1;
              } else {
                filterOptions.options[connectedId] = {
                  label: connection.attributes.title || connection.attributes.name,
                  value: connectedId,
                  search: option.searchAttributes && option.searchAttributes.map((attribute) => connection.attributes[attribute]).join(),
                  count: 1,
                  query: option.query,
                  checked: optionChecked(locationQuery[option.query], connectedId),
                };
              }
            }
          });
        } else if (filterOptions.options.without) {
          // no connection present
          // add without option
          filterOptions.options.without.count += 1;
        } else {
          filterOptions.options.without = {
            label: `Without ${option.label}`,
            value: option.query,
            count: 1,
            query: 'without',
            checked: optionChecked(locationQuery.without, option.query),
          };
        }
      });  // for each entities
    }
  }
  return filterOptions;
};

// get connected category ids for taxonomy
const getConnectedCategoryIds = (entity, connection, taxonomy) => {
  const categoryIds = [];
  if (taxonomy.categories) {
    // the associated entities ids, eg recommendation ids
    const connectionIds = map(map(Object.values(entity[connection.path]), 'attributes'), connection.key);
    // for each category of active taxonomy
    forEach(Object.values(taxonomy.categories), (category) => {
      // we have saved the associated entities, eg recommendations
      if (category[connection.path]) {
        // for each category-entitiy-connection, eg recommendation_categories
        forEach(Object.values(category[connection.path]), (categoryConnection) => {
          // if connection exists and category not previously recorded (through other connection)
          if (connectionIds.indexOf(categoryConnection.attributes[connection.key]) > -1
          && categoryIds.indexOf(categoryConnection.attributes.category_id) === -1) {
            // remember category
            categoryIds.push(categoryConnection.attributes.category_id);
          }
        });
      }
    });
  }
  return categoryIds;
};


export const makeConnectedTaxonomyFilterOptions = (entities, { filters, connectedTaxonomies, activeFilterOption, location }) => {
  const locationQuery = location.query;

  const filterOptions = {
    groupId: 'connectedTaxonomies',
    search: filters.connectedTaxonomies.search,
    options: {},
  };

  const taxonomy = connectedTaxonomies.taxonomies[parseInt(activeFilterOption.optionId, 10)];
  if (taxonomy) {
    const query = filters.connectedTaxonomies.query;
    const locationQueryValue = locationQuery[query];
    if (entities.length === 0) {
      if (locationQueryValue) {
        forEach(Array.isArray(locationQueryValue) ? locationQueryValue : [locationQueryValue], (queryValue) => {
          const locationQueryValueCategory = queryValue.split(':');
          if (locationQueryValueCategory.length > 1) {
            forEach(filters.connectedTaxonomies.connections, (connection) => {
              if (connection.path === locationQueryValueCategory[0]) {
                const categoryId = parseInt(locationQueryValueCategory[1], 10);
                if (taxonomy.categories[categoryId]) {
                  filterOptions.options[categoryId] = {
                    label: taxonomy.categories[categoryId].attributes.title,
                    value: `${connection.path}:${categoryId}`,
                    count: 0,
                    query,
                    checked: true,
                  };
                }
              }
            });
          }
        });
      }
    } else {
      forEach(Object.values(entities), (entity) => {
        forEach(filters.connectedTaxonomies.connections, (connection) => {
          // connection eg recommendations
          // if entity has taxonomies
          if (entity[connection.path]) { // action.recommendations stores recommendation_measures
            // add categories from entities for taxonomy
            const categoryIds = getConnectedCategoryIds(
              entity,
              connection,
              taxonomy
            );
            forEach(categoryIds, (categoryId) => {
              // if category of current taxonomy
              if (taxonomy.categories[categoryId]) {
                // filterOptions.title = filterOptions.title || taxonomy.attributes.title;
                // if category already added
                if (filterOptions.options[categoryId]) {
                  filterOptions.options[categoryId].count += 1;
                } else {
                  const value = `${connection.path}:${categoryId}`;
                  filterOptions.options[categoryId] = {
                    label: taxonomy.categories[categoryId].attributes.title,
                    value,
                    count: 1,
                    query,
                    checked: optionChecked(locationQueryValue, value),
                  };
                }
              }
            });
          }
        });
      });
    }
  }
  return filterOptions;
};