'use strict';

describe('ui.carousel.controller.CarouselController', function() {
  let $scope;
  let $rootScope;
  let $element;
  let $timeout;
  let $q;
  let CarouselCtrl;
  let Carousel;

  beforeEach(angular.mock.module('ui.carousel.controllers', 'ui.carousel.providers'));

  beforeEach(inject((_$rootScope_, $controller, _$timeout_, _$compile_, _$q_, _Carousel_) => {
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $q = _$q_;

    Carousel = _Carousel_;
    $element = _$compile_('<div ui-carousel></div>')($scope);

    CarouselCtrl = $controller('CarouselController', {
      $scope,
      $element,
      $timeout,
      $q,
      Carousel
    }, {
      show: 1,
      scroll: 1,
      autoplay: true
    });
  }));

  describe('$onInit()', () => {
    beforeEach(() => {
      spyOn(CarouselCtrl, 'initOptions');
      spyOn(CarouselCtrl, 'initRanges');
      spyOn(CarouselCtrl, 'setProps');
      spyOn(CarouselCtrl, 'setupInfinite');
    });

    it('should be init sequence correctly', () => {
      CarouselCtrl.$onInit();

      expect(CarouselCtrl.initOptions).toHaveBeenCalled();
      expect(CarouselCtrl.initRanges).toHaveBeenCalled();
      expect(CarouselCtrl.setProps).toHaveBeenCalled();
      expect(CarouselCtrl.setupInfinite).toHaveBeenCalled();
    });
  });

  describe('initOptions', () => {
    beforeEach(() => {
      spyOn(Carousel, 'getOptions');
    });

    it('should get options from providers, config', () => {
      CarouselCtrl.initOptions();
      expect(Carousel.getOptions).toHaveBeenCalled();
    });

    it('should get config from directive', () => {
      CarouselCtrl.autoplay = true;
      CarouselCtrl.fade = false;
      CarouselCtrl.show = 4;
      CarouselCtrl.scroll = 3;
      CarouselCtrl.initialSlide = 10;
      CarouselCtrl.initOptions();

      expect(CarouselCtrl.options.initialSlide).toEqual(10);
      expect(CarouselCtrl.options.fade).toBe(false);
      expect(CarouselCtrl.options.autoplay).toBe(true);
      expect(CarouselCtrl.options.slidesToShow).toEqual(4);
      expect(CarouselCtrl.options.slidesToScroll).toEqual(3);
    });

    it('should set slides to show and scroll to be 1 when fade = true', () => {
      CarouselCtrl.fade = true;
      CarouselCtrl.show = 4;
      CarouselCtrl.scroll = 3;
      CarouselCtrl.initOptions();

      expect(CarouselCtrl.options.slidesToShow).toEqual(1);
      expect(CarouselCtrl.options.slidesToScroll).toEqual(1);
    });
  });

  describe('initRanges()', () => {
    beforeEach(() => {
      CarouselCtrl.$onInit();
    });

    it('should init variables, slides correctly', () => {
      CarouselCtrl.slides = [1, 2, 3, 4, 5, 6];
      CarouselCtrl.initRanges();

      expect(CarouselCtrl.isCarouselReady).toBe(false);
      expect(CarouselCtrl.isTrackMoving).toBe(false);
      expect(CarouselCtrl.track).toBeDefined();
      expect(CarouselCtrl.currentSlide).toBeDefined();
      expect(CarouselCtrl.trackStyle).toBeDefined();
      expect(CarouselCtrl.slideStyle).toBeDefined();
      expect(CarouselCtrl.isVisibleDots).toBeDefined();
      expect(CarouselCtrl.isVisibleNext).toBeDefined();
      expect(CarouselCtrl.isVisiblePrev).toBeDefined();
      expect(CarouselCtrl.animType).toBeDefined();
      expect(CarouselCtrl.transformType).toBeDefined();
      expect(CarouselCtrl.transitionType).toBeDefined();
    });
  });

  describe('initUI()', () => {
    beforeEach(() => {
      spyOn(CarouselCtrl, 'initTrack');
      spyOn(CarouselCtrl, 'updateItemStyle');

      CarouselCtrl.$onInit();
    });

    it('should calculate track width', () => {
      CarouselCtrl.initUI();
      $timeout.flush();

      expect(CarouselCtrl.initTrack).toHaveBeenCalled();
      expect(CarouselCtrl.updateItemStyle).toHaveBeenCalled();
    });
  });

  describe('initTrack()', () => {
    beforeEach(() => {
      CarouselCtrl.$onInit();
    });

    it('should calculate track width and prevent transition when fade = true', () => {
      CarouselCtrl.slidesInTrack = [2, 0, 1, 2, 0];
      CarouselCtrl.width = 1;
      CarouselCtrl.options.fade = true;
      CarouselCtrl.options.slidesToShow = 2;
      CarouselCtrl.initTrack();

      expect(CarouselCtrl.trackStyle.width).toEqual('2.5px');

      $scope.$apply();
      expect(CarouselCtrl.isCarouselReady).toBe(true);
      expect(CarouselCtrl.trackStyle).toEqual({
        'width': '2.5px',
        'webkitTransition': '-webkit-transform 0ms ease',
      });
    });
    it('should calculate track width and init track transition', () => {
      CarouselCtrl.slidesInTrack = [2, 0, 1, 2, 0];
      CarouselCtrl.width = 1;
      CarouselCtrl.options.fade = false;
      CarouselCtrl.options.speed = 5000;
      CarouselCtrl.options.slidesToShow = 2;
      CarouselCtrl.initTrack();

      expect(CarouselCtrl.trackStyle.width).toEqual('2.5px');

      $scope.$apply();
      expect(CarouselCtrl.isCarouselReady).toBe(true);
      expect(CarouselCtrl.trackStyle).toEqual({
        'width': '2.5px',
        'webkitTransition': '-webkit-transform 5000ms ease'
      });
    });
  });

  describe('next()', () => {
    /*
     * - 6 total, 1 show, 1 scroll, current 0 => next index = 1
     * - 9 total, 3 show, 3 scroll, current 1 => next index = 3
     * - 9 total, 3 show, 3 scroll, current 3 => next index = 6
     * - 9 total, 3 show, 3 scroll, current 8 => next index = 3
     * - 8 total, 4 show, 3 scroll, current 1 => next index = 4
     */
    beforeEach(() => {
      CarouselCtrl.slideHandler = jasmine.createSpy('slideHandler').and.callFake(() => {
        return $q.resolve(true);
      });
      CarouselCtrl.$onInit();
      CarouselCtrl.isClickableNext = true;
    });

    it('should works well with normal case', () => {
      CarouselCtrl.slides = [...Array(5)];
      CarouselCtrl.options.slidesToScroll = 1;
      CarouselCtrl.currentSlide = 0;
      CarouselCtrl.next();

      expect(CarouselCtrl.slideHandler).toHaveBeenCalledWith(1);
    });

    it('should works well with infinite case and sync to page index first', () => {
      CarouselCtrl.slides = [...Array(9)];
      CarouselCtrl.options.slidesToScroll = 3;
      CarouselCtrl.currentSlide = 1;
      CarouselCtrl.next();

      expect(CarouselCtrl.slideHandler).toHaveBeenCalledWith(3);
    });

    it('should works well with infinite case and scroll to next page', () => {
      CarouselCtrl.slides = [...Array(9)];
      CarouselCtrl.options.slidesToScroll = 3;
      CarouselCtrl.currentSlide = 3;
      CarouselCtrl.next();

      expect(CarouselCtrl.slideHandler).toHaveBeenCalledWith(6);
    });

    it('should works well with infinite case and scroll to next page', () => {
      CarouselCtrl.slides = [...Array(8)];
      CarouselCtrl.options.slidesToScroll = 3;
      CarouselCtrl.currentSlide = 1;
      CarouselCtrl.next();

      expect(CarouselCtrl.slideHandler).toHaveBeenCalledWith(4);
    });
  });

  describe('prev()', () => {
    // Same with next()
    beforeEach(() => {
      CarouselCtrl.slideHandler = jasmine.createSpy('slideHandler').and.callFake(() => {
        return $q.resolve(true);
      });
      CarouselCtrl.$onInit();
      CarouselCtrl.isClickablePrev = true;
    });

    it('should works well with infinite case and sync to page index first', () => {
      CarouselCtrl.slides = [...Array(9)];
      CarouselCtrl.options.slidesToShow = 3;
      CarouselCtrl.options.slidesToScroll = 3;
      CarouselCtrl.currentSlide = 1;
      CarouselCtrl.prev();

      expect(CarouselCtrl.slideHandler).toHaveBeenCalledWith(0);
    });
  });

  describe('movePage()', () => {
    beforeEach(() => {
      CarouselCtrl.slideHandler = jasmine.createSpy('slideHandler').and.callFake(() => {
        return $q.resolve(true);
      });
      CarouselCtrl.$onInit();
    });

    it('should be work well', () => {
      CarouselCtrl.options.slidesToScroll = 1;
      CarouselCtrl.currentSlide = 5;
      expect(CarouselCtrl.currentSlide).toEqual(5);

      CarouselCtrl.movePage(3);
      expect(CarouselCtrl.slideHandler).toHaveBeenCalledWith(3);
    });

    it('should be work with multiple slides to scroll', () => {
      CarouselCtrl.options.slidesToScroll = 3;
      CarouselCtrl.options.currentSlide = 5;
      CarouselCtrl.options.fade = false;

      CarouselCtrl.movePage(3);
      expect(CarouselCtrl.slideHandler).toHaveBeenCalledWith(9);
    });
  });

  describe('slideHandler()', () => {
    beforeEach(() => {
      spyOn(CarouselCtrl, 'autoplayTrack');
      spyOn(CarouselCtrl, 'correctTrack');
      CarouselCtrl.slides = [...Array(6)];
      CarouselCtrl.$onInit();
    });

    it('should reject if track is moving', (done) => {
      CarouselCtrl.isTrackMoving = true;
      let expectMsg = '';
      CarouselCtrl
        .slideHandler(1)
        .catch(msg => expectMsg = msg)
        .finally(done);

      $scope.$apply();
      expect(expectMsg).toEqual('Track is moving');
    });

    it('should reject when length of slides is lower than slides to show', (done) => {
      CarouselCtrl.options.slidesToShow = 7;
      let expectMsg = '';
      CarouselCtrl
        .slideHandler(1)
        .catch(msg => expectMsg = msg)
        .finally(done);

      $scope.$apply();
      expect(expectMsg).toEqual('Length of slides smaller than slides to show');
    });

    it('should move to correct index when fade = true', (done) => {
      CarouselCtrl.fade = true;
      CarouselCtrl.initOptions();
      let expectMsg = '';
      CarouselCtrl
        .slideHandler(6)
        .then(msg => expectMsg = msg)
        .finally(done);

      $scope.$apply();
      expect(expectMsg).toEqual('Handler fade');
      expect(CarouselCtrl.currentSlide).toEqual(0);
    });

    it('should move track to correct position', (done) => {
      // XXX
      // see http://paulsalaets.com/posts/q-promise-chains-need-digest-cycle-to-go
      // Should be revised
      spyOn(CarouselCtrl, 'moveTrack').and.callFake(() => {
        return $q((resolve, reject) => {
          resolve();
        });
      });

      CarouselCtrl.fade = false;
      CarouselCtrl.infinite = true;
      CarouselCtrl.$onInit();
      CarouselCtrl.updateItemStyle();

      CarouselCtrl.slideHandler(6).finally(done);

      $scope.$apply();
      //expect(CarouselCtrl.isTrackMoving).toBe(false);
      expect(CarouselCtrl.currentSlide).toBe(0);
      expect(CarouselCtrl.autoplayTrack).toHaveBeenCalled();
      expect(CarouselCtrl.correctTrack).toHaveBeenCalled();
      expect(CarouselCtrl.moveTrack).toHaveBeenCalledWith(-7);
      expect(CarouselCtrl.currentSlide).toEqual(0);
    });
  });

  describe('moveTrack()', () => {
    beforeEach(() => {
      CarouselCtrl.$onInit();
    });

    it('should move track and resolve after speed timeout', (done) => {
      CarouselCtrl
        .moveTrack(100)
        .then(msg => {
          expect(msg).toEqual('Track moved');
        })
        .finally(done);

      $timeout.flush(CarouselCtrl.options.speed);
    });

    it('should update track style', () => {
      CarouselCtrl.moveTrack(100);

      expect(CarouselCtrl.trackStyle).toEqual(jasmine.objectContaining({
        webkitTransform: "translate3d(100px, 0px, 0px)"
      }));
    });
  });

  describe('correctTrack()', () => {
    beforeEach(() => {
      CarouselCtrl.slides = [...Array(6)];
      CarouselCtrl.$onInit();
    });

    it('should be working only infinite mode', () => {
      CarouselCtrl.isTrackMoving = false;
      CarouselCtrl.options.infinite = false;

      CarouselCtrl.correctTrack();
      expect(CarouselCtrl.isTrackMoving).toBe(false);
      expect(CarouselCtrl.trackStyle.webkitTransform).not.toBeDefined();
    });

    it('should move to correct track position and revert track style', () => {
      CarouselCtrl.currentSlide = 1;
      CarouselCtrl.options.speed = 200;
      CarouselCtrl.options.cssEase = 'linear';

      CarouselCtrl.correctTrack();
      expect(CarouselCtrl.isTrackMoving).toBe(true);

      $scope.$apply();
      expect(CarouselCtrl.trackStyle).toEqual(jasmine.objectContaining({
        webkitTransition: '-webkit-transform 0ms linear',
      }));

      $timeout.flush(200);
      expect(CarouselCtrl.isTrackMoving).toBe(false);
      expect(CarouselCtrl.trackStyle).toEqual(jasmine.objectContaining({
        webkitTransition: '-webkit-transform 200ms linear',
      }));
    });
  });

  describe('autoplayTrack()', () => {
    beforeEach(() => {
      spyOn(CarouselCtrl, 'next');
      CarouselCtrl.slides = [...Array(6)];
      CarouselCtrl.$onInit();
    });

    it('should autoplay when enabled in options', () => {
      CarouselCtrl.options.autoplay = false;
      CarouselCtrl.autoplayTrack();
      expect(CarouselCtrl.timeout).not.toBeDefined();
    });

    it('should autoplay', () => {
      CarouselCtrl.options.autoplay = true;
      CarouselCtrl.options.autoplaySpeed = 3000;
      CarouselCtrl.next.calls.reset();
      CarouselCtrl.autoplayTrack();

      expect(CarouselCtrl.timeout).toBeDefined();
      $timeout.flush(3000);
      expect(CarouselCtrl.next.calls.count()).toEqual(1);
    });
  });

  describe('getSlideStyle', () => {
    beforeEach(() => {
      CarouselCtrl.slides = [...Array(6)];
      CarouselCtrl.$onInit();
    });

    it('should be get correct style', () => {
      CarouselCtrl.updateItemStyle();

      CarouselCtrl.options.fade = false;
      expect(CarouselCtrl.getSlideStyle(1000)).toEqual({
        'width': '1px'
      });

      CarouselCtrl.options.fade = true;
      expect(CarouselCtrl.getSlideStyle(5)).toEqual({
        'width': '1px',
        'position': 'relative',
        'top': '0px',
        'z-index': 9,
        'left': '-5px',
        'opacity': 0
      });
    });

    it('should be get correct style', () => {
      CarouselCtrl.width = 100;
      CarouselCtrl.currentSlide = 5;
      CarouselCtrl.options.slidesToShow = 2;

      CarouselCtrl.updateItemStyle();
      CarouselCtrl.options.fade = false;
      expect(CarouselCtrl.slideStyle).toEqual({
        'width': '50px'
      });

      CarouselCtrl.options.fade = true;
      expect(CarouselCtrl.getSlideStyle(5)).toEqual({
        'width': '50px',
        'position': 'relative',
        'top': '0px',
        'z-index': 10,
        'left': '-250px',
        'opacity': 1,
        'transition': 'opacity 250ms linear'
      });
    });
  });

  //TODO write more tests case for carousel
});
