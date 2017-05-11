'use strict';

let gulp = require('gulp'),
	spawn = require('child_process').spawn,
	server = require('gulp-develop-server'),
	rollup = require('rollup'),
	rConfig = require('./rollup.config'),
	chalk = require('chalk'),
	nodemon = require("gulp-nodemon"),
	exec = require('child_process').exec,
	babel = require('gulp-babel');


// Server start
gulp.task("server:restart-client", restartClient);
gulp.task("compile:client", bundleClient);
gulp.task('compile:server', compileServer);
gulp.task("server:start", startServer);

gulp.task("compile", ["compile:client", "compile:server"]);

// WATCH
// =====
gulp.task("default", ["compile", "server:start", "watch"]);

gulp.task("watch", () => {
	gulp.watch(["src/client/**/*"], ["compile:client"]);
	gulp.watch(["src/server/**/*"], ["compile:server"]);
});

function bundleClient() {
	return rollup.rollup(rConfig)
		.then(bundle => {
			bundle.write({
				format: 'iife',
				dest: 'build/client/index.js',
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM'
				},
			});
		})
		.catch(err => {
			console.error(chalk.red(err.message));
			console.error(chalk.grey(err.formatted && err.formatted.replace('Error: ' + err.message + '\n', '')));
		});
}

function compileServer() {
	return gulp
		.src(['./src/server/**/*.js', '!./node_modules/**/*']) // your ES2015 code 
		.pipe(babel({
			presets: ['es2015', 'node6'],
		})) // compile new ones 
		.pipe(gulp.dest('./build/server'))
		.on('error', e => console.error('server compiliation error', e)) &&
		gulp.src(['./src/server/**/*', '!./src/server/**/*.js', '!./node_modules/**/*'])
		.pipe(gulp.dest("./build/server"))
		.on('error', e => console.error('server compiliation error', e));
}

function startServer() {
	let nodemonProc = exec("npm run start-server");

	nodemonProc.stdout.on('data', function (data) {
		console.log(data.toString().replace(/\n$/, ''));
	});

	nodemonProc.stderr.on('data', function (data) {
		console.error(data.toString().replace(/\n$/, ''));
	});
}

function restartClient() {
	console.error(chalk.green("Restarting server"));
	server.restart();
}