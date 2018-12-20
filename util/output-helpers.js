const chalk = require('chalk');
const {definitions} = require('./arguments');
const columnify = require('columnify');

const helpData = definitions.map(d => ({
	options: d.args.map(a => chalk.yellow(a)).join(', '),
	default: (d.default == null ? chalk.red('REQUIRED') : chalk.dim(d.default)),
	description: d.desc
}))

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

Options:
${columnify(helpData, {showHeaders: false, columnSplitter: chalk.dim(' | ')})}

Examples:
tt 'ping something.com'
tt 'ls -a' -i -m

`
	)
};
