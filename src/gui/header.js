import React from "react";
import Channels from "./channels";
import {use} from "../state";

const Header = ({query, set_query, unfree, set_unfree}) =>
	<header>
		<Channels />
		<div>
			<input
				name="query"
				type="text"
				class="search-query span3"
				placeholder="Search by name or description (regex allowed)"
				id="search"
				defaultValue={query}
				onChange={(event) => set_query(event.target.value)}
			/>
		</div>
		<div class="form-checkbox">
			<label>
				<input
					name="unfree"
					type="checkbox"
					checked={unfree}
					onClick={(event) => set_unfree(event.target.checked)}
				/><span>Show unfree packages</span>
			</label>
		</div>
	</header>
;

export default use(
	[
		"query",
		"unfree"
	],
	[
		"set_query",
		"set_unfree"
	],
	Header
);
