describe('ui-carousel', () => {
  let $rootScope;
  let $compile;
  let scope;

  beforeEach(module('ui.carousel.directives'));

  // inject services
  beforeEach(inject((_$rootScope_, _$compile_) => {
    $rootScope = _$rootScope_;
    $compile = _$compile_;

    scope = $rootScope.$new();
  }));
});
