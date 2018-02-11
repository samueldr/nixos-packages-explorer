import bsod from "../lib/bsod";
import html from "../lib/html";
import replace_node from "../lib/replace_node";
import eventable from "../mixins/eventable";

import app_html from "./app.part.html";
import Header from "./header";

/**
 */
class Gui {
	constructor() {
		eventable(this);
		console.log("Creating interface...."); // eslint-disable-line

		// Hooks this class' node to an existing element.
		this.$node = window.document.querySelectorAll("#packages-explorer .app")[0];

		// Asserts it is hooked.
		if (!this.$node) {
			return bsod("Couldn't hook app.");
		}

		// Inserts this app's HTML.
		this.$node.innerHTML = "";
		this.$node.appendChild(html(app_html)[0]);

		this.header = new Header();
		replace_node(
			this.$node.querySelectorAll(".packages-explorer__header")[0],
			this.header.$node
		);
		this.header.addEventListener("channel_change", (name) => this.handle_channel_change(name));

		console.log("...interface created."); // eslint-disable-line
	}

	set_channels(channels) {
		this.header.set_channels(channels);
	}

	handle_channel_change(name) {
		this.sendEvent(`channel_change`, name);
	}
}

export default Gui;
