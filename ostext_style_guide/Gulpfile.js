require("babel-polyfill"); // Fixes some undefined is not a function bug when referencing
                           // Object.assign

var gulp = require('gulp');
var riot = require('gulp-riot');
var concat = require('gulp-concat');
var less = require('gulp-less');
var es = require('event-stream');

var paths = {
  tags: 'tags/*.tag',
  index: 'index.html',
  js: 'js/*.js',
  less: '*.less'
};

gulp.task('build', function() {
  return es.merge(
    gulp.src(paths.tags)
      .pipe(riot())
      .pipe(concat('tags.js'))
      .pipe(gulp.dest('dist/')),
    gulp.src(paths.index)
      .pipe(gulp.dest('dist/')),
    gulp.src(paths.js)
      .pipe(gulp.dest('dist/')),
    gulp.src(paths.less)
      .pipe(less())
      .pipe(concat('style-guide.css'))
      .pipe(gulp.dest('dist/'))
  );
});
