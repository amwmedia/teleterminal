#!/usr/bin/env node
'use strict';

const handleStatic = require('./util/static-server');
const app = require('http').createServer(handleStatic);
const io = require('socket.io')(app, {serveClient: false});
const chalk = require('chalk');
const pty = require('node-pty');
const {args, requiredArgErrors} = require('./util/arguments');
const {interfaces} = require('./util/network');
const stringArgv = require('string-argv');
const {line, helpScreen} = require('./util/output-helpers');

const {port, cmd, multi, help, historyLines, clientArgs} = args;
let {interactive} = args;

if (help || requiredArgErrors.length) {
	if (requiredArgErrors.length && !help) {
		process.stdout.write(`\n${requiredArgErrors.join('\n')}\n`);
		process.exitCode = 1;
	}
	process.stdout.write(helpScreen());
	process.exit();
}

const cmdSplit = cmd.split(' ');
const cmdBin = cmdSplit.shift();
const cmdParams = stringArgv(cmdSplit.join(' '));

const singleSessionHistoryLines = parseInt(historyLines, 10);

const status = require('./util/status');

const [defCols, defRows] = [parseInt(args.cols, 10), parseInt(args.rows, 10)];
const [cwd, env] = [process.cwd(), process.env];
const makeSession = (params = {path: cmdParams, query: []}) => {
	const sessionParams = [...params.path, ...params.query];
	const sessionInst = pty.spawn(cmdBin, sessionParams, {cols: defCols, rows: defRows, cwd, env});
	status.addSession(sessionInst);
	sessionInst.on('exit', code => status.removeSession(sessionInst, code && 'fail' || 'succeed'));
	return sessionInst;
};
const exitMsg = (cols, code) => line(cols, 'end', chalk[code === 0 ? 'yellow' : 'red']);

let singleSession = null;
let singleSessionBuffer = '';
if (!multi) {
	// start up single session
	singleSession = makeSession();
	singleSession.on('data', d => {
		singleSessionBuffer += d;
		if (singleSessionBuffer.split('\n').length > singleSessionHistoryLines) {
			singleSessionBuffer = singleSessionBuffer
				.split('\n')
				.slice(singleSessionHistoryLines * -1)
				.join('\n');
		}
	});
	singleSession.on('exit', code => {
		interactive = 'off';
		singleSessionBuffer += exitMsg(defCols, code);
	});
}

io.on('connection', function (socket) {
	status.addClient(socket);
	socket.on('disconnect', () => status.removeClient(socket));
	let [cols, rows] = [defCols, defRows];

	let sessionInteractive = false;
	const clientAddress = socket.conn.remoteAddress.replace(/^.*?([\d\.]+).*?$/, '$1');
	const localAddrs = ['127.0.0.1', '1', ...interfaces];
	const isLocal = localAddrs.includes(clientAddress);
	if (interactive === 'local' && isLocal) { sessionInteractive = true; }
	if (interactive === 'all') { sessionInteractive = true; }

	const cmd = cmdParams.reduce((acc, v) => {
		const isSwitch = v.startsWith('-') || v.startsWith('/');
		if (acc.query.length === 0 && !isSwitch) {
			acc.path.push(v);
		} else {
			acc.query.push(v);
		}
		return acc;
	}, {path:[], query:[], bin: cmdBin});

	const handleSessionData = d => socket.emit('output', d);

	if (!multi) { socket.emit('output', singleSessionBuffer); }
	socket.on('client-config', (cfg) => {
		if (clientArgs && multi) {
			const hasPathParams = cfg.cmd.path && cfg.cmd.path.length;
			const hasQueryParams = cfg.cmd.query && cfg.cmd.query.length;
			if (hasPathParams || hasQueryParams || cfg.cmd.bin) {
				cmd.path = cfg.cmd.path;
				cmd.query = cfg.cmd.query;
			}
		}
		const session = (multi ? makeSession(cmd) : singleSession);
		if (multi) {
			({cols, rows} = cfg);
			session.resize(cols, rows);
		}

		socket.emit('server-config', {
			interactive: sessionInteractive,
			multi, cmd, cols, rows
		});

		session.on('data', handleSessionData);
		session.on('exit', code => socket.emit('output', exitMsg(cols, code)));
		if (sessionInteractive) { socket.on('input', d => session.write(d)); }
		socket.on('disconnect', () => {
			socket.removeAllListeners();
			session.removeListener('data', handleSessionData);
			if (multi) { session.destroy(); }
		});
	});
});

app.listen(port, (err) => {
	if (err) { return console.log('something bad happened', err); }
});
