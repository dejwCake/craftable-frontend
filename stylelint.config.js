export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['dist/**'],
  rules: {
    'no-descending-specificity': null,
    'selector-class-pattern': null,
    'scss/dollar-variable-pattern': null,
    'scss/no-global-function-names': null,
    'number-max-precision': null,
  },
};
