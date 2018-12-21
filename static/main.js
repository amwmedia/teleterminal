import io from 'socket.io-client';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks';
import * as cmd from './util/params';

// define some variables
const domTerm = document.getElementById('terminal');

// define some helpers
const setClass = (cls, state) => {
	const classes = domTerm.className.split(' ').filter(n => n !== cls);
	if (state) { classes.push(cls); }
	domTerm.className = classes.join(' ');
};

// attach xterm addons
Terminal.applyAddon(fit);
Terminal.applyAddon(webLinks);

// init xterm
const xterm = new Terminal({cursorStyle: 'bar', cursorBlink: true});
window.xterm = xterm;
xterm.open(domTerm);
xterm.fit();
xterm.webLinksInit();

let {cols, rows} = xterm;

// establish socket connection and map terminal inputs and outputs
const socket = io();
socket.on('output', d => xterm.write(d));
socket.on('connect', () => {
	setClass('disconnected', false);
	xterm.clear();
	socket.emit('client-config', {cols, rows, cmd});
});
socket.on('disconnect', () => {
	setClass('disconnected', true);
	setClass('interactive', false);
});
socket.on('server-config', (cfg) => {
	if (cfg.cols !== cols || cfg.rows !== rows) {
		cols = cfg.cols; rows = cfg.rows;
		xterm.resize(cols, rows);
		setClass('strict-size', true);
	}
	if (cfg.cmd) {
		const {path, query, bin} = cfg.cmd;
		const sep = {
			p: (path.length ? '/' : ''),
			q: (query.length ? '?' : '')
		};
		const pathStr = path.map(p => p.replace(/^"?(.*?)"?$/, '$1')).join('/');
		const queryStr = query.map(p => p.replace(/^"?(.*?)"?$/, '$1')).join('&');
		const url = `/${bin}${sep.p}${pathStr}${sep.q}${queryStr}`;
		const cmd = `${bin} ${path.join(' ')} ${query.join(' ')}`;
		document.title = cmd;
		history.replaceState({}, cmd, url);
	}
	setClass('interactive', cfg.interactive);
	if (cfg.interactive) {
		xterm.on('data', d => socket.emit('input', d));
		xterm.focus();
	}
});
