var gulp = require("gulp")
var postcss = require("gulp-postcss")
var BEMCLinter = require("./index.js")

gulp.task("default", function() {
  var processors = [
    BEMCLinter
  ]

  return gulp.src("./test.css")
    .pipe(postcss(processors))
})
