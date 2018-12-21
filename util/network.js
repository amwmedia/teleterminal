
const os = require('os');
const ifaces = os.networkInterfaces();

module.exports = {
	interfaces: Object.keys(ifaces).reduce((acc, name) => acc.concat(
		ifaces[name]
			.filter(iface => (iface.family === 'IPv4' && iface.internal === false))
			.map(iface => iface.address)
	), [])
};
