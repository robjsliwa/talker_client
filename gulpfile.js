var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var notifier = require('node-notifier');
var server = require('gulp-server-livereload');
var watchify = require('watchify');
var sass = require('gulp-sass');
var concat = require('gulp-concat');

var notify = function(error) {
  var message = 'File: ';
  var title = 'Error: ';

  if(error.description) {
    title += error.description;
  } else if (error.message) {
    var msg = error.message.substring(error.message.indexOf(':') + 1).substring(0, 40);
    title += msg;
  }

  if(error.filename) {
    var file = error.filename.split('/');
    message += file[file.length-1];
  }

  if(error.loc) {
    message += '\nLine: ' + error.loc.line + ' Column: ' + error.loc.column;
  }

  console.log(error);

  notifier.notify({title: title, message: message});
};

gulp.task('build', function() {
  var entryFile = './src/app.jsx';
  var bundler = watchify(browserify(entryFile, {extensions: [ ".js", ".jsx" ]}));

  bundler.transform(babelify);

  function rebundle() {
    var stream = bundler.bundle();
    stream.on('error', notify);

    stream
      .pipe(source(entryFile))
      .pipe(rename('index.js'))
      .pipe(gulp.dest('public/'));
  }

  bundler.on('update', function() {
    rebundle();
  })

  return rebundle();
});

gulp.task('serve', function(done) {
  gulp.src('')
    .pipe(server({
      livereload: {
        enable: true,
        filter: function(filePath, cb) {
          if(/index.js/.test(filePath)) {
            cb(true)
          } else if(/style.css/.test(filePath)){
            cb(true)
          }
        }
      },
      open: true
    }));
});

gulp.task('sass', function () {
  gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('default', ['build', 'serve', 'sass', 'watch']);
