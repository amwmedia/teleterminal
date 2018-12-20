const path = require('path');
const fs = require('fs');
const indexHtml = fs.readFileSync(path.resolve(__dirname, '../', 'dist', 'index.html'), 'utf8');

const staticCache = {};

module.exports = (req, res) => {
	const reqPath = path.join(__dirname, '../', 'dist', req.url);
	if (req.url.endsWith('/')) { res.end(indexHtml); return; }
	if (staticCache[reqPath]) { res.end(staticCache[reqPath]); return; }

	if (fs.existsSync(reqPath)) {
		const resData = fs.readFileSync(reqPath);
		staticCache[reqPath] = resData;
		res.end(resData);
	} else {
		res.end(indexHtml);
	}
};
