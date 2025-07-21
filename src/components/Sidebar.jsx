import React from "react";
import Icon from "./Icon";
import GeofenceCard from "./GeofenceCard";
import PinCard from "./PinCard";
import EmptyState from "./EmptyState";

const Sidebar = ({
    geofences,
    handleExportGeofences,
    handleImportGeofences,
    handleImportPostgresPolygon,
    handleAddPinManually,
    pins,
    handleFocusOnPin,
    handleDeletePin,
    handleCopyPinCoords,
    sidebarTab,
    setSidebarTab,
    isDrawing,
    isEditingOnMap,
    isPinning,
    handleStartDrawing,
    ...rest
}) => (
    <aside className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
            {/* Tab Navigation */}
            <div className="flex mb-6 border-b border-gray-200">
                <button
                    onClick={() => setSidebarTab('fences')}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                        sidebarTab === 'fences'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4" />
                        Fences ({geofences.length})
                    </div>
                </button>
                <button
                    onClick={() => setSidebarTab('pins')}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                        sidebarTab === 'pins'
                            ? 'text-fuchsia-600 border-b-2 border-fuchsia-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Icon path="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" className="w-4 h-4" />
                        Pins ({pins.length})
                    </div>
                </button>
            </div>

            {/* Fences Tab Content */}
            {sidebarTab === 'fences' && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 text-green-500" />
                            Saved Fences
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
                    
                    <div className="mb-6">
                        <button
                            onClick={handleImportPostgresPolygon}
                            disabled={isDrawing || isEditingOnMap || isPinning}
                            className="w-full px-3 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Import PostgreSQL POLYGON format"
                        >
                            <Icon path="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" className="w-4 h-4" />
                            Import PostgreSQL Polygon
                        </button>
                    </div>
                    
                    {geofences.length === 0 ? (
                        <EmptyState handleStartDrawing={handleStartDrawing} isDrawing={isDrawing} isEditingOnMap={isEditingOnMap} isPinning={isPinning} />
                    ) : (
                        <div className="space-y-3">
                            {geofences.map((fence) => (
                                <GeofenceCard key={fence.id} fence={fence} {...rest} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Pins Tab Content */}
            {sidebarTab === 'pins' && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <Icon path="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" className="w-5 h-5 text-fuchsia-500" />
                            Saved Pins
                        </h2>
                    </div>
                    
                    <div className="mb-6">
                        <button
                            onClick={handleAddPinManually}
                            disabled={isDrawing || isEditingOnMap || isPinning}
                            className="w-full px-3 py-2 text-sm text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add pin by entering coordinates"
                        >
                            <Icon path="M12 4v16m8-8H4" className="w-4 h-4" />
                            Add Pin Manually
                        </button>
                    </div>
                    
                    {pins.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Icon path="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-sm">No pins yet</p>
                            <p className="text-xs text-gray-400 mt-1">Click on the map or add manually to create pins</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pins.map((pin, index) => (
                                <PinCard
                                    key={pin.id}
                                    pin={pin}
                                    index={index}
                                    onFocus={handleFocusOnPin}
                                    onDelete={handleDeletePin}
                                    onCopyCoords={handleCopyPinCoords}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    </aside>
);

export default Sidebar; 