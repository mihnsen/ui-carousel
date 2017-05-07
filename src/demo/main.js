var app = angular.module('App', ['ui.carousel', 'ngSanitize']);

app.run(['Carousel', (Carousel) => {
  Carousel.setOptions({});
}]);

app.controller('CarouselDemoCtrl', ['$scope', 'Carousel', function($scope, Carousel) {
  'use strict';

  this.singleInit = () => {
    console.log('single init');
  };

  this.singleAfter = (currentSlide) => {
    console.log(currentSlide);
  };

  this.single = {
    slides: [...Array(6).keys()],
    source: '<ui-carousel slides="ctrl.single.slides" dots="true">\n' +
            '  <carousel-item>\n' +
            '    <h3>{{ item + 1 }}</h3>\n' +
            '  </carousel-item>\n' +
            '</ui-carousel><Paste>'
  };
  this.multiple = {
    slides: [...Array(9).keys()],
    source: '<ui-carousel slides="ctrl.multiple.slides" slides-to-show="3" slides-to-scroll="3" dots="true">\n' +
            '  <carousel-item>\n' +
            '    <h3>{{ item + 1 }}</h3>\n' +
            '  </carousel-item>\n' +
            '</ui-carousel>'
  };

  this.autoplay = {
    slides: [...Array(6).keys()],
    source: '<ui-carousel slides="ctrl.autoplay.slides" slides-to-show="3" slides-to-scroll="1" autoplay="true" autoplay-speed="2000" dots="true">\n' +
            '  <carousel-item>\n' +
            '    <h3>{{ item + 1 }}</h3>\n' +
            '  </carousel-item>\n' +
            '</ui-carousel>'
  };

  this.fade = {
    slides: [
      'http://lorempixel.com/560/400/sports/1',
      'http://lorempixel.com/560/400/sports/2',
      'http://lorempixel.com/560/400/sports/3',
    ],
    source: '<ui-carousel slides="ctrl.fade.slides" slides-to-show="3" slides-to-scroll="1">\n' +
            '  <carousel-item>\n' +
            '    <div class="image"><img src="{{ item }}"></div>\n' +
            '  </carousel-item>\n' +
            '</ui-carousel>'
  };

  this.addIndex = 1;
  this.addItem = () => {
    this.add.slides.push(this.addIndex++);
  };
  this.removeItem = () => {
    if (this.add.slides.length <= 1) {
      return;
    }
    this.add.slides.splice(-1, 1);
    this.addIndex--;
  };
  this.add = {
    slides: [...Array(1).keys()],
    source: '<ui-carousel slides="ctrl.add.slides" slides-to-show="3" slides-to-scroll="3" dots="true">\n' +
            '  <carousel-item>\n' +
            '    <h3>{{ item + 1 }}</h3>\n' +
            '  </carousel-item>\n' +
            '</ui-carousel>'
  };

  this.customize=
    '<ui-carousel slides="ctrl.fade.slides" slides-to-show="3" slides-to-scroll="1">\n' +
    '  <!-- For slider render -->\n' +
    '  <carousel-item>\n' +
    '    <!-- placed your item content here -->\n' +
    '    <img src="{{ item.image }}" alt="{{ item.title }}" />\n' +
    '    <h3> {{ item.name }} </h3>\n' +
    '    <p> {{ item.description }} </h3>\n' +
    '    <!-- end -->\n' +
    '  </carousel-item>\n' +
    '  \n' +
    '  <!-- For customize carousel next, previous button -->\n' +
    '  <carousel-prev>\n' +
    '    <!-- placed your previous button here -->\n' +
    '    <button>Prev</button>\n' +
    '    <!-- end -->\n' +
    '  </carousel-prev>\n' +
    '  \n' +
    '  <carousel-next>\n' +
    '    <!-- placed your next button here -->\n' +
    '    <button>next</button>\n' +
    '    <!-- end -->\n' +
    '  </carousel-next>\n' +
    '</ui-carousel>'
  ;
}]);

app.directive('prism', [function() {
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {
      element.ready(function() {
        Prism.highlightElement(element[0]);
      });
    }
  }
}]);
