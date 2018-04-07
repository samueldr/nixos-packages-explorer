import React from "react";
import {use} from "../state";
import flatten from "lodash/flatten";
import Pager from "./pager";
import Result, {ResultDetails} from "./result";
import {PER_PAGE} from "../conf";

const Commit = use(["channel_data"], [],
	({channel_data: {commit} = {}}) =>
		<p class="channel_data">
			<em>
				<tt class="channel">{"<nixpkgs>"}</tt>
				{" "}commit{" "}
				<span class="commit">{commit}</span>
			</em>
		</p>
);

const Count = use(
	[
		"page",
		"filtered_packages",
	], [],
	({page, filtered_packages}) => {
		const amount = filtered_packages.length;
		const first = (page - 1) * PER_PAGE + 1;
		const last = Math.min(amount, page * PER_PAGE);

		return (
			<p class="results_count">
				<em>Showing results {first}-{last} of {amount}</em>
			</p>
		);
	}
);

const Page = use(
	[
		"page",
		"filtered_packages",
	], [],
	({page, filtered_packages}) => {
		const amount = filtered_packages.length;
		const last_page = Math.ceil(amount / PER_PAGE);
		return (
			<div>Page {page}/{last_page}</div>
		);
	}
);

const Results = ({current_results, filtered_packages}) => 
	<section class="results">
		{
			filtered_packages.length < 1
				? <p class="empty">No results found.</p>
				: <div>
					<Count />
					<Pager />
					<div class="results-table">
						<table class="table table-hover" id="search-results">
							<thead>
								<tr><th>Package name</th><th>Attribute name</th><th>Description</th></tr>
							</thead>
							<tbody>
								{
									flatten(current_results.map((r, i) =>
										[
											<Result key={r["attr"]} even={i % 2 === 0} result={r} />,
											<ResultDetails key={r["attr"] + "$details"} even={i % 2 === 0} result={r} />,
										]
									))
								}
							</tbody>
						</table>
					</div>
					<Page />
					<Pager />
					<Commit />
				</div>
		}
	</section>
;

export default use(
	[
		"current_results",
		"filtered_packages",
	],
	[],
	Results
);
