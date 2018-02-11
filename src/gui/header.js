import html from "../lib/html";
import append from "../lib/append";
import on_change from "../lib/on_change";
import header_html from "./header.part.html";
import eventable from "../mixins/eventable";
import gui_helpers from "../mixins/gui_helpers";

/**
 */
class Header {
	constructor() {
		eventable(this);
		gui_helpers(this);

		// Using the HTML from the part file.
		this.$node = html(header_html)[0];

		// Attaches HTML events to form inputs.
		[
			"channel",
			"query",
			"unfree"
		].forEach(
			(name) => {
				const el = this.$node.querySelectorAll(`[name=${name}]`)[0];
				this[`$${name}`] = el;
				on_change(el, (value, e) => this.handle_change(name, value, e));
			}
		);
	}

	set_channels(channels) {
		this.$channel.innerHTML = "";
		this.$channel.appendChild(
			html(`<option disabled selected> — Select a channel — </option>`)[0]
		);

		// Adds the channels list.
		append(this.$channel, channels.map((name) => {
			const node = html(`<option></option>`)[0];
			node.value = name;
			node.innerText = name;

			return node;
		}));

		// Re-select the previously selected value.
		if (this.channel) {
			this.$channel.value = this.channel;
		}
	}

	set_channel(channel) {
		if (this.channel === channel) {
			return;
		}
		this.channel = channel;
		this.$channel.value = channel;
		this.sendEvent("channel_change", channel);
	}

	set_query(query) {
		if (this.query === query) {
			return;
		}
		this.query = query;
		this.$query.value = query;
		this.sendEvent("query_change", query);
	}

	set_unfree(unfree) {
		if (this.unfree === unfree) {
			return;
		}
		this.unfree = unfree;
		this.$unfree.checked = unfree;
		this.sendEvent("unfree_change", unfree);
	}

	/**
	 * Generic onchange handler.
	 *
	 * Assumes the state of the element is right (which it should be)
	 * This means that we do not need to change the DOM.
	 * Only set the value and trigger the right event.
	 */
	handle_change(name, value) {
		this[name] = value;
		this.sendEvent(`${name}_change`, value);
	}

}

export default Header;
