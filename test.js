import * as Surplus from 'surplus';
import S from 's-js';
import data from 'surplus-mixin-data';

const router = require('./index');


const Root = () => {
	const name = S.value("");
	const age = S.value("");

	router.unknownRouteComponent(() => (
		<div>
			<strong>Oh no!</strong> That doesn't appear to be a real page!
		</div>
	));

	router.add('/', () => (
		<div>Waiting...</div>
	));

	router.add('/greet', () => (
		<div>Hello!</div>
	));

	router.add('/greet/:name', ({name: _name}) => {
		name(_name);
		return (<div>Hello, {_name}!</div>);
	});

	router.add('/greet/:name/age/:age', ({name: _name, age: _age}) => {
		name(_name);
		age(_age);
		return (<div>Hello, {_name}! You are {_age} years old!</div>);
	});

	return (
		<div>
			<div style={{background: '#ddd', padding: '1rem'}}>
				{router.component()}
			</div>
			<div>
				<input type="text" placeholder="Name" fn={data(name)} />
				<input type="text" placeholder="Age" fn={data(age)} />
			</div>
			<div>
				<button
					onClick={() => router.go('/greet')}
				>
					/greet
				</button>

				<button
					onClick={() => router.go(['greet', name()])}
					disabled={name().length === 0}
				>
					/greet/{name()}
				</button>

				<button
					onClick={() => router.go(['greet', name(), 'age', age()])}
					disabled={name().length === 0 || age().length === 0}
				>
					/greet/{name()}/age/{age()}
				</button>

				<button
					onClick={() => router.go('/bad/route')}
				>
					/bad/route
				</button>
			</div>
			<div>
				<p>Some notes:</p>
				<p>
					<ul>
						<li>
							Try to inject parameters into the name field
							(e.g. `Foo/age/12`). The router protects against
							such attacks.
						</li>
						<li>
							Empty leafs work fine; it's up to the application
							to determine correctness (sig-router is
							intentionally lightweight and unopinionated).
						</li>
						<li>
							Try visiting the page with the `/greet/Name` path
							already appended. The router will report the name
							directly to the registered route.
						</li>
						<li>
							Try going forward and backward in time using the
							browser's Back and Forward buttons.
						</li>
					</ul>
				</p>
			</div>
		</div>
	);
};

S.root(() => {
	const root = document.getElementById('content');
	if (!root) {
		console.error('no element called #content');
		return;
	}

	root.innerHTML = '';
	root.appendChild(Root());
});
