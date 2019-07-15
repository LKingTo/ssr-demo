// server.js
// 创建一个Vue实例
const Vue = require('vue');

const Koa = require('koa');
const app = new Koa();

// 创建一个 renderer
const renderer = require('vue-server-renderer').createRenderer();

// 添加一个中间件来处理所有请求
app.use(async (ctx, next) => {
	const vm = new Vue({
		data: {
			title: "ssr example",
			url: ctx.url
		},
		template: `<div>访问的 URL 是： {{ url }}</div>`
	});
	// 将 Vue 实例渲染为 HTML
	renderer.renderToString(vm, (err, html) => {
		if (err) {
			res.status(500).end('Internal Server Error')
			return
		}
		ctx.body = html
	});
});

const port = 1086;
app.listen(port, () => {
	console.log(`server started at localhost:${port}`);
});

