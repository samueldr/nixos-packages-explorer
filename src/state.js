import React, {Component} from "react";
import pick from "lodash/pick";
// import queryString from "query-string";
// import isEqual from "lodash/isEqual";

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
			"change_page",
			"set_channel",
			"set_query",
			"set_unfree",
		].forEach((fn) => { this[fn] = this[fn].bind(this); });
	}

	// FIXME : synchronize with URL.
	//	handle_popstate(e) {
	//		if (e.state) {
	//			const {state} = e;
	//			this.set_state(state, {push: false});
	//			this.sendEvent("state_change", state);
	//		}
	//		else {
	//			const state = queryString.parse(location.search);
	//			this.set_state(state, {push: false});
	//			this.sendEvent("state_change", state);
	//		}
	//	}

	componentWillMount() {
		this.fetch_channels();
		// FIXME : synchronize with URL.
		//		window.onpopstate = (e) => this.handle_popstate(e);
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

	set_query(query) {
		this.setState({query});
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
