import React from "react";
import {use} from "../state";
import {isUnfree} from "../license";

const Result = ({
	result,
	result: {name, attr, meta: {description} = {}},
	even,
	selected,
	select_attr,
}) =>
	<tr class={[
		even ? "even" : "odd",
		selected === attr ? "is-selected" : "is-not-selected",
		isUnfree(result["meta"]["license"]) ? "is-unfree" : "is-free",
	].join(" ")}
	onClick={() => select_attr(attr)}
	>
		<td><button onClick={(e) => {
			e.stopPropagation();
			select_attr(attr);
		}}>{name}</button></td>
		<td>{attr}</td>
		<td>{description}</td>
	</tr>
;

export default use(["selected"], ["select_attr"], Result);
