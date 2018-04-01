import html from "../lib/html";
import eventable from "../mixins/eventable";
import gui_helpers from "../mixins/gui_helpers";
import append from "../lib/append";
import Pager from "./pager";
import Result from "./result";
import {PER_PAGE} from "../conf";

/**
 */
class Results {
	constructor() {
		eventable(this);
		gui_helpers(this);

		this.$node = html(`<div class="results"></div>`)[0];
		this.$node.classList.add("no-channel");
		this.$results_node = this.appendChild(html(`<div class="results-table" />`)[0]);
		this.$channel_data = this.appendChild(html(`<p class="channel_data" />`)[0]);
	}

	results_dom() {
		this.$results_node.innerHTML = "";
		this.$results_count = html(`<p class="results_count" />`)[0];
		this.$results_node.appendChild(this.$results_count);

		let pager = null;

		// Two pagers instances are in the page.
		this.$pagers = [];
		pager = new Pager();
		this.$results_node.appendChild(pager.$node)
		this.$pagers.push(pager);

		this.$results = html(`
			<table class="table table-hover" id="search-results">
				<thead>
				<tr><th>Package name</th><th>Attribute name</th><th>Description</th></tr>
				</thead>
				<tbody>
				</tbody>
			</table>
		`)[0];

		this.$results_node.appendChild(this.$results);

		pager = new Pager();
		this.$results_node.appendChild(pager.$node)
		this.$pagers.push(pager);

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

		this.$pages = this.$results.appendChild(html(`<div class="pages" />`)[0]);
		this.update_results_count(1, 0);
	}

	no_results_dom() {
		this.$results_node.innerHTML = "";
		this.$results_node.appendChild(html(`<p class="empty">No results found.</p>`)[0])
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
		if (filtered_packages.length === 0) {
			this.no_results_dom();
			return;
		}
		this.results_dom();
		this.update_results_count(page, filtered_packages.length);
		const {$results} = this;
		const $body = $results.querySelectorAll("tbody")[0];
		$body.innerText = "";
		
		let i = 0;
		this.current_result_instances = current_results.map((result) => {
			i += 1;
			const r = new Result(result, {odd: i % 2 !== 0});
			r.addEventListener("click", () => this.on_result_click());
			append($body, r.$nodes);

			return r;
		});
	}

	on_result_click() {
		this.current_result_instances.forEach((r) => r.hide());
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
		this.$node.classList.remove("no-channel");
	}
}

export default Results;
