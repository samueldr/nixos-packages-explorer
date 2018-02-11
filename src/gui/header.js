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
		this.channel = channel;
		this.$channel.value = channel;
		this.sendEvent("channel_change", channel);
	}

	set_query(query) {
		this.query = query;
		this.$query.value = query;
		this.sendEvent("query_change", query);
	}

	set_unfree(unfree) {
		this.unfree = unfree;
		this.$unfree.checked = unfree;
		this.sendEvent("unfree_change", unfree);
	}

	handle_change(name, value) {
		this[name] = value;
		this.sendEvent(`${name}_change`, value);
	}

}

export default Header;
