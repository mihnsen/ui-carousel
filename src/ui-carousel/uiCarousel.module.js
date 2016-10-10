(function (angular) {
  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config
  angular.module('ui.carousel.config', [])
    .value('ui.carousel.config', {
      debug: true
    });

  // Modules
  angular.module('ui.carousel.providers', []);
  angular.module('ui.carousel.controllers', []);
  angular.module('ui.carousel.directives', []);
  angular.module('ui.carousel', [
    'ui.carousel.config',
    'ui.carousel.directives',
    'ui.carousel.controllers',
    'ui.carousel.providers'
  ]);
})(angular);
