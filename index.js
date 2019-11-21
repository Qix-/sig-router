const S = require('s-js').default;

const requestedURL = S.value(window.location.pathname);
const filteredURL = S.value(window.location.pathname);
const currentURL = S.value(window.location.pathname);
const currentLeafs = S.data([]);
const currentComponent = S.value(null);
const selectedComponent = S.value(null);
const routeMiddleware = S.data((req, res) => res(req()));
const unknownComponent = S.value(
	() => document.createTextNode('Not found')
);

const routes = {};
const routesHaveUpdated = S.data();

const splitAndClean = pth => {
	const leafs = pth
		.trim()
		.replace(/^\/+|\/+$/g, '')
		.split(/\//g)
		.map(p => decodeURIComponent(p));

	if (leafs.length === 1 && leafs[0] === '') {
		return [];
	}

	return leafs;
}

const escapeUrl = newUrl =>
	Array.isArray(newUrl)
		? '/' + (newUrl
			.map(leaf => encodeURIComponent(leaf))
			.join('/'))
		: newUrl.toString();

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
	history.replaceState(
		S.sample(currentURL),
		window.title,
		S.sample(currentURL)
	);

	S(() => currentComponent(
		selectedComponent() || unknownComponent()
	));

	S(() => routeMiddleware()(requestedURL, filteredURL));

	S(() => {
		currentURL(escapeUrl(filteredURL()));
	});

	window.addEventListener('popstate', ev => {
		currentURL(ev.state);
	});

	S.on(filteredURL, () => {
		history.pushState(
			filteredURL(),
			window.title, // not honored in modern browsers
			escapeUrl(filteredURL())
		);
	}, null, true);

	S(() => {
		routesHaveUpdated(); // Create dependency

		const leafs = Array.isArray(currentURL())
			? currentURL()
			: splitAndClean(currentURL());

		currentLeafs(leafs);

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
	requestedURL(escapeUrl(newUrl));
}

module.exports = {
	add: addRoute,
	unknownRouteComponent: unknownComponent,
	middleware: routeMiddleware,
	component: currentComponent,
	go: goToUrl,
	get leafs() {
		return currentLeafs();
	}
}
