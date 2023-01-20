import moment from "moment";

export default function Message({ justify, message, timestamp }) {
	return (
		<li className={`flex justify-${justify}`}>
			<div className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
				<span className="block">{message}</span>
				<div className="text-gray-500 text-xs">
					{moment(timestamp).format("ll")}
				</div>
			</div>
		</li>
	);
}
