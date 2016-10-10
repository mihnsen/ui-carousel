'use strict';

describe('ui.carousel', () => {
  var module;
  var dependencies = [];

  var hasModule = (module) => {
    return dependencies.indexOf(module) >= 0;
  };

  beforeEach(() => {
    // Get module
    module = angular.module('ui.carousel');
    dependencies = module.requires;
  });

  it('should load config module', () => {
    expect(hasModule('ui.carousel.config')).toBeDefined();
  });
});
