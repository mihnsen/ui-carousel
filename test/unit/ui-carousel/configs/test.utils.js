var TestUtil = {
  compile: function(html, scope) {
    var container;

    inject(function($compile, $rootScope) {
      if (!scope) {
        scope = $rootScope.$new();
      } else if (scope && !scope.$new) {
        scope = angular.extend($rootScope.$new(), scope);
      }

      const el = angular.element(html);

      container = $compile(el)(scope);
      $rootScope.$apply();
      $rootScope.$digest();
    });

    return container;
  }
};
