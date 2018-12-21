
let {pathname, search} = window.location;

if (search.startsWith('?')) { search = search.slice(1); }
const queryVals = search.split('&');

const formatValue = v => {
	const decodedVal = decodeURIComponent(v);
	const formattedVal = (
		(/[\s"]/g).test(decodedVal) // if val has spaces or "
		? `"${decodedVal.replace(/"/g, '\\\"')}"` // escape the " and wrap in ""
		: decodedVal // do nothing, value is fine as is
	);
	return formattedVal;
};

const pathArr = pathname
	.split('/')
	.filter(p => p.length)
	.map(p => formatValue(p));


export const bin = (pathArr.length >= 1 ? pathArr.shift() : '');
export const path = pathArr;

export const query = queryVals
	.filter(v => v.length)
	.reduce((acc, v) => {
		const vArr = v.split('=')
			.filter(c => c.length)
			.map(c => formatValue(c));
		if (vArr[0].startsWith('/') || vArr[0].startsWith('-')) {
			return acc.concat(vArr);
		} else {
			return acc;
		}
	}, []);
