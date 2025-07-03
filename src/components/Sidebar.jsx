import React from "react";
import Icon from "./Icon";
import GeofenceCard from "./GeofenceCard";
import EmptyState from "./EmptyState";

const Sidebar = ({
    geofences,
    handleExportGeofences,
    handleImportGeofences,
    isDrawing,
    isEditingOnMap,
    handleStartDrawing,
    ...rest
}) => (
    <aside className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 text-green-500" />
                    Saved Fences ({geofences.length})
                    {geofences.length > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-3 h-3" />
                            Auto-saved
                        </span>
                    )}
                </h2>
            </div>
            
            <div className="flex gap-2 mb-6">
                <button
                    onClick={handleExportGeofences}
                    disabled={geofences.length === 0}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
                        geofences.length === 0 
                            ? "text-gray-300 bg-gray-50 cursor-not-allowed" 
                            : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    }`}
                    title="Export geofences"
                >
                    <Icon path="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" className="w-4 h-4" />
                    Export
                </button>
                <input
                    type="file"
                    accept=".json"
                    onChange={handleImportGeofences}
                    style={{ display: 'none' }}
                    id="import-file-input"
                />
                <button
                    onClick={() => document.getElementById('import-file-input').click()}
                    className="flex-1 px-3 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors flex items-center justify-center gap-2"
                    title="Import geofences"
                >
                    <Icon path="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" className="w-4 h-4" />
                    Import
                </button>
            </div>
            
            {geofences.length === 0 ? (
                <EmptyState handleStartDrawing={handleStartDrawing} isDrawing={isDrawing} isEditingOnMap={isEditingOnMap} />
            ) : (
                <div className="space-y-3">
                    {geofences.map((fence) => (
                        <GeofenceCard key={fence.id} fence={fence} {...rest} />
                    ))}
                </div>
            )}
        </div>
    </aside>
);

export default Sidebar; 