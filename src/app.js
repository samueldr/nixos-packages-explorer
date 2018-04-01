import ready from "./lib/ready";
import Gui from "./gui";
import "./styles";
import State from "./state";
import debounce from "lodash/debounce";
import mapValues from "lodash/mapValues";
import refilter from "./refilter";
import {PER_PAGE} from "./conf";

const DEBOUNCE = 300;

/**
 * Represents the Application.
 *
 * This is also where the state is kept.
 *
 * To get the state, use the `App.app` reference.
 *
 * Be mindful and only use the state if necessary (e.g. to create links).
 * When *acting on state*, prefer using a `handle_*` function passed.
 */
class App {
	constructor() {
		// Only "boot" the app when the DOM is ready.
		ready(() => this.boot());

		this.refilter = debounce(this.refilter, DEBOUNCE);

		// Singletonize...
		App.app = this;
	}

	/**
	 * Hooks and starts the app.
	 *
	 * This means:
	 *   * Starts the GUI.
	 *   * Reads parameters.
	 */
	boot() {
		this.gui = new Gui();

		// Fetch the list of known channels.
		fetch("channels/packages_channels.json", {mode: "cors"})
			.then((response) => response.json())
			.then((channels) => {
				this.gui.set_channels(channels);
				if (!this.state.params["channel"]) {
					this.gui.set_channel(channels[0]);
				}
			})
		;

		// Hooks GUI events
		this.gui.addEventListener("channel_change", (name) => this.handle_channel_change(name));
		this.gui.addEventListener("query_change", (name) => this.handle_query_change(name));
		this.gui.addEventListener("unfree_change", (name) => this.handle_unfree_change(name));
		this.gui.addEventListener("first_click", (e) => this.handle_first_click(e));
		this.gui.addEventListener("previous_click", (e) => this.handle_previous_click(e));
		this.gui.addEventListener("next_click", (e) => this.handle_next_click(e));
		this.gui.addEventListener("last_click", (e) => this.handle_last_click(e));

		this.state = new State();
		this.state.addEventListener("state_change", (s) => this.handle_state_change(s));
		this.handle_state_change(this.state.params);
	}

	handle_state_change(new_state = {}) {
		const {channel, query, unfree} = new_state;
		if (channel !== this.channel) {
			this.gui.set_channel(channel);
		}
		if (query !== this.query) {
			this.gui.set_query(query);
			this.handle_query_change(query);
		}
		if (unfree !== this.unfree) {
			this.gui.set_unfree(unfree);
			this.handle_unfree_change(unfree);
		}
	}

	/**
	 * Fetches channel data on channel change.
	 */
	handle_channel_change(channel) {
		if (this.channel === channel) {
			return;
		}
		this.state.set_state({channel});
		this.channel = channel;
		this.gui.set_loading(true);

		// TODO: determine if we cache the channels so changing between them doesn't re-fetch.
		fetch(`channels/packages_${channel}.json`, {mode: "cors"})
			.then((response) => response.json())
			.then((data) => {
				// Ensures we update only for the currently selected channel.
				if (this.channel === channel) {
					this.set_channel_data(data);
					this.gui.set_loading(false);
				}
			})
		;
	}

	/**
	 * Re-filters on query change.
	 */
	handle_query_change(query) {
		this.state.set_state({query});
		this.query = query;
		this.refilter();
		// TODO : filter and save filtered query.
	}

	/**
	 * Re-filters on unfree change.
	 */
	handle_unfree_change(unfree) {
		this.state.set_state({unfree});
		this.unfree = unfree;
		this.refilter();
		// TODO : filter and save filtered query.
	}

	/**
	 * Updates what needs to be updated when channel data is retrieved.
	 */
	set_channel_data(data) {
		this.channel_data = data;
		// Massages-in the attribute, so we can simply slice the array.
		this.channel_data.packages = mapValues(data.packages, (p, attr) => Object.assign({attr}, p));
		this.gui.update_channel_data(this.channel_data);
		this.refilter();
	}

	/**
	 * Re-filters the data.
	 */
	refilter() {
		if (!this.channel_data) {
			return;
		}
		const {query, channel_data: {packages}, unfree} = this;
		this.filtered_packages = refilter(query, packages, {withUnfree: unfree});
		this.change_page();
	}

	/**
	 * Re-pages the results according to the page wanted.
	 */
	change_page(delta = null, {absolute} = {absolute: false}) {
		const {filtered_packages} = this;
		let page = parseInt(this.state.params.page, 10);

		if (absolute) {
			page = delta;
		}
		else {
			page += delta;
		}

		if (!page || page < 1) {
			page = 1;
		}

		const max_page = this.get_last_page();

		if (page > max_page) {
			page = max_page;
		}

		const beg = (page - 1) * PER_PAGE;
		const end = page * PER_PAGE;

		this.current_results = filtered_packages.slice(beg, end);
		this.gui.update_results(page, filtered_packages, this.current_results);
		this.state.set_state({page});
	}

	get_last_page() {
		return Math.ceil(this.filtered_packages.length / PER_PAGE);
	}

	handle_first_click() {
		this.change_page(0, {absolute: true});
	}

	handle_previous_click() {
		this.change_page(-1);
	}

	handle_next_click() {
		this.change_page(+1);
	}

	handle_last_click() {
		this.change_page(this.get_last_page(), {absolute: true});
	}
}

export default App;
