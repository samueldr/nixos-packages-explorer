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
		this.$results_count = this.appendChild(html(`<p />`)[0]);

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
	}

	update_results(page, filtered_packages, current_results) {
		this.update_results_count(page, filtered_packages.length);
	}
}

export default Results;
