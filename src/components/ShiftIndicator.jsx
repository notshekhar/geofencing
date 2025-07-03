import React from "react";
import Icon from "./Icon";

const ShiftIndicator = ({ isShiftPressed, isDrawing, isEditingOnMap }) => {
    if (!isShiftPressed || (!isDrawing && !isEditingOnMap)) return null;
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg z-20 flex items-center gap-2">
            <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" />
            <span className="text-sm font-medium">Edge Insert Mode</span>
            <span className="text-xs opacity-90">Click on polygon edges to insert points</span>
        </div>
    );
};

export default ShiftIndicator; 