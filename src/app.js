import ready from "./lib/ready";
import Gui from "./gui";
import "./styles";
import State from "./state";

/**
 */
class App {
	constructor() {
		// Only "boot" the app when the DOM is ready.
		ready(() => this.boot());
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
		fetch("/channels/packages_channels.json", {mode: "cors"})
			.then((response) => response.json())
			.then((channels) => this.gui.set_channels(channels))
		;

		// Hooks GUI events
		this.gui.addEventListener("channel_change", (name) => this.handle_channel_change(name));
		this.gui.addEventListener("query_change", (name) => this.handle_query_change(name));
		this.gui.addEventListener("unfree_change", (name) => this.handle_unfree_change(name));

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

		// TODO: determine if we cache the channels so changing between them doesn't re-fetch.
		fetch(`/channels/packages_${channel}.json`, {mode: "cors"})
			.then((response) => response.json())
			.then((data) => {
				// Ensures we update only for the currently selected channel.
				if (this.channel === channel) {
					this.set_channel_data(data);
				}
			})
		;
	}

	/**
	 * Re-filters on query change.
	 */
	handle_query_change(query) {
		this.state.set_state({query});
		this.query = name;
		// TODO : filter and save filtered query.
	}

	/**
	 * Re-filters on unfree change.
	 */
	handle_unfree_change(unfree) {
		this.state.set_state({unfree});
		this.unfree = name;
		// TODO : filter and save filtered query.
	}

	/**
	 * Updates what needs to be updated when channel data is retrieved.
	 */
	set_channel_data(data) {
		this.channel_data = data;
	}
}

export default App;
