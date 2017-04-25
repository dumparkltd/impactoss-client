import React, { PropTypes } from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { isEqual } from 'lodash/lang';
import { Form, actions as formActions } from 'react-redux-form/immutable';
import MultiSelectControl from 'components/forms/MultiSelectControl';

class EntityListEditForm extends React.Component { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    model: PropTypes.string.isRequired,
    options: PropTypes.instanceOf(List),
    onSubmit: PropTypes.func,
    onClose: PropTypes.func,
    title: PropTypes.string,
    populateForm: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
    submitLabel: PropTypes.string,
    multiple: PropTypes.bool,
    required: PropTypes.bool,
  }

  static defaultProps = {
    submitLabel: 'Update',
    multiple: true,
    required: false,
  }

  componentWillMount() {
    this.props.populateForm(this.props.model, this.props.options);
  }

  componentWillReceiveProps(nextProps) {
     // Todo this is not efficent, parent component is creating a new map every time so we can't hashCode compare :(
    if (!isEqual(nextProps.options.toJS(), this.props.options.toJS())) {
      this.props.populateForm(nextProps.model, nextProps.options);
    }
  }
  onClose = () => {
    // console.log('onclose')
    this.props.resetForm(this.props.model);
    this.props.onClose();
  }
  render() {
    return (
      <Form
        model={this.props.model}
        onSubmit={this.props.onSubmit}
      >
        { this.props.title &&
          <strong>{this.props.title}</strong>
        }
        { this.props.onClose &&
          <button onClick={this.onClose}>close</button>
        }
        <MultiSelectControl
          model=".values"
          threeState
          multiple={this.props.multiple}
          required={this.props.required}
          options={this.props.options}
        />
        {this.props.onSubmit &&
          <button type="submit">{this.props.submitLabel}</button>
        }
      </Form>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  resetForm: (model) => {
    dispatch(formActions.reset(model));
  },
  populateForm: (model, options) => {
    dispatch(formActions.load(model, Map({ values: options })));
  },
});

export default connect(null, mapDispatchToProps)(EntityListEditForm);