import eventable from "../mixins/eventable";
import gui_helpers from "../mixins/gui_helpers";
import html from "../lib/html";
import Header from "./header";
import Results from "./results";

/**
 */
class Gui {
	constructor() {
		eventable(this);
		gui_helpers(this);

		this.mount("#packages-explorer .app");
		this.header = this.appendChild(new Header());
		this.appendChild(html("<hr />")[0]);
		this.appendChild(html("<div class='spinner'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>")[0]);
		this.results = this.appendChild(new Results());

		this.delegate_to(this.header, "channels");
		this.delegate_to(this.header, "channel");
		this.delegate_to(this.header, "query");
		this.delegate_to(this.header, "unfree");

		this.delegate_to(this.results, "first", ["click"]);
		this.delegate_to(this.results, "previous", ["click"]);
		this.delegate_to(this.results, "next", ["click"]);
		this.delegate_to(this.results, "last", ["click"]);
		this.update_results = this.results.update_results.bind(this.results);
		this.update_channel_data = this.results.update_channel_data.bind(this.results);
	}

	/**
	 * Delegates events + setter to another component.
	 */
	delegate_to(what, name, events = ["change"]) {
		this[`set_${name}`] = (...args) => {
			what[`set_${name}`](...args);
		};

		events.forEach((event) => {
			what.addEventListener(
				`${name}_${event}`,
				(...args) => this.sendEvent(`${name}_${event}`, ...args)
			);
		});
	}

	set_loading(state) {
		const action = state ? "add" : "remove";
		this.$node.classList[action]("loading");
	}
}

export default Gui;
