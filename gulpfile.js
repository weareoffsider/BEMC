var gulp = require("gulp");
var postcss = require("gulp-postcss");


gulp.task("default", function() {
  var processors = [
    require("./index.js")
  ];

  return gulp.src("./test.css")
    .pipe(postcss(processors));
});

