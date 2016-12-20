var gulp = require('gulp')
  , karma = require('karma').server
  , concat = require('gulp-concat')
  , rename = require('gulp-rename')
  , path = require('path')
  , plumber = require('gulp-plumber')
  , runSequence = require('run-sequence')
  , jshint = require('gulp-jshint')
  , babel = require('gulp-babel')
  , sass = require('gulp-sass')
  , pug = require('gulp-pug')
  , ngHtml2Js = require('gulp-ng-html2js')
  , sourcemaps = require('gulp-sourcemaps')
  , usemin = require('gulp-usemin')
  , uglify = require('gulp-uglify')
  , minifyCss = require('gulp-minify-css')
  , minifyHtml = require('gulp-minify-html');


/**
 * File patterns
 **/

// Root directory
var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src');

// tests
var testDirectory = path.join(rootDirectory, './test/unit');

var sourceFiles = [

  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),

  // Then add all JavaScript files
  path.join(sourceDirectory, 'ui-carousel/**/*.js')
];

var cssFiles = path.join(sourceDirectory, '/ui-carousel/scss/ui-carousel.scss');
var pugFiles = path.join(sourceDirectory, '/ui-carousel/templates/**/*.pug');
var demoFiles = path.join(sourceDirectory, '/demo');

var lintFiles = [
  'gulpfile.js',
  // Karma configuration
  'karma-*.conf.js'
].concat(sourceFiles);

gulp.task('build', ['pug'], function() {
  gulp.src(sourceFiles.concat([ './.tmp/carousel.template.js' ]))
    .pipe(plumber())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('ui-carousel.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename('ui-carousel.min.js'))
    .pipe(gulp.dest('./dist'));
});

/**
 * Process
 */
gulp.task('process-all', function (done) {
  runSequence('pug', 'demo', 'jshint', 'build', 'test', done);
});

/**
 * Watch task
 */
gulp.task('watch', function () {

  // Watch JavaScript files
  gulp.watch(sourceFiles, ['process-all']);
  gulp.watch(pugFiles, ['process-all']);
  gulp.watch(path.join(sourceDirectory, '/**/*.scss'), ['scss']);
  gulp.watch(path.join(sourceDirectory, '/ui-carousel/fonts/**/*'), ['other']);
  gulp.watch(path.join(demoFiles, '/**/*'), ['demo']);

  // watch test files and re-run unit tests when changed
  gulp.watch(path.join(testDirectory, '/**/*.js'), ['test']);
});

/**
 * stylesheet
 */
gulp.task('scss', function() {
  return gulp.src(cssFiles)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'))
    .pipe(minifyCss())
    .pipe(rename('ui-carousel.min.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist'));
});

gulp.task('other', function () {
  return gulp.src(sourceDirectory + '/ui-carousel/fonts/**/*')
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('pug', function() {
  return gulp.src(pugFiles)
    .pipe(pug({}))
    .pipe(gulp.dest('./.tmp'))
    .pipe(ngHtml2Js({
      moduleName: 'ui.carousel',
      prefix: 'ui-carousel/'
    }))
    .pipe(gulp.dest('./.tmp'));
});

gulp.task('demo', function() {
  gulp.src(demoFiles + '/*.pug')
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest('./demo'));

  gulp.src(demoFiles + '/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./demo'));

  gulp.src(demoFiles + '/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./demo'));
});

/**
 * Validate source JavaScript
 */
gulp.task('jshint', function () {
  return gulp.src(lintFiles)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma-src.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-concatenated', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-concatenated.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-minified', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-minified.conf.js',
    singleRun: true
  }, done);
});


/**
 * gh-pages pubish
 */
gulp.task('gh-pages', ['build'], function() {
  gulp.src('./demo/index.html')
    .pipe(usemin({
      css: [ minifyCss(), 'concat' ],
      html: [ minifyHtml({ empty: true }) ],
      js: [ uglify() ],
    }))
    .pipe(gulp.dest('_gh-pages/'));

  gulp.src('./demo/hero.png')
    .pipe(gulp.dest('_gh-pages/'));
});

gulp.task('default', function () {
  runSequence('watch');
});
