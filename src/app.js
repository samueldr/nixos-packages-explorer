import "./styles";
import React from "react";
import State from "./state";
import Header from "./gui/header";

const App = () =>
	<State>
		<div id="packages-explorer" class="app">
			<Header />
		</div>
	</State>
;

export default App;
