const parts = require("./webpack.parts");
const { merge } = require('webpack-merge');

const fs = require('fs');
const path = require('path');


const production = (sourceMaps) => {
	return {
		devtool: sourceMaps ? 'source-map' : undefined,
		mode: 'production',
	}
};

const development = (watchChanges) => {
	return {
		devtool: 'source-map',
		mode: 'development',
		watch: !!watchChanges,
		stats: {
			builtAt: true
		}
	}
}

const getConfig = (env) => {
	switch (env.mode) {
		case "production":
			return [
				merge(parts.main(env.appVersion, undefined, env.appRepositoryType), production(env.sourceMaps)),
				merge(parts.renderers(env.appRepositoryType), production(env.sourceMaps)),
				merge(parts.preload(), production(env.sourceMaps))
			];
		case "development":
			return [
				merge(parts.main(env.appVersion, undefined, env.appRepositoryType), development(env.watchChanges)),
				merge(parts.renderers(env.appRepositoryType), development(env.watchChanges)),
				merge(parts.preload(), development(env.watchChanges))
			];
		default:
			throw new Error(`Trying to use an unknown mode, ${ mode }`);
	}
};

console.log('\x1b[32m%s\x1b[0m', 'Cleaning up dist folder...');
const distDir = path.resolve(__dirname, 'dist');
fs.rmSync(distDir, { recursive: true, force: true });
console.log('\x1b[32m%s\x1b[0m', 'Starting build...');
fs.mkdirSync(distDir);
fs.writeSync(fs.openSync(path.resolve(distDir, '.npmrc'), "ax"), "recursive-install=false\n");

module.exports = (env) => getConfig(env);
