'use strict';

describe('ui.carousel.providers.Carousel', function() {
  var Carousel;

  // load the module
  beforeEach(angular.mock.module('ui.carousel.providers', function($provide) {
  }));

  beforeEach(inject(function(_Carousel_) {
    Carousel = _Carousel_;
  }));

  it('should be defined', function() {
    expect(Carousel).toBeDefined();
  });
});
