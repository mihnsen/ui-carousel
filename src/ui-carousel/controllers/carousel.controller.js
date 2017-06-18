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
  '$scope', '$element', '$timeout', '$q', 'Carousel', '$window',
  function ($scope, $element, $timeout, $q, Carousel, $window) {

    /**
     * Initial carousel
     *
     * Mirgate to angularjs 1.6
     * @see https://docs.angularjs.org/guide/migration#commit-bcd0d4
     */
    this.$onInit = () => {
      this.initOptions();
      this.initRanges();
      this.setProps();
      this.setupInfinite();
    };

    /**
     * Init option based on directive config
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
      if (this.visiblePrev !== undefined) {
        this.options.visiblePrev = this.visiblePrev;
      }
      if (this.visibleNext !== undefined) {
        this.options.visibleNext = this.visibleNext;
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
      this.isVisiblePrev = this.options.visiblePrev;
      this.isVisibleNext = this.options.visibleNext;

      this.isClickablePrev = false;
      this.isClickableNext = false;

      this.animType = null;
      this.transformType = null;
      this.transitionType = null;
    };

    /**
     * Init UI and carousel track
     */
    this.initUI = () => {
      this.width = $element[0].clientWidth;

      // Update track width first
      this.initTrack();

      // Then item style
      $timeout(() => {
        this.updateItemStyle();
      }, 200);
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
            this.refreshTrackStyle();
          }

          // onInit callback
          if (this.onInit) {
            this.onInit();
          }
        })
        .catch(() => {
          // Catch err
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
      if (!this.isClickableNext) {
        return false;
      }

      const indexOffset = this.getIndexOffset();
      const slideOffset = indexOffset === 0
        ? this.options.slidesToScroll
        : indexOffset;

      this
        .slideHandler(this.currentSlide + slideOffset)
        .catch(() => {
          // Catch err
        });
    };

    /**
     * move to previous slide
     * same calculate with next
     * @see next function
     */
    this.prev = () => {
      if (!this.isClickablePrev) {
        return false;
      }

      const indexOffset = this.getIndexOffset();
      const slideOffset = indexOffset === 0
        ? this.options.slidesToScroll
        : this.options.slidesToShow - indexOffset;

      this
        .slideHandler(this.currentSlide - slideOffset)
        .catch(() => {
          // Catch err
        });
    };

    /**
     * Get index offset
     */
    this.getIndexOffset = () => {
      const scrollOffset = this.slides.length % this.options.slidesToScroll !== 0;
      const indexOffset = scrollOffset
        ? 0
        : (this.slides.length - this.currentSlide) % this.options.slidesToScroll;

      return indexOffset;
    };

    /**
     * move to page
     * @params int page
     * Page counter from 0 (start = 0)
     */
    this.movePage = (page) => {
      const target = this.options.slidesToScroll * page;
      this
        .slideHandler(target)
        .catch(() => {
          // Catch err
        });
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
        this.correctTrack();
        return $q.reject('Length of slides smaller than slides to show');
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
        // @see https://docs.angularjs.org/guide/directive
        this.onBeforeChange({ currentSlide: this.currentSlide, target: target });
      }

      // Fade handler
      if (this.options.fade) {
        this.currentSlide = target;

        // XXX
        // afterChange method
        // fire after faded
        // Should be revised
        $timeout(() => {
          this.autoplayTrack();

          if (this.onAfterChange) {
            this.onAfterChange({ currentSlide: this.currentSlide });
          }
        }, this.options.speed);
        return $q.when('Handler fade');
      }

      // No-fade handler
      const itemWidth = this.width / this.options.slidesToShow;
      let left = -1 * target * itemWidth;
      if (this.options.infinite) {
        left = -1 * (anim + show) * itemWidth;
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

          if (!this.options.infinite) {
            if (this.currentSlide === 0) {
              this.isClickablePrev = false;
              this.isClickableNext = true;
            } else if (this.currentSlide === this.slidesInTrack.length - this.options.slidesToShow) {
              this.isClickableNext = false;
              this.isClickablePrev = true;
            } else {
              this.isClickablePrev = true;
              this.isClickableNext = true;
            }
          }

          // XXX
          // afterChange method
          // fire after 200ms wakeup and correct track
          // Should be revised
          $timeout(() => {
            if (this.onAfterChange) {
              this.onAfterChange({ currentSlide: this.currentSlide });
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
        let left = 0;
        if ( this.slides.length > this.options.slidesToShow ) {
          left = -1 * (this.currentSlide + this.options.slidesToShow) * this.itemWidth;
        }

        // Move without anim
        this.trackStyle[this.transitionType] =
          this.transformType + ' ' + 0 + 'ms ' + this.options.cssEase;

        this.isTrackMoving = true;
        $timeout(() => {
          this.trackStyle[this.animType] = 'translate3d(' + left + 'px, 0, 0px)';

          // Revert animation
          $timeout(() => {
            this.refreshTrackStyle();
            this.isTrackMoving = false;
          }, 200);
        });
      }
    };

    /**
     * Refresh track style
     */
    this.refreshTrackStyle = () => {
      this.trackStyle[this.transitionType] =
        this.transformType + ' ' + this.options.speed + 'ms ' + this.options.cssEase;
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
          opacity: index === this.currentSlide? 1 : 0
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

      let tmpTrack = angular.copy(this.slides);

      if (this.options.infinite && this.options.fade === false) {
        if (len > show) {
          const number = show;
          for (let i = 0; i < number; i++) {
            tmpTrack.push(angular.copy(this.slides[i]));
          }
          for (let i = len -1; i >= len - show; i--) {
            tmpTrack.unshift(angular.copy(this.slides[i]));
          }
        }
      }

      this.slidesInTrack = tmpTrack;
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

      /* eslint-disable */
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
      /* eslint-enable */

      this.transformsEnabled = true;
    };

    /**
     * Refresh carousel
     */
    this.refreshCarousel = () => {
      if (this.slides && this.slides.length && this.slides.length > this.options.slidesToShow) {
        this.isVisibleDots = true;
        this.isVisiblePrev = true;
        this.isVisibleNext = true;
        this.isClickablePrev = true;
        this.isClickableNext = true;
      } else {
        this.isVisibleDots = false;
        this.isVisiblePrev = this.options.visiblePrev || false;
        this.isVisibleNext = this.options.visibleNext || false;
        this.isClickablePrev = false;
        this.isClickableNext = false;
      }

      // Re-init UI
      this.initUI();
    };

    /**
     * refresh model
     */
    $scope.$watchCollection('ctrl.slides', slides => {
      if (!slides) {
        return;
      }

      // Init carousel
      if (this.currentSlide > slides.length - 1) {
        this.currentSlide = slides.length - 1;
      }

      this.setupInfinite();
      this.refreshCarousel();
    });

    /**
     * update when resize
     *
     * @see https://github.com/mihnsen/ui-carousel/issues/10
     * @author tarkant
     */
    angular.element($window).on('resize', this.refreshCarousel);

    /**
     * cleanup when done
     *
     * @see https://github.com/mihnsen/ui-carousel/issues/10
     * @author tarkant
     */
    $scope.$on('$destroy', function () {
      angular.element($window).off('resize');
    });

    // Prior to v1.5, we need to call `$onInit()` manually.
    // (Bindings will always be pre-assigned in these versions.)
    if (angular.version.major === 1 && angular.version.minor < 5) {
      this.$onInit();
    }
  }]);
