import queryString from "query-string";
import isEqual from "lodash/isEqual";
import eventable from "./mixins/eventable";

/**
 * Maps the state of the application to the history API.
 * This is used to make the current view linkable.
 * In the URL, the hash part is **reserved for line numbers**.
 * (line number links are not implemented yet.)
 */
class State {

	/**
	 * Loads the state from URL.
	 *
	 * Prepares event listeners.
	 */
	constructor() {
		eventable(this);
		const params = queryString.parse(location.search);
		const {history} = window;
		// Loads from params in URL, then history in order of importance.
		this.params = Object.assign({}, params, history.state);

		window.onpopstate = (e) => this.handle_popstate(e);
	}

	handle_popstate(e) {
		if (e.state) {
			const {state} = e;
			this.set_state(state, {push: false});
			this.sendEvent("state_change", state);
		}
		else {
			const state = queryString.parse(location.search);
			this.set_state(state, {push: false});
			this.sendEvent("state_change", state);
		}
	}

	set_state(new_state, {push, force} = {}) {
		/* eslint-disable */
		if (push === undefined) { push = true; }
		if (force === undefined) { force = false; }
		/* eslint-enable */

		const {history} = window;
		const params = Object.assign({}, this.params, new_state);
		Object.keys(params).forEach((k) => {
			if (!params[k]) {
				Reflect.deleteProperty(params, k);
			}
		});

		if (!force && isEqual(params, this.params)) {
			// set_state won't fire on "identity" change.
			return;
		}

		this.params = params;

		if (push) {
			if (queryString.stringify(params).length > 0) {
				history.pushState(this.params, "", `?${queryString.stringify(params)}`);
			}
			else {
				history.pushState(this.params, "", window.location.pathname);
			}
		}
	}

	clear_state(with_state = {}) {
		this.params = {};
		return this.set_state(with_state, {force: true});
	}
}

export default State;
