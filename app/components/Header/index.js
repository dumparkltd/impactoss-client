import React from 'react';
import { FormattedMessage } from 'react-intl';

import NavBar from './NavBar';
import HeaderLink from './HeaderLink';
import messages from './messages';

class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    isSignedIn: React.PropTypes.bool,
  }

  render() {
    return (
      <div>
        <NavBar>
          <HeaderLink to="/">
            <FormattedMessage {...messages.home} />
          </HeaderLink>
          {this.props.isSignedIn &&
            <HeaderLink to="/logout">
              <FormattedMessage {...messages.logout} />
            </HeaderLink>
          }
          {!this.props.isSignedIn &&
            <span>
              <HeaderLink to="/login">
                <FormattedMessage {...messages.login} />
              </HeaderLink>
              <HeaderLink to="/register">
                <FormattedMessage {...messages.register} />
              </HeaderLink>
            </span>
          }
        </NavBar>
      </div>
    );
  }
}

export default Header;
