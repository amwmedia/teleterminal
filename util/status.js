const {args} = require('./arguments');
const boxen = require('boxen');
const chalk = require('chalk');
const status = {sessions: [], clients: []};
const {port, cmd, multi, interactive} = args;
const progress = require('ora')({hideCursor: false});

module.exports = {
	addSession: (session) => {
		add('sessions', session, `${cmd} ${chalk.dim(`(PID:${session._pid})`)}`);
		progress.start();
	},
	removeSession: (session, result = 'info') => {
		const entry = remove('sessions', session);
		progress[result](entry.title);
		progress.start();
	},
	addClient: client => add('clients', client),
	removeClient: client => remove('clients', client)
};

function add(type, target, msg = '') {
	const entry = {target, title: msg};
	status[type].push(entry);
	progress.text = getStatusDisplay();
	return entry;
}

function remove(type, target) {
	const entry = status[type].find(v => v.target === target);
	status[type] = status[type].filter(v => v !== entry);
	progress.text = getStatusDisplay();
	return entry;
}

function getStatusDisplay() {
	const numClients = status.clients.length;
	const numSessions = status.sessions.length;
	const boxOutput = [
		`${numClients} client${numClients !== 1 ? 's' : ''} connected`,
		`${numSessions} session${numSessions !== 1 ? 's' : ''} active`,
	].join('\n');
	const totalActiveThings = status.clients.length + status.sessions.length;
	const activeClr = !!totalActiveThings ? 'blue' : 'dim';
	progress.color = activeClr;
	const sessionsOutput = status.sessions.map(s => `${chalk.blue('-')} ${chalk.italic(s.title)}`).join('\n');
	return [
		chalk[activeClr](`http://localhost:${port}`),
		...(sessionsOutput.length ? [sessionsOutput] : []),
		boxen(boxOutput, {padding: 1}),
		''
	].join('\n');
}
