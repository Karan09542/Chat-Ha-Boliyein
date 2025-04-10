import React from "react";
import dynamic from "next/dynamic"
import RoomChat from "./components/RoomChat"

const room: React.FC = () => {
	return <div>
		<RoomChat />
	</div>;
};

export default room;
