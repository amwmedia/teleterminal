const chalk = require('chalk');
const argv = require('minimist')(process.argv.slice(2));
const hList = require('./humanize').list;

const definitions = [{
		prop: 'interactive', desc: 'Allow users to send keyboard input',
		args: ['-i', '--interactive'], default: 'none', allowed: ['none', 'all', 'local']
	},{
		prop: 'multi', desc: 'Start a new instance of the command for each connected user',
		args: ['-m', '--multi-session'], default: false
	},{
		prop: 'clientArgs', desc: 'Allow the path and query dictate the command args (multi-session only)',
		args: ['-a', '--allow-client-args'], default: false
	},{
		prop: 'port', desc: 'TCP port for the server to listen on',
		args: ['-p', '--port'], default: '3000'
	},{
		prop: 'help', desc: 'Show this help screen',
		args: ['-h', '--help'], default: false
	},{
		prop: 'historyLines', desc: 'Lines of command history to serve (single-session only)',
		args: ['--history'], default: '1000'
	},{
		prop: 'cols', desc: 'Number of terminal columns (single-session only)',
		args: ['--cols'], default: '80'
	},{
		prop: 'rows', desc: 'Number of terminal rows (single-session only)',
		args: ['--rows'], default: '43'
}];

const requiredArgErrors = [];
const args = definitions.reduce((acc, aDef) => {
	const argFullName = aDef.args
		.find(a => argv.hasOwnProperty(a.replace(/^-*(.*)/g, '$1')));
	const argNormName = aDef.args
		.map(a => a.replace(/^-*(.*)/g, '$1'))
		.find(a => argv.hasOwnProperty(a));

	// if there's no default value and no value is supplied, it's an error
	if (argFullName == null && aDef.default == null) {
		requiredArgErrors.push(chalk.red(`argument "${aDef.args.join(' or ')}" is required`));
	}

	if (argNormName && aDef.allowed && !aDef.allowed.includes(argv[argNormName])) {
		const propVal = (argv[argNormName] === true ? '' : argv[argNormName]);
		const propAllowedVals = hList(aDef.allowed.map(x => `"${x}"`), 'or');
		requiredArgErrors.push(chalk.red(`${argFullName} must be ${propAllowedVals}. "${propVal}" is invalid.`));
	}

	acc[aDef.prop] = (argFullName == null ? aDef.default : argv[argNormName]);
	return acc;
}, {cmd: argv._[0]});

if (argv._.length === 0) {
	requiredArgErrors.push(chalk.red(`command is required`));
}

module.exports = {
	definitions, args, requiredArgErrors
};
