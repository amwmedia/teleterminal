import io from 'socket.io-client';
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
	socket.emit('client-config', {cols, rows});
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
	setClass('interactive', cfg.interactive);
	if (cfg.interactive) {
		xterm.on('data', d => socket.emit('input', d));
		xterm.focus();
	}
});






//
//
// // read route params and construct terminal config
// const params = location.pathname.split('/').slice(2);
// const {rows, cols} = xterm;
//
// // run the terminal command and focus on xterm
// socket.emit('run', {params, terminalConfig: {cols, rows}});
// xterm.focus();
