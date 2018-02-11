import html from "../lib/html";
import append from "../lib/append";
import on_change from "../lib/on_change";
import header_html from "./header.part.html";
import eventable from "../mixins/eventable";

/**
 * this.$node is part of the public API.
 */
class Header {
	constructor() {
		eventable(this);

		this.$node = html(header_html)[0];

		const {$node} = this;

		[
			"channel",
			"query",
			"unfree"
		].forEach(
			(name) => {
				const el = $node.querySelectorAll(`[name=${name}]`)[0];
				this[`$${name}`] = el;
				on_change(el, (value, e) => this.handle_change(name, value, e));
			}
		);
	}

	set_channels(channels) {
		// Keeps the selected value...
		const curr = this.$channel.value;

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

		// ... re-select the previously selected value.
		if (curr) {
			this.$channel.value = curr;
		}
	}

	handle_change(name, value, e) {
		this.sendEvent(`${name}_change`, value, e);
	}

}

export default Header;
