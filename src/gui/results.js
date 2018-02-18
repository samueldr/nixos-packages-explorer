import html from "../lib/html";
import eventable from "../mixins/eventable";
import gui_helpers from "../mixins/gui_helpers";
import Pager from "./pager";
import {PER_PAGE} from "../conf";

/**
 */
class Results {
	constructor() {
		eventable(this);
		gui_helpers(this);

		this.$node = html(`<div></div>`)[0];
		this.$results_count = this.appendChild(html(`<p class="results_count" />`)[0]);

		// Two pagers instances are in the page.
		this.$pagers = [];
		this.$pagers.push(
			this.appendChild(new Pager())
		);

		this.$pagers.push(
			this.appendChild(new Pager())
		);

		this.$pagers.forEach((pager) => {
			[
				"first",
				"previous",
				"next",
				"last",
			].forEach(
				(name) => pager.addEventListener(`${name}_click`, (...args) => this.sendEvent(`${name}_click`, ...args))
			);
		});

		this.$pages = this.appendChild(html(`<div class="pages" />`)[0]);
		this.$channel_data = this.appendChild(html(`<p class="channel_data" />`)[0]);
		this.update_results_count(1, 0);
	}

	/**
	 * Updates the "widget"'s text.
	 */
	update_results_count(page, amount) {
		const first = (page - 1) * PER_PAGE + 1;
		const last = Math.min(amount, page * PER_PAGE);
		this.$results_count.innerHTML = "";
		this.$results_count.appendChild(
			html(`<em>Showing results ${first}-${last} of ${amount}</em>`)[0]
		);
		this.$pagers.forEach((p) => p.update_results_count(page, amount));
		const last_page = Math.ceil(amount / PER_PAGE);
		this.$pages.innerText = `Page ${page}/${last_page}`;
	}

	/**
	 * Updates results shown.
	 */
	update_results(page, filtered_packages, current_results) {
		this.update_results_count(page, filtered_packages.length);
	}

	/**
	 * Updates "metadata" shown about the channel.
	 */
	update_channel_data(channel_data) {
		const {commit} = channel_data;
		this.$channel_data.innerText = "";
		const data = html(`<em><tt class="channel"></tt> commit <span class="commit"></span></em>`)[0];
		data.querySelectorAll(".channel")[0].innerText = "<nixpkgs>";
		data.querySelectorAll(".commit")[0].innerText = commit;
		this.$channel_data.appendChild(data);
	}
}

export default Results;
