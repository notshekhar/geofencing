import React from "react";
import Icon from "./Icon";

const PinCard = ({ pin, index, onFocus, onDelete, onCopyCoords }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <Icon path="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" className="w-4 h-4 text-fuchsia-500" />
                    Pin #{index + 1}
                </h3>
                <button
                    onClick={() => onDelete(pin.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete pin"
                >
                    <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-11V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-4 h-4" />
                </button>
            </div>
            
            <div className="text-sm text-gray-600 mb-3 space-y-1">
                <div>Lat: {pin.lat.toFixed(6)}</div>
                <div>Lng: {pin.lng.toFixed(6)}</div>
            </div>
            
            <div className="flex gap-2">
                <button
                    onClick={() => onFocus(pin)}
                    className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                    title="Focus on pin"
                >
                    <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="w-3 h-3" />
                    Focus
                </button>
                <button
                    onClick={() => onCopyCoords(pin)}
                    className="flex-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                    title="Copy coordinates"
                >
                    <Icon path="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" className="w-3 h-3" />
                    Copy
                </button>
            </div>
        </div>
    );
};

export default PinCard; 