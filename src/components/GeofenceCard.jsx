import React from "react";
import Icon from "./Icon";
import CoordsEditor from "./CoordsEditor";

const GeofenceCard = ({
    fence,
    editingFenceId,
    setEditingFenceId,
    editingFenceName,
    setEditingFenceName,
    handleSaveEditing,
    handleCancelEditing,
    handleStartEditing,
    handleFocusOnFence,
    handleCopyCoords,
    copiedId,
    handleCopyPostgresPolygon,
    copiedPgId,
    handleToggleGeofenceVisibility,
    hiddenGeofences,
    handleDeleteFence,
    editingCoordsId,
    setEditingCoordsId,
    editingCoords,
    setEditingCoords,
    handleSaveEditingCoords,
    handleCancelEditingCoords,
    handleStartEditingCoords,
    handleStartMapEditing,
    isDrawing,
    isEditingOnMap,
    mapEditingFenceId,
}) => (
    <div
        className={`bg-gray-50 p-4 rounded-lg border transition-all ${
            isEditingOnMap && mapEditingFenceId === fence.id 
                ? "border-orange-300 bg-orange-50 shadow-md" 
                : "border-gray-200 hover:shadow-md"
        }`}
    >
        {isEditingOnMap && mapEditingFenceId === fence.id && (
            <div className="mb-3 px-3 py-2 bg-orange-100 border border-orange-200 rounded-md">
                <div className="flex items-center gap-2 text-orange-700">
                    <Icon path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" className="w-4 h-4" />
                    <span className="text-sm font-medium">Currently editing on map</span>
                </div>
                <div className="text-xs text-orange-600 mt-1">
                    Orange points on map • Click empty areas to add • Hold Shift + click edges to insert • Drag to move • Right-click to delete
                </div>
            </div>
        )}
        {editingFenceId === fence.id ? (
            <div className="space-y-3">
                <input
                    type="text"
                    value={editingFenceName}
                    onChange={(e) => setEditingFenceName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter fence name..."
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleSaveEditing}
                        className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 flex items-center gap-1"
                    >
                        <Icon path="M5 13l4 4L19 7" className="w-4 h-4" />
                        Save
                    </button>
                    <button
                        onClick={handleCancelEditing}
                        className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 flex items-center gap-1"
                    >
                        <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4" />
                        Cancel
                    </button>
                </div>
            </div>
        ) : (
            <div>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-3">
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1">
                            {fence.name}
                        </h3>
                        <div className="text-xs text-gray-500">
                            ID: {fence.id} • {fence.points.length} points
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => handleFocusOnFence(fence)}
                        className="flex-1 px-3 py-2 text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                        title="Focus map on this fence"
                    >
                        <Icon path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" className="w-3 h-3" />
                        Go to Fence
                    </button>
                    <button
                        onClick={() => handleToggleGeofenceVisibility(fence.id)}
                        className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                            hiddenGeofences.has(fence.id)
                                ? "text-gray-600 bg-gray-100 hover:bg-gray-200"
                                : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        }`}
                        title={hiddenGeofences.has(fence.id) ? "Show fence on map" : "Hide fence from map"}
                    >
                        {hiddenGeofences.has(fence.id) ? (
                            <>
                                <Icon path="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" className="w-3 h-3" />
                                Show
                            </>
                        ) : (
                            <>
                                <Icon path="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" className="w-3 h-3" />
                                Hide
                            </>
                        )}
                    </button>
                </div>
                
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => handleStartEditing(fence)}
                        disabled={editingCoordsId === fence.id}
                        className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                            editingCoordsId === fence.id 
                                ? "text-gray-300 bg-gray-100 cursor-not-allowed" 
                                : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                        }`}
                        title="Edit name"
                    >
                        <Icon path="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-14 6V13l6-6m0 0l4-4m-4 4l4-4" className="w-3 h-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => handleCopyCoords(fence)}
                        disabled={editingCoordsId === fence.id}
                        className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                            editingCoordsId === fence.id 
                                ? "text-gray-300 bg-gray-100 cursor-not-allowed"
                                : copiedId === fence.id
                                    ? "text-green-600 bg-green-100"
                                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                        }`}
                        title="Copy coordinates"
                    >
                        {copiedId === fence.id ? (
                            <>
                                <Icon path="M5 13l4 4L19 7" className="w-3 h-3" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" className="w-3 h-3" />
                                Copy
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleCopyPostgresPolygon(fence)}
                        disabled={editingCoordsId === fence.id}
                        className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                            editingCoordsId === fence.id 
                                ? "text-gray-300 bg-gray-100 cursor-not-allowed"
                                : copiedPgId === fence.id
                                    ? "text-green-600 bg-green-100"
                                    : "text-purple-600 bg-purple-50 hover:bg-purple-100"
                        }`}
                        title="Copy PostgreSQL polygon format"
                    >
                        {copiedPgId === fence.id ? (
                            <>
                                <Icon path="M5 13l4 4L19 7" className="w-3 h-3" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Icon path="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" className="w-3 h-3" />
                                PG
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleDeleteFence(fence.id)}
                        disabled={editingCoordsId === fence.id}
                        className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                            editingCoordsId === fence.id 
                                ? "text-gray-300 bg-gray-100 cursor-not-allowed"
                                : "text-red-600 bg-red-50 hover:bg-red-100"
                        }`}
                        title="Delete fence"
                    >
                        <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-11V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-3 h-3" />
                        Delete
                    </button>
                </div>
                
                <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Coordinates</span>
                        {editingCoordsId === fence.id ? (
                            <div className="flex gap-1">
                                <button
                                    onClick={handleSaveEditingCoords}
                                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 flex items-center gap-1"
                                >
                                    <Icon path="M5 13l4 4L19 7" className="w-3 h-3" />
                                    Save
                                </button>
                                <button
                                    onClick={handleCancelEditingCoords}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 flex items-center gap-1"
                                >
                                    <Icon path="M6 18L18 6M6 6l12 12" className="w-3 h-3" />
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleStartEditingCoords(fence)}
                                    disabled={editingFenceId === fence.id || isDrawing || isEditingOnMap}
                                    className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                                        editingFenceId === fence.id || isDrawing || isEditingOnMap
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-blue-600 hover:bg-blue-50"
                                    }`}
                                    title="Edit coordinates as text"
                                >
                                    <Icon path="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-14 6V13l6-6m0 0l4-4m-4 4l4-4" className="w-3 h-3" />
                                    Text
                                </button>
                                <button
                                    onClick={() => handleStartMapEditing(fence)}
                                    disabled={editingFenceId === fence.id || isDrawing || isEditingOnMap}
                                    className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                                        editingFenceId === fence.id || isDrawing || isEditingOnMap
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-orange-600 hover:bg-orange-50"
                                    }`}
                                    title="Edit coordinates on map"
                                >
                                    <Icon path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" className="w-3 h-3" />
                                    Map
                                </button>
                            </div>
                        )}
                    </div>
                    {editingCoordsId === fence.id ? (
                        <CoordsEditor
                            editingCoords={editingCoords}
                            setEditingCoords={setEditingCoords}
                            handleSaveEditingCoords={handleSaveEditingCoords}
                            handleCancelEditingCoords={handleCancelEditingCoords}
                        />
                    ) : (
                        <details className="group">
                            <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 select-none">
                                Show coordinates ({fence.points.length} points)
                            </summary>
                            <pre className="text-xs text-gray-600 bg-white p-2 mt-2 rounded-md border max-h-32 overflow-auto font-mono">
                                {JSON.stringify(fence.points, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        )}
    </div>
);

export default GeofenceCard; 