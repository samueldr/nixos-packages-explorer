import React, {Component} from "react";
import pick from "lodash/pick";
import queryString from "query-string";
import isEqual from "lodash/isEqual";

const SYNCHRONIZED = [
	"channel",
	"unfree",
	"query",
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
			query: "",
			unfree: false,
			channel: null,
			channels: [],
		};

		[
			"handle_popstate",
			"change_page",
			"set_channel",
			"set_query",
			"set_unfree",
		].forEach((fn) => { this[fn] = this[fn].bind(this); });
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


		this.fetch_channels();
		window.addEventListener("popstate", this.handle_popstate);
	}

	setState(new_state, {push = true, force = false} = {}, ...args) {
		const {history} = window;
		const params = pick(Object.assign({}, this.state, new_state), SYNCHRONIZED);
		Object.keys(params).forEach((k) => {
			if (!params[k]) {
				Reflect.deleteProperty(params, k);
			}
		});

		if (!force && isEqual(params, this.params)) {
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

	fetch_channels() {
		this.setState({loading: true});
		fetch("channels/packages_channels.json", {mode: "cors"})
			.then((response) => response.json())
			.then((channels) => {
				this.setState({
					channels,
					loading: false
				});

				// No channel in state (from initial state)
				if (!this.state.channel) {
					const channel = channels[0];
					this.setState({channel});
				}
			})
		;

	}

	change_page(page) {
		this.setState({page});
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
		const {
			change_page,
			set_channel,
			set_query,
			set_unfree,
		} = this;

		return {
			app_state: {
				state,
				callbacks: {
					change_page,
					set_channel,
					set_query,
					set_unfree,
				},
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
