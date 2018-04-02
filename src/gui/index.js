import React from "react";
import {use} from "../state";
import Loading from "./loading";
import Header from "./header";
import Pager from "./pager";
// import Results from "./results";

const Commit = use(["channel_data"], [],
	({channel_data: {commit} = {}}) =>
		<em>
			<tt class="channel">{"<nixpkgs>"}</tt>
			{" "}commit{" "}
			<span class="commit">{commit}</span>
		</em>
);

const Gui = ({loading, channel_data}) =>
	<div id="packages-explorer" class="app">
		<Header />
		<hr />
		{
			channel_data && !loading
				? <section>
					<Pager />
					<Pager />
					<Commit />
				</section>
				: <Loading />
		}
	</div>
;

export default use(
	[
		"loading",
		"channel_data",
	],
	[],
	Gui
);
