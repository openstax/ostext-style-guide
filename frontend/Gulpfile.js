require("babel-polyfill"); // Fixes some undefined is not a function bug when referencing
                           // Object.assign

var gulp = require('gulp');
var riot = require('gulp-riot');
var concat = require('gulp-concat');
var es = require('event-stream');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var paths = {
  tags: 'src/tags/*.tag',
  index: 'src/index.html',
  js: 'src/js/*.js',
  sass: 'src/scss/*.scss'
};

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded',
  includePaths: ['./node_modules/bulma']
}


// Static Server + watching scss/html files
gulp.task('serve', ['sass','riot'], function() {
  browserSync.init({
    server: "./src"
  });

  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.tags, ['js-watch']);
  gulp.watch('src/*.html').on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass',function() {
  return gulp.src(paths.sass)
      .pipe(sourcemaps.init())
      .pipe(sass(sassOptions).on('error', sass.logError))
      .pipe(sourcemaps.write())
      .pipe(autoprefixer())
      .pipe(gulp.dest("src/css"))
      .pipe(browserSync.stream());
});

gulp.task('riot', function() {
  return gulp.src(paths.tags)
      .pipe(riot())
      .pipe(concat('tags.js'))
      .pipe(gulp.dest('src/js'))
});

// create a task that ensures the `riotjs` task is complete before
// reloading browsers
gulp.task('js-watch', ['riot'], function(done) {
  browserSync.reload();
  done();
});

gulp.task('build', function() {
  return es.merge(
    gulp.src(paths.tags)
      .pipe(riot())
      .pipe(concat('tags.js'))
      .pipe(gulp.dest('dist/js')),
    gulp.src(paths.index)
      .pipe(gulp.dest('dist')),
    gulp.src(paths.js)
      .pipe(gulp.dest('dist/js')),
    gulp.src('src/data/*.json')
      .pipe(gulp.dest('dist/data')),
    gulp.src(paths.sass)
      .pipe(sass({includePaths: ['./node_modules/bulma']}))
      .pipe(autoprefixer())
      .pipe(concat('style-guide.css'))
      .pipe(gulp.dest('dist/css'))
  );
});

gulp.task('default', ['serve']);
