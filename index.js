const S = require('s-js').default;

const currentURL = S.value(window.location.pathname);
const currentLeafs = S.data([]);
const currentComponent = S.value(null);
const selectedComponent = S.value(null);
const unknownComponent = S.value(
	() => document.createTextNode('Not found')
);

const routes = {};
const routesHaveUpdated = S.data();

const splitAndClean = pth => {
	const leafs = pth
		.trim()
		.replace(/^\/+|\/+$/g, '')
		.split(/\//g);

	if (leafs.length === 1 && leafs[0] === '') {
		return [];
	}

	return leafs;
}

function addRoute(path, renderer) {
	const leafs = splitAndClean(path);
	const vars = {};

	let cur = routes;
	for (let i = 0; i < leafs.length; i++) {
		let leaf = leafs[i];

		if (leaf[0] === ':') {
			vars[leaf.slice(1)] = i;
			leaf = '?';
		} else {
			leaf = '!' + leaf;
		}

		if (!cur.hasOwnProperty(leaf)) {
			cur[leaf] = {};
		}

		cur = cur[leaf];
	}

	cur['@'] = {vars, renderer};
	routesHaveUpdated(true);
}

S.root(() => {
	S(() => currentComponent(
		selectedComponent() || unknownComponent()
	));

	history.replaceState(
		currentURL(),
		window.title,
		currentURL()
	);

	window.addEventListener('popstate', ev => {
		currentURL(ev.state);
	});

	S(() => {
		routesHaveUpdated(); // Create dependency

		const leafs = Array.isArray(currentURL())
			? currentURL()
			: splitAndClean(currentURL());

		let cur = routes;
		for (let leaf of leafs) {
			if (cur.hasOwnProperty('!' + leaf)) {
				cur = cur['!' + leaf];
			} else if (cur.hasOwnProperty('?')) {
				cur = cur['?'];
			} else {
				selectedComponent(null);
				return;
			}
		}

		if (cur.hasOwnProperty('@')) {
			const {vars, renderer} = cur['@'];
			const props = {};
			for (const propName of Object.keys(vars)) {
				props[propName] = leafs[vars[propName]];
			}
			selectedComponent(renderer(props));
		} else {
			selectedComponent(null);
		}
	});
});

function goToUrl(newUrl) {
	currentURL(newUrl);

	const escapedURL = Array.isArray(newUrl)
		? '/' + (newUrl
			.map(leaf => encodeURIComponent(leaf))
			.join('/'))
		: newUrl.toString();

	history.pushState(
		newUrl,
		window.title, // not honored in modern browsers
		escapedURL
	);
}

module.exports = {
	add: addRoute,
	unknownRouteComponent: unknownComponent,
	component: currentComponent,
	go: goToUrl
}
