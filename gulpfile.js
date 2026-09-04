const gulp = require('gulp');
const concat = require('gulp-concat');

// Definice úkolu pro sestavení JS
gulp.task('build-js', function() {
	return gulp.src([
		// Zde definujte soubory v PŘESNÉM pořadí, jak mají jít za sebou
		"src/main/webapp/libs/qpx/src/qpx.core.js",
		"src/main/webapp/libs/qpx/src/qpx.widget.js",
		"src/main/webapp/libs/qpx/src/qpx.layout.js",
		"src/main/webapp/libs/qpx/src/qpx.template.js",
		"src/main/webapp/libs/qpx/src/qpx.button.js",
		"src/main/webapp/libs/qpx/src/qpx.buttongroup.js",
		"src/main/webapp/libs/qpx/src/qpx.textbox.js",
		/*
		*/
		"src/main/webapp/libs/qpx/src/qpx.parser.js"
	])
	.pipe(concat('jquery.qpx.all.js')) // Název výsledného souboru
	.pipe(gulp.dest('src/main/webapp/libs/qpx/')); // Cílová složka
});