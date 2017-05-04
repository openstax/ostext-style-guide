'use strict';

import plugins  from 'gulp-load-plugins';
import yargs    from 'yargs';
import browser  from 'browser-sync';
import gulp     from 'gulp';
import webpack  from 'webpack-stream';
import webpack2 from 'webpack';
import rimraf   from 'rimraf';
import yaml     from 'js-yaml';
import fs       from 'fs';
import through  from 'through2';

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Load settings from config.yml
export const loadConfig = () => yaml.load(ymlFile)
  let ymlFile = fs.readFileSync('config.yml', 'utf8');

const config =  loadConfig(),
      COMPATIBILITY = config.COMPATIBILITY,
      PORT = config.PORT,
      UNCSS_OPTIONS = config.UNCSS_OPTIONS,
      PATHS = config.PATHS

// Delete the "dist" folder
// This happens every time a build starts
export const clean = (done) => {
  rimraf(PATHS.dist, done);
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
export const data = () => gulp.src(PATHS.data)
  .pipe(gulp.dest(PATHS.dist + '/assets/data'));

export const fonts = () => gulp.src(PATHS.fonts)
  .pipe(gulp.dest(PATHS.dist + '/assets/fonts'));

// Copy page templates into finished HTML files
export const pages = () => gulp.src('src/*.{html,hbs,handlebars}')
  .pipe(gulp.dest(PATHS.dist));

// Compile Sass into CSS
// In production, the CSS is compressed
export const sass = () => gulp.src('src/assets/scss/app.scss')
  .pipe($.sourcemaps.init())
  .pipe($.sass({
    includePaths: PATHS.sass
  }).on('error', $.sass.logError))
  .pipe($.autoprefixer({
    browsers: COMPATIBILITY
  }))
  // Comment in the pipe below to run UnCSS in production
  //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
  .pipe($.if(PRODUCTION, $.cssnano()))
  .pipe($.if(!PRODUCTION, $.sourcemaps.write('./')))
  .pipe(gulp.dest(PATHS.dist + '/assets/css'))
  .pipe(browser.reload({ stream: true, match: '**/*.css' }));

// Combine JavaScript into one file
// In production, the file is minified
export const javascript = () => gulp.src(PATHS.javascript)
  .pipe(webpack(require('./webpack.config.js'), webpack2))
  .pipe($.sourcemaps.init({loadMaps: true}))
  .pipe(through.obj(function (file, enc, cb) {
    // Dont pipe through any source map files as it will be handled
    // by gulp-sourcemaps
    let isSourceMap = /\.map$/.test(file.path);
    if (!isSourceMap) this.push(file);
    cb();
  }))
  .pipe($.if(PRODUCTION, $.uglify()
    .on('error', e => { console.log(e); })
  ))
  .pipe($.if(!PRODUCTION, $.sourcemaps.write('./')))
  .pipe(gulp.dest(PATHS.dist + '/assets/js'));

// Copy images to the "dist" folder
// In production, the images are compressed
export const images = () => gulp.src('src/assets/img/**/*')
  .pipe($.if(PRODUCTION, $.imagemin({
    progressive: true
  })))
  .pipe(gulp.dest(PATHS.dist + '/assets/img'));

// Start a server with BrowserSync to preview the site in
export const server = (done) => {
  browser.init({
    server: PATHS.dist, port: PORT
  });
  done();
}

// Reload the browser with BrowserSync
export const reload = (done) => {
  browser.reload();
  done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
export const watch = () => {
  gulp.watch(PATHS.data, data);
  gulp.watch(PATHS.fonts, fonts);
  gulp.watch('src/*.html').on('all', gulp.series(pages, reload));
  gulp.watch('src/assets/scss/**/*.scss').on('all', sass);
  gulp.watch('src/assets/js/**/*.js').on('all', gulp.series(javascript, reload));
  gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
  // gulp.watch('src/styleguide/**').on('all', gulp.series(styleGuide, browser.reload));
}

// Build the "dist" folder by running all of the below tasks
// gulp.task('build',
//  gulp.series(clean, gulp.parallel(pages, sass, javascript, images, copy)));
export const build = gulp.series(clean, gulp.parallel(pages, sass, javascript, images, data, fonts));

// Build the site, run the server, and watch for file changes
// gulp.task('default',
//   gulp.series('build', server, watch));
export const dev =  gulp.series(build, server, watch);

export default dev;
