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

// Load all Gulp plugins into one variable
const $ = plugins();

// Variable for running cod inside gulp
const exec = require('child_process').exec;

// Run style-guide-codmark
export const buildJSON = (cb) => {
  exec('cd ../scripts/ && source venv/bin/activate && style-guide-codmark', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

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
  // Inject the favicon markups into HTML pages.
  .pipe($.realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
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
  // .pipe($.if(PRODUCTION, $.uglify()
  //   .on('error', e => { console.log(e); })
  // ))
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

// File where the favicon markups are stored
let FAVICON_DATA_FILE = 'src/faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
export const generatefavicon = (done) => {
	$.realFavicon.generateFavicon({
		masterPicture: 'src/favicon.png',
		dest: PATHS.dist + '/assets/img/icons',
		iconsPath: '/assets/img/icons',
		design: {
			ios: {
				pictureAspect: 'backgroundAndMargin',
				backgroundColor: '#ffffff',
				margin: '21%',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: true,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'whiteSilhouette',
				backgroundColor: '#0dc0dc',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					name: 'OpenGuide',
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			},
			safariPinnedTab: {
				pictureAspect: 'silhouette',
				themeColor: '#0dc0dc'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
}

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
export const checkForFaviconUpdate = (done) => {
	let currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	$.realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
}

// Watch for changes to static assets, pages, Sass, and JavaScript
export const watch = () => {
  gulp.watch(PATHS.data).on('all', gulp.series(data, reload));
  gulp.watch(PATHS.fonts).on('all', gulp.series(fonts, reload));
  gulp.watch('src/*.html').on('all', gulp.series(pages, reload));
  gulp.watch('src/assets/scss/**/*.scss').on('all', sass);
  gulp.watch('../scripts/test/cod_documentation/**/*.scss', buildJSON);
  gulp.watch('src/assets/js/**/*.js').on('all', gulp.series(javascript, reload));
  gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
}

// Build the "dist" folder by running all of the below tasks
export const build = gulp.series(buildJSON, clean, generatefavicon, gulp.parallel(pages, sass, javascript, images, data, fonts));

// Build the site, run the server, and watch for file changes
export const dev =  gulp.series(build, server, watch);

export default dev;
