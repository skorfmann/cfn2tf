const { TypeScriptProject, Semver } = require('projen');

const project = new TypeScriptProject({
  name: 'cfn2ts',
  dependencies: {
    'change-case': Semver.caret('4.1.1'),
    'deepmerge': Semver.caret('4.2.2'),
    'clean-deep': Semver.caret('3.3.0')
  }
});

// also build on push
project.buildWorkflow.on({ push: {} });

project.synth();
