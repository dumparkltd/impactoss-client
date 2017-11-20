import styled from 'styled-components';
import { palette } from 'styled-theme';

import Button from '../Button';

// eslint-disable no-nested-ternary
const ButtonTagCategory = styled(Button)`
  color: ${palette('text', 2)};
  background-color: ${(props) => palette('taxonomies', props.taxId || 0)};
  padding: 1px 6px;
  margin-right: 2px;
  border-radius: 3px;
  font-size: 0.85em;
  cursor:${(props) => props.disabled ? 'default' : 'pointer'};
  border: 1px solid ${(props) => palette('taxonomies', props.taxId || 0)};
  &:hover {
    color: ${palette('text', 2)};
    background-color: ${(props) => props.disabled
      ? palette('taxonomies', props.taxId || 0)
      : palette('taxonomiesHover', props.taxId || 0)
    };
  }
`;

export default ButtonTagCategory;
