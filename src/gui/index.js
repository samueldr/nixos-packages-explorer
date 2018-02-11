import eventable from "../mixins/eventable";
import gui_helpers from "../mixins/gui_helpers";

import Header from "./header";

/**
 */
class Gui {
	constructor() {
		eventable(this);
		gui_helpers(this);

		this.mount("#packages-explorer .app");

		this.header = new Header();
		this.appendChild(this.header);

		this.delegate_to(this.header, "channels");
		this.delegate_to(this.header, "channel");
		this.delegate_to(this.header, "query");
		this.delegate_to(this.header, "unfree");
	}

	/**
	 * Delegates events + setter to another component.
	 */
	delegate_to(what, name, events = ["change"]) {
		this[`set_${name}`] = (...args) => {
			what[`set_${name}`](...args);
		};

		events.forEach((event) => {
			what.addEventListener(`${name}_${event}`, (...args) => this[`handle_${name}_${event}`](...args));

			this[`handle_${name}_${event}`] = (...args) => {
				this.sendEvent(`${name}_${event}`, ...args);
			};
		});
	}
}

export default Gui;
