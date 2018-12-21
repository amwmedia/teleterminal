const chalk = require('chalk');
const {definitions} = require('./arguments');
const columnify = require('columnify');

const helpData = [
	{options: 'Options:', default: chalk.dim('Default'), description: chalk.dim('Description')},
	...definitions.map(d => {
		const allowedValues = (d.allowed ? chalk.yellow(`\n${d.allowed.join(' | ')}`) : '');
		return {
			options: d.args.join(', '),
			default: (typeof d.default === 'string' ? chalk.dim(d.default) : ''),
			description: `${chalk.dim(d.desc)}${allowedValues}`
		}
	})
];

module.exports = {
	line: (len, text = '', clr = v => v) => {
		text = ` ${text.toUpperCase()} `;
		const lineLen = (len - text.length) / 2;
		const lineLeft = chalk.gray('-'.repeat(Math.floor(lineLen)));
		const lineRight = chalk.gray('-'.repeat(Math.ceil(lineLen)));
		return `\n\r${lineLeft}${clr(text)}${lineRight}\n\r`;
	},
	helpScreen: () => (
`
Usage: teleterminal command [options]
       tt command [options]

${columnify(helpData, {
	showHeaders: false,
	columnSplitter: '   ',
	preserveNewLines: true
})}

Examples:
${chalk.dim('tt "ping something.com"')}
${chalk.dim('tt "ls -a" -i -m')}

`
	)
};
