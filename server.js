#!/usr/bin/env node
'use strict';

const handleStatic = require('./util/static-server');
const app = require('http').createServer(handleStatic);
const io = require('socket.io')(app);
const chalk = require('chalk');
const pty = require('node-pty');
const {args, requiredArgErrors} = require('./util/arguments');
const stringArgv = require('string-argv');
const {line, helpScreen} = require('./util/output-helpers');
const progress = require('ora')();

const {port, cmd, multi, help, historyLines} = args;
let {interactive} = args;

if (help || requiredArgErrors.length) {
	if (requiredArgErrors.length && !help) {
		process.stdout.write(`${requiredArgErrors.join('\n')}\n`);
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
const makeSession = () => {
	const sessionInst = pty.spawn(cmdBin, cmdParams, {cols: defCols, rows: defRows, cwd, env});
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
		interactive = false;
		singleSessionBuffer += exitMsg(defCols, code);
	});
}

io.on('connection', function (socket) {
	status.addClient(socket);
	socket.on('disconnect', () => status.removeClient(socket));
	let [cols, rows] = [defCols, defRows];
	const handleSessionData = d => socket.emit('output', d);

	if (!multi) { socket.emit('output', singleSessionBuffer); }
	socket.on('client-config', (cfg) => {
		const session = (multi ? makeSession() : singleSession);
		if (multi) {
			({cols, rows} = cfg);
			session.resize(cols, rows);
		}
		socket.emit('server-config', {interactive, multi, cols, rows});
		session.on('data', handleSessionData);
		session.on('exit', code => socket.emit('output', exitMsg(cols, code)));
		if (interactive) { socket.on('input', d => session.write(d)); }
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
