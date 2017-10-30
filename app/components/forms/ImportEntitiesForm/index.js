import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form } from 'react-redux-form/immutable';
// import { Form, Errors } from 'react-redux-form/immutable';
import CsvDownloader from 'react-csv-downloader';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { omit } from 'lodash/object';
import { map } from 'lodash/collection';

// import asArray from 'utils/as-array';
// import { lowerCase } from 'utils/string';
//
// import appMessages from 'containers/App/messages';

// import Icon from 'components/Icon';
// import FieldFactory from 'components/fields/FieldFactory';
// import Button from 'components/buttons/Button';
// import Label from 'components/fields/Label';
// import FieldWrap from 'components/fields/FieldWrap';
import A from 'components/styled/A';
import Field from 'components/fields/Field';

import Messages from 'components/Messages';
import Loading from 'components/Loading';

import DocumentWrap from 'components/fields/DocumentWrap';

import ButtonCancel from 'components/buttons/ButtonCancel';
import ButtonSubmit from 'components/buttons/ButtonSubmit';
import Clear from 'components/styled/Clear';

import FileSelectControl from '../FileSelectControl';
import FormWrapper from '../FormWrapper';
import FormBody from '../FormBody';
import FormFieldWrap from '../FormFieldWrap';
import FormFooter from '../FormFooter';
import FormFooterButtons from '../FormFooterButtons';

import messages from './messages';

const Importing = styled.div``;

const ImportingText = styled.div`
  font-weight: bold;
  font-size: 1em;
  color: ${palette('primary', 2)};
  margin-bottom: 0.25em;
  margin-top: -0.5em;
  overflow: hidden;
`;

const DocumentWrapEdit = styled(DocumentWrap)`
  background-color: ${palette('primary', 4)};
  position: relative;
  padding: 1em 0.75em;
`;

const FormTitle = styled.h2`
  padding-top:0;
`;
const Hint = styled.div`
  font-size: 1.2em;
`;
const CsvDownload = styled.span`
  display: inline-block;
`;
const DownloadTemplate = styled(A)`
  font-weight: bold;
`;
const RowErrors = styled.div`
  margin-top: 2em;
`;

// These props will be omitted before being passed to the Control component
const nonControlProps = ['label', 'component', 'controlType', 'children', 'errorMessages'];

export class ImportEntitiesForm extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  getControlProps = (field) => omit(field, nonControlProps);

  render() {
    const {
      model,
      handleSubmit,
      handleCancel,
      handleReset,
      fieldModel,
      template,
      formData,
      progress,
      errors,
      success,
    } = this.props;

    const field = {
      id: 'file',
      model: `.${fieldModel}`,
      placeholder: 'filename',
    };

    const { id, ...props } = this.getControlProps(field);

    return (
      <div>
        <FormWrapper white>
          <Form model={model} onSubmit={handleSubmit} >
            <FormBody>
              <FormTitle>
                <FormattedMessage {...messages.title} />
              </FormTitle>
              <Hint>
                <FormattedMessage {...messages.templateHint} />
                <CsvDownload>
                  <CsvDownloader
                    datas={template.data}
                    filename={template.filename}
                  >
                    <DownloadTemplate href="/" onClick={(evt) => evt.preventDefault()}>
                      <FormattedMessage {...messages.downloadTemplate} />
                    </DownloadTemplate>
                  </CsvDownloader>
                </CsvDownload>
                <span>.</span>
              </Hint>
              <Hint>
                <FormattedMessage {...messages.formatHint} />
              </Hint>
              <Field>
                <FormFieldWrap>
                  { (progress === null) &&
                    <FileSelectControl
                      id={id}
                      model={field.model}
                      as="text"
                      accept=".csv, text/csv"
                      {...props}
                    />
                  }
                  { progress !== null &&
                    <div>
                      <DocumentWrapEdit>
                        { progress < 100 &&
                          <Importing>
                            <ImportingText>
                              <FormattedMessage {...messages.importing} />
                              { formData && `"${formData.get('import').file.name}"`}
                            </ImportingText>
                            <Loading progress={progress} />
                          </Importing>
                        }
                        { progress >= 100 &&
                          <div>
                            {(errors.size > 0 && success.size === 0) &&
                              <FormattedMessage {...messages.allErrors} />
                            }
                            {(errors.size > 0 && success.size > 0) &&
                              <FormattedMessage
                                {...messages.someErrors}
                                values={{
                                  successNo: success.size,
                                  rowNo: errors.size + success.size,
                                }}
                              />
                            }
                            {(errors.size === 0) &&
                              <FormattedMessage
                                {...messages.success}
                                values={{
                                  rowNo: success.size,
                                }}
                              />
                            }
                          </div>
                        }
                      </DocumentWrapEdit>
                      {(errors.size > 0) &&
                        <RowErrors>
                          <FormattedMessage {...messages.rowErrorHint} />
                          <Messages
                            type="error"
                            details
                            preMessage={false}
                            messages={
                              errors
                              .sortBy((error) => error && error.data && error.data.saveRef)
                              .reduce((memo, error) => error.error.messages
                                ? memo.concat(map(error.error.messages, (message) => error.data.saveRef
                                  ? `${error.data.saveRef}: "${message}"`
                                  : message
                                ))
                                : memo
                              , [])
                            }
                          />
                        </RowErrors>
                      }
                    </div>
                  }
                </FormFieldWrap>
              </Field>
            </FormBody>
            { progress >= 100 &&
              <FormFooter>
                <FormFooterButtons>
                  <ButtonCancel type="button" onClick={handleReset}>
                    <FormattedMessage {...messages.importAgain} />
                  </ButtonCancel>
                  <ButtonSubmit type="button" onClick={handleCancel}>
                    <FormattedMessage {...messages.done} />
                  </ButtonSubmit>
                </FormFooterButtons>
                <Clear />
              </FormFooter>
            }
          </Form>
        </FormWrapper>
      </div>
    );
  }
}

ImportEntitiesForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  model: PropTypes.string,
  fieldModel: PropTypes.string,
  formData: PropTypes.object,
  progress: PropTypes.number,
  errors: PropTypes.object,
  success: PropTypes.object,
  template: PropTypes.object,
};

export default ImportEntitiesForm;
