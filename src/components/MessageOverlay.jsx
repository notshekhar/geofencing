import React from "react";

const MessageOverlay = ({ message }) => {
    if (!message.text) return null;
    return (
        <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white z-20
                ${message.type === "success" ? "bg-green-500" : ""}
                ${message.type === "error" ? "bg-red-500" : ""}
                ${message.type === "info" ? "bg-blue-500" : ""}
            `}
        >
            {message.text}
        </div>
    );
};

export default MessageOverlay; 