import React, {Component} from "react";
import pick from "lodash/pick";
import queryString from "query-string";
import isEqual from "lodash/isEqual";
import {PER_PAGE} from "./conf";

const SYNCHRONIZED = [
	"channel",
	"unfree",
	"query",
	"page",
];

const CALLBACKS = [
	"change_page",
	"set_channel",
	"set_query",
	"set_unfree",
];

/**
 * App's state and callbacks.
 *
 * This is built in a way that forces components to declare what they want to use
 * from the state. Once declared, it is made available as props.
 *
 * See this as a poor man's redux store, but with tighter control.
 *
 * Some of this app's state is synchronized in the URL.
 *
 * Everything else is internal (large data mainly).
 */
class State extends Component {
	constructor() {
		super();

		this.state = {
			page: 1,
			loading: 0,
			query: "",
			unfree: false,
			channel: null,
			channels: [],
			channel_data: null,
			filtered_packages: [],
		};

		// Binding functions to `this` for use as callbacks.
		// `handle_popstate` is used to link history with state.
		["handle_popstate"]
			.concat(CALLBACKS)
			.forEach((fn) => { this[fn] = this[fn].bind(this); });
	}

	handle_popstate(e) {
		if (e.state) {
			const {state} = e;
			this.setState(state, {push: false});
		}
		else {
			const state = queryString.parse(location.search);
			this.setState(state, {push: false});
		}
	}

	componentWillMount() {
		const params = queryString.parse(location.search);
		const {history} = window;
		const state = Object.assign({}, params, history.state);
		this.setState(state);


		this.fetch_channels()
			.then(() => {
				this.fetch_channel();
			})
		;
		window.addEventListener("popstate", this.handle_popstate);
	}

	setState(new_state, {push = true, force = false} = {}, ...args) {
		const {history} = window;
		const params = pick(Object.assign({}, this.state, new_state), SYNCHRONIZED);
		Object.keys(params).forEach((k) => {
			if (k === "page" && params[k] <= 1) {
				Reflect.deleteProperty(params, k);
			}
			if (!params[k]) {
				Reflect.deleteProperty(params, k);
			}
		});

		if (!force && isEqual(params, pick(this.state, SYNCHRONIZED))) {
			// set_state won't fire on "identity" change.
			return Promise.resolve({});
		}

		if (push) {
			if (queryString.stringify(params).length > 0) {
				history.pushState(this.params, "", `?${queryString.stringify(params)}`);
			}
			else {
				history.pushState(this.params, "", window.location.pathname);
			}
		}

		return super.setState(new_state, ...args);
	}

	componentDidUpdate(prev_props, prev_state) {
		if (prev_state["channel"] !== this.state["channel"]) {
			this.fetch_channel();
		}
	}

	fetch_channels() {
		this.setState({loading: this.state.loading + 1});

		return fetch("channels/packages_channels.json", {mode: "cors"})
			.then((response) => response.json())
			.then((channels) => {
				this.setState({
					channels,
					loading: this.state.loading - 1
				});

				// No channel in state (from initial state)
				if (!this.state.channel) {
					const channel = channels[0];
					this.setState({channel});
				}
			})
		;

	}

	fetch_channel() {
		const {channel} = this.state;
		this.setState({loading: this.state.loading + 1});
		fetch(`channels/packages_${channel}.json`, {mode: "cors"})
			.then((response) => response.json())
			.then((channel_data) => {
				// Ensures we update only for the currently selected channel.
				if (this.state.channel === channel) {
					this.setState({channel_data});
					this.setState({loading: this.state.loading - 1});
				}
			})
		;

	}

	change_page(delta = null, {absolute} = {absolute: false}) {
		const {filtered_packages} = this.state;
		let page = parseInt(this.state.page, 10);

		if (absolute) {
			page = delta;
		}
		else {
			page += delta;
		}

		if (!page || page < 1) {
			page = 1;
		}

		const max_page = Math.ceil(filtered_packages.length / PER_PAGE);

		if (page > max_page) {
			page = max_page;
		}

		const beg = (page - 1) * PER_PAGE;
		const end = page * PER_PAGE;

		const current_results = filtered_packages.slice(beg, end);

		this.setState({
			page,
			current_results
		});
	}

	set_channel(channel) {
		this.setState({channel});
	}

	set_query(query, push = false) {
		this.setState({query}, {push});
	}

	set_unfree(unfree) {
		this.setState({unfree});
	}

	getChildContext() {
		const {state} = this;

		return {
			app_state: {
				state,
				callbacks: pick(this, CALLBACKS),
			}
		};
	}

	render({children}) {
		return children;
	}
}

/**
 * Given a component, returns the display name.
 */
function getDisplayName(WrappedComponent) {
	// https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging
	return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

/**
 * Declares a `Wrapped` component as using properties (`state`) and callbacks (`callback_names`) from state.
 */
const use = (state, callback_names, Wrapped) => {
	const C = (props, {app_state}) => {
		const state_data = pick(app_state.state, state);
		const callbacks = pick(app_state.callbacks, callback_names);
		return <Wrapped {...props} {...state_data} {...callbacks} />;
	};

	C.displayName = `use(${getDisplayName(Wrapped)})`;

	return C;
};

export {use};
export default State;
