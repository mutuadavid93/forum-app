import firebase from 'firebase';
// eslint-disable-next-line object-curly-newline
import { Form, Field, ErrorMessage, defineRule, configure } from 'vee-validate';
// eslint-disable-next-line object-curly-newline
import { required, email, min, url } from '@vee-validate/rules';
import { localize } from '@vee-validate/i18n';

export default (app) => {
  // defineRule defines global rules to be used in any form
  defineRule('required', required);
  defineRule('email', email);
  defineRule('min', min);
  defineRule('url', url);

  // Async rules e.g. "email is taken"
  defineRule('unique', async (value, args) => {
    let collection;
    let field;
    if (Array.isArray(args)) {
      [collection, field] = args;
    } else {
      ({ collection, field } = args);
    }

    const querySnapshot = await firebase
      .firestore()
      .collection(collection)
      .where(field, '==', value)
      .get(); // get() fetches it only once
    return querySnapshot.empty;
  });

  configure({
    generateMessage: localize('en', {
      messages: {
        // map rules to messages
        required: '{field} is required',
        email: '{field} must be a valid email',

        // with arguments.
        min: '{field} must be 0:{min} characters long',
        unique: '{field} is already taken',
        url: '{field} must be a valid URL',
      },
    }),
  });

  // Register components globally
  app.component('VeeForm', Form);
  app.component('VeeField', Field);
  app.component('VeeErrorMessage', ErrorMessage);
};
