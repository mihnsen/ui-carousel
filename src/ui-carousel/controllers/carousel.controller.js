/**
 * angular-ui-carousel
 * for example:
 * length = 8, show = 4, scroll = 3, current = 0
 *          ---------
 *          |       |
 *  |4|5|6|7|0|1|2|3|4|5|6|7|1|2|3|4
 *          |       |
 *          ---------
 * rectangle is visible for users
 */
angular.module('ui.carousel.controllers')
.controller('CarouselController', [
  '$scope', '$element', '$timeout', '$q', 'Carousel',
  function ($scope, $element, $timeout, $q, Carousel) {

    /**
     * initial carousel
     */
    this.init = () => {
      this.initOptions();
      this.initRanges();
      this.setProps();
      this.setupInfinite();

      if (this.onInit) {
        this.onInit();
      }
    };

    /**
     * init option
     * directive conifig
     */
    this.initOptions = () => {
      this.options = angular.extend({}, Carousel.getOptions());

      // TODO customize attribute from directive
      if (this.initialSlide !== undefined) {
        this.options.initialSlide = this.initialSlide;
      }
      if (this.fade !== undefined) {
        this.options.fade = this.fade;
      }
      if (this.autoplay !== undefined) {
        this.options.autoplay = this.autoplay;
      }
      if (this.autoplaySpeed !== undefined) {
        this.options.autoplaySpeed = this.autoplaySpeed;
      }
      if (this.cssEase !== undefined) {
        this.options.cssEase = this.cssEase;
      }
      if (this.speed !== undefined) {
        this.options.speed = this.speed;
      }
      if (this.infinite !== undefined) {
        this.options.infinite = this.infinite;
      }
      if (this.arrows !== undefined) {
        this.options.arrows = this.arrows;
      }
      if (this.dots !== undefined) {
        this.options.dots = this.dots;
      }

      // TODO write more options for fade mode
      // In fade mode we have to setting slides-to-show and slides-to-scroll
      // to 1 slide
      if (this.options.fade) {
        this.options.slidesToShow = 1;
        this.options.slidesToScroll = 1;
      } else {
        if (this.show) {
          this.options.slidesToShow = this.show;
        }
        if (this.scroll) {
          this.options.slidesToScroll = this.scroll;
        }
      }
    };

    /**
     * init variables, slides, ..
     */
    this.initRanges = () => {
      if (!this.slides) {
        this.slides = [];
      }

      this.isCarouselReady = false;
      this.isTrackMoving = false;
      this.track = $element.find('.track');
      this.width = 1; // Fake width
      this.currentSlide = this.options.initialSlide;
      this.trackStyle = {};
      this.slideStyle = {};

      this.isVisibleDots = false;
      this.isVisiblePrev = false;
      this.isVisibleNext = false;

      this.animType = null;
      this.transformType = null;
      this.transitionType = null;

      this.slidesInTrack = angular.copy(this.slides);
    };

    /**
     * Init UI and carousel track
     */
    this.initUI = () => {
      $timeout(() => {
        this.width = $element[0].clientWidth;
        this.updateItemStyle();
        this.initTrack();
      });
    };

    /**
     * update common style for each carousel item
     */
    this.updateItemStyle = () => {
      this.itemWidth = this.width / this.options.slidesToShow;
      this.slideStyle = {
        'width': this.itemWidth + 'px'
      };
    };

    /**
     * init carousel track
     * also make Carousel is Ready
     */
    this.initTrack = () => {
      const itemWidth = this.width / this.options.slidesToShow;
      const trackWidth = itemWidth * this.slidesInTrack.length;

      this.trackStyle.width = trackWidth + 'px';

      this
        .slideHandler(this.currentSlide)
        .finally(() => {
          this.isCarouselReady = true;

          if (!this.options.fade) {
            this.trackStyle[this.transitionType] =
              this.transformType + ' ' + this.options.speed + 'ms ' + this.options.cssEase;
          }
        });
    };

    /**
     * @see https://github.com/kenwheeler/slick/blob/master/slick/slick.js#L680
     *
     * Sync slide to place it should be
     * for example:
     * - 9 total, 3 show, 3 scroll, current 1
     *   => next index = 3 (previous index counted = 0)
     *
     * and scroll to next page:
     * - 6 total, 1 show, 1 scroll, current 0 => next index = 1
     * - 9 total, 3 show, 3 scroll, current 1 => next index = 3
     * - 9 total, 3 show, 3 scroll, current 3 => next index = 6
     * - 9 total, 3 show, 3 scroll, current 8 => next index = 3
     * - 8 total, 4 show, 3 scroll, current 1 => next index = 4
     */
    this.next = () => {
      const scrollOffset = this.slides.length % this.options.slidesToScroll !== 0;
      const indexOffset = scrollOffset
        ? 0
        : (this.slides.length - this.currentSlide) % this.options.slidesToScroll;

      const slideOffset = indexOffset === 0
        ? this.options.slidesToScroll
        : indexOffset;

      this.slideHandler(this.currentSlide + slideOffset);
    };

    /**
     * move to previous slide
     * same calculate with next
     * @see next function
     */
    this.prev = () => {
      const scrollOffset = this.slides.length % this.options.slidesToScroll !== 0;
      const indexOffset = scrollOffset
        ? 0
        : (this.slides.length - this.currentSlide) % this.options.slidesToScroll;

      const slideOffset = indexOffset === 0
        ? this.options.slidesToScroll
        : this.options.slidesToShow - indexOffset;

      this.slideHandler(this.currentSlide - slideOffset);
    };

    /**
     * move to page
     * @params int page
     * Page counter from 0 (start = 0)
     */
    this.movePage = (page) => {
      const target = this.options.slidesToScroll * page;
      this.slideHandler(target);
    };

    /**
     * hanlder carousel
     * @description move carousel to correct page
     *
     * @params int index
     */
    this.slideHandler = (index) => {
      // TODO prevent when slides not exists
      if (!this.slides) {
        return $q.reject('Carousel not fully setup');
      }

      // TODO Prevent when track is moving
      if (this.isTrackMoving) {
        return $q.reject('Track is moving');
      }

      const len = this.slides.length;
      const show = this.options.slidesToShow;

      if (len <= show) {
        return $q.reject('Leng of slides smaller than slides to show');
      }

      // We need target to destination
      // and a anim slide to translate track
      //
      // anim = animSlide (which we use to move)
      // target = targetSlide
      const anim = index;
      let target = null;

      if (anim < 0) {
       if (len % this.options.slidesToScroll !== 0) {
          target = len - (len % this.options.slidesToScroll);
        } else {
          target = len + anim;
        }
      } else if (anim >= len) {
        if (len % this.options.slidesToScroll !== 0) {
          target = 0;
        } else {
          target = anim - len;
        }
      } else {
        target = anim;
      }

      if (this.onBeforeChange) {
        this.onBeforeChange(this.currentSlide, target);
      }

      // Fade handler
      if (this.options.fade) {
        this.currentSlide = target;

        // XXX
        // afterChange method
        // fire after faded
        // Should be revised
        $timeout(() => {
          if (this.onAfterChange) {
            this.onAfterChange(this.currentSlide);
          }
        }, this.options.speed);
        return $q.resolve('Handler fade');
      }

      // No-fade handler
      let left = -1 * target * this.itemWidth;
      if (this.options.infinite) {
        left = -1 * (anim + show) * this.itemWidth;
      }

      this.isTrackMoving = true;
      return this
        .moveTrack(left)
        .then(() => {
          this.isTrackMoving = false;
          this.currentSlide = target;
          this.autoplayTrack();

          if (target !== anim) {
            this.correctTrack();
          }

          // XXX
          // afterChange method
          // fire after 200ms wakeup and correct track
          // Should be revised
          $timeout(() => {
            if (this.onAfterChange) {
              this.onAfterChange(this.currentSlide);
            }
          }, 200);
        });
    };


    /**
     * moveTrack
     * move track to left position using css3 translate
     * for example left: -1000px
     */
    this.moveTrack = (left) => {
      const deferred = $q.defer();
      if (this.options.vertical === false) {
        this.trackStyle[this.animType] = 'translate3d(' + left + 'px, 0px, 0px)';
      } else {
        this.trackStyle[this.animType] = 'translate3d(0px, ' + left + 'px, 0px)';
      }

      $timeout(() => {
        deferred.resolve('Track moved');
      }, this.options.speed);

      return deferred.promise;
    };

    /**
     * correctTrack
     * @description correct track after move to animSlide we have to move track
     * to exactly its position
     */
    this.correctTrack = () => {
      if (this.options.infinite) {
        let left = -1 * (this.currentSlide + this.options.slidesToShow) * this.itemWidth;

        // Move without anim
        this.trackStyle[this.transitionType] =
          this.transformType + ' ' + 0 + 'ms ' + this.options.cssEase;

        this.isTrackMoving = true;
        $timeout(() => {
          this.trackStyle[this.animType] = 'translate3d(' + left + 'px, 0, 0px)';

          // Revert animation
          $timeout(() => {
            this.trackStyle[this.transitionType] =
              this.transformType + ' ' + this.options.speed + 'ms ' + this.options.cssEase;

            this.isTrackMoving = false;
          }, 200);
        });
      }
    };

    /**
     * autoplay track
     * @description autoplay = true
     */
    this.autoplayTrack = () => {
      if (this.options.autoplay) {
        if (this.timeout) {
          $timeout.cancel(this.timeout);
        }

        this.timeout = $timeout(() => {
          this.next();

          $timeout.cancel(this.timeout);
          this.timeout = null;
        }, this.options.autoplaySpeed);
      }
    };

    this.getSlideStyle = index => {
      let style = this.slideStyle;
      if (this.options.fade) {
        const left = -1 * index * this.itemWidth;
        const uniqueStyle = {
          position: 'relative',
          top: '0px',
          left: left + 'px',
          'z-index': index === this.currentSlide? 10 : 9,
          opacity: index === this.currentSlide? 1 : 0,
        };

        if (index >= this.currentSlide - 1 && index <= this.currentSlide + 1) {
          uniqueStyle.transition = 'opacity 250ms linear';
        }

        style = angular.extend(style, uniqueStyle);
      }

      return style;
    };


    /**
     * setupInfinite
     * To make carouse infinite we need close number of slidesToShow elements to
     * previous elements and to after elements
     *
     * length = 8, show = 4, scroll = 3, current = 0
     *          ---------
     *          |       |
     *  |4|5|6|7|0|1|2|3|4|5|6|7|1|2|3|4
     *          |       |
     *          ---------
     */
    this.setupInfinite = () => {
      // Clone
      const len = this.slides.length;
      const show = this.options.slidesToShow;

      if (this.options.infinite && this.options.fade === false) {
        if (len > show) {
          const number = show;
          for (let i = 0; i < number; i++) {
            this.slidesInTrack.push(angular.copy(this.slides[i]));
          }
          for (let i = len -1; i >= len - show; i--) {
            this.slidesInTrack.unshift(angular.copy(this.slides[i]));
          }
        }
      }
    };

    /**
     * get number of dosts
     *
     * @return Array
     */
    this.getDots = () => {
      if (!this.slides) {
        return [];
      }

      const dots = Math.ceil(this.slides.length / this.options.slidesToScroll);

      let res = [];
      for (let i = 0; i < dots; i++) {
        res.push(i);
      }
      return res;
    };

    /**
     * set carousel property
     *
     * - animType
     * - transformType
     * - transitionType
     */
    this.setProps = () => {
      const bodyStyle = document.body.style;

      if (bodyStyle.OTransform !== undefined) {
        this.animType = 'OTransform';
        this.transformType = '-o-transform';
        this.transitionType = 'OTransition';
      }
      if (bodyStyle.MozTransform !== undefined) {
        this.animType = 'MozTransform';
        this.transformType = '-moz-transform';
        this.transitionType = 'MozTransition';
      }
      if (bodyStyle.webkitTransform !== undefined) {
        this.animType = 'webkitTransform';
        this.transformType = '-webkit-transform';
        this.transitionType = 'webkitTransition';
      }
      if (bodyStyle.msTransform !== undefined) {
        this.animType = 'msTransform';
        this.transformType = '-ms-transform';
        this.transitionType = 'msTransition';
      }
      if (bodyStyle.transform !== undefined && this.animType !== false) {
        this.animType = 'transform';
        this.transformType = 'transform';
        this.transitionType = 'transition';
      }

      this.transformsEnabled = true;
    };

    this.refreshCarousel = () => {
      if (this.slides && this.slides.length && this.slides.length > this.options.slidesToShow) {
        this.isVisibleDots = true;
        this.isVisiblePrev = true;
        this.isVisibleNext = true;
      }

      // Re-init UI
      this.initUI();
    };

    /**
     * refresh model
     */
    $scope.$watch('ctrl.slides', () => {
      this.refreshCarousel();
    });

    this.init();
  }]);
