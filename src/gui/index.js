import React from "react";
import {use} from "../state";
import Loading from "./loading";
import Header from "./header";
import Pager from "./pager";
// import Results from "./results";

const Gui = ({loading}) =>
	<div id="packages-explorer" class="app">
		<Header />
		<hr />
		{
			loading
				? <Loading />
				: <div>app</div>
		}
	</div>
;

export default use(["loading"], [], Gui);
