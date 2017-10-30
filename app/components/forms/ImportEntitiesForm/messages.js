/*
 * Form Messages
 *
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.components.ImportEntitiesForm.title',
    defaultMessage: 'Batch import',
  },
  templateHint: {
    id: 'app.components.ImportEntitiesForm.templateHint',
    defaultMessage: 'Import multiple items from a CSV file. For the available fields and field types please ',
  },
  formatHint: {
    id: 'app.components.ImportEntitiesForm.formatHint',
    defaultMessage: 'Please note: when saving from Excel, chose file type "CSV UTF-8 (Comma delimited)".',
  },
  downloadTemplate: {
    id: 'app.components.ImportEntitiesForm.downloadTemplate',
    defaultMessage: 'download the CSV template',
  },
  someErrors: {
    id: 'app.components.ImportEntitiesForm.someErrors',
    defaultMessage: 'We are sorry, only {successNo} of {rowNo} row(s) could be imported.',
  },
  allErrors: {
    id: 'app.components.ImportEntitiesForm.allErrors',
    defaultMessage: 'We are sorry, none of the rows could be imported.',
  },
  success: {
    id: 'app.components.ImportEntitiesForm.success',
    defaultMessage: 'All {rowNo} row(s) successfully imported.',
  },
  importAgain: {
    id: 'app.components.ImportEntitiesForm.importAgain',
    defaultMessage: 'Import another file',
  },
  done: {
    id: 'app.components.ImportEntitiesForm.done',
    defaultMessage: 'Back to list',
  },
  importing: {
    id: 'app.components.ImportEntitiesForm.importing',
    defaultMessage: 'Importing: ',
  },
  rowErrorHint: {
    id: 'app.components.ImportEntitiesForm.rowErrorHint',
    defaultMessage: 'Import of the following rows failed:',
  },
});
