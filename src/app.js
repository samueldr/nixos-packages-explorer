import ready from "./lib/ready";
import Gui from "./gui";
import "./styles";

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
	}

	/**
	 * Fetches channel data on channel change.
	 */
	handle_channel_change(name) {
		this.channel = name;
		// TODO: determine if we cache the channels so changing between them doesn't re-fetch.
		fetch(`/channels/packages_${name}.json`, {mode: "cors"})
			.then((response) => response.json())
			.then((data) => {
				// Ensures we update only for the currently selected channel.
				if (this.channel === name) {
					this.channel_data = data;
				}
			})
		;
	}
}

export default App;
