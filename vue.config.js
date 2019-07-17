const VueSSRServerPlugin = require("vue-server-renderer/server-plugin"); //生成服务端清单
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin"); //生成客户端清单
const nodeExternals = require("webpack-node-externals"); //忽略node_modules文件夹中的所有模块
const merge = require("lodash.merge");
const TARGET_NODE = process.env.WEBPACK_TARGET === "node";
const target = TARGET_NODE ? "server" : "client";	//根据环境变量来指向入口
const isDev = process.env.NODE_ENV !== 'production'

module.exports = {
	baseUrl: isDev ? 'http://127.0.0.1:8080' : '',
	configureWebpack: () => ({
		// 将 entry 指向应用程序的 server / client 文件
		entry: `./src/entry-${target}.js`,
		// 对 bundle renderer 提供 source map 支持
		devtool: 'source-map',
		target: TARGET_NODE ? "node" : "web",
		node: TARGET_NODE ? undefined : false,
		output: {
			// filename: 'js/[name].js',
			// chunkFilename: 'js/[name].js',
			libraryTarget: TARGET_NODE ? "commonjs2" : undefined
		},
		// https://webpack.js.org/configuration/externals/#function
		// https://github.com/liady/webpack-node-externals
		// 外置化应用程序依赖模块。可以使服务器构建速度更快，
		// 并生成较小的 bundle 文件。
		externals: TARGET_NODE ? nodeExternals({
			// 不要外置化 webpack 需要处理的依赖模块。
			// 你可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
			// 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
			whitelist: [/\.css$/]
		}) : undefined,
		optimization: {
			splitChunks: {
				chunks: "async",
				minSize: 30000,
				minChunks: 2,
				maxAsyncRequests: 5,
				maxInitialRequests: 3
			}
		},
		plugins: [TARGET_NODE ? new VueSSRServerPlugin() : new VueSSRClientPlugin()]
	}),
	chainWebpack: config => {
		// config.resolve
		// 	.alias
		// 	.set('vue$', 'vue/dist/vue.esm.js');
		config.module
			.rule("vue")
			.use("vue-loader")
			.tap(options => {
				merge(options, {
					optimizeSSR: false
				});
			});
		config.module
			.rule('images')
			.use('url-loader')
			.tap(options => {
				merge(options, {
					limit: 1024,
					fallback:'file-loader?name=img/[path][name].[ext]'
				});
			});
	}
};
