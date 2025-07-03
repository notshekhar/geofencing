import React from "react";

const CoordsEditor = ({ editingCoords, setEditingCoords, handleSaveEditingCoords, handleCancelEditingCoords }) => (
    <div className="space-y-2">
        <textarea
            value={editingCoords}
            onChange={(e) => setEditingCoords(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    handleCancelEditingCoords();
                } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSaveEditingCoords();
                }
            }}
            className="w-full h-32 px-2 py-1 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter coordinates as JSON array..."
        />
        <div className="text-xs text-gray-500">
            Format: [[lat, lng], [lat, lng], ...] • Min 3 points required<br/>
            <span className="text-blue-600">Ctrl+Enter to save • Esc to cancel</span><br/>
            <span className="text-green-600">Note: Starting point will be added at the end to close the loop</span>
        </div>
    </div>
);

export default CoordsEditor; 