
module.exports = {
	list: (list, andOr) => list.reduce((acc, v, i, a) => acc += (i ? (i === a.length - 1 ? ` ${andOr} ${v}` : `, ${v}`): v), '')
};
