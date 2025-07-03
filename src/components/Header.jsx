import React from "react";
import Icon from "./Icon";

const Header = ({
    isDrawing,
    isEditingOnMap,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    isLoading,
    suggestions,
    handleSuggestionClick,
    searchContainerRef,
    handleStartDrawing,
    handleFinishDrawing,
    handleUndoLastPoint,
    handleCancelDrawing,
    currentPoints,
    handleFinishMapEditing,
    handleUndoMapEditingPoint,
    handleCancelMapEditing,
    mapEditingPoints,
    handleClearAll
}) => (
    <header className="bg-white shadow-md p-2 z-20">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Interactive Geofencer
            </h1>
            <div
                ref={searchContainerRef}
                className="relative flex-grow sm:flex-grow-0 sm:w-72"
            >
                <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center"
                >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a location... (e.g., New York, Paris, or specific address)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isDrawing || isEditingOnMap}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center w-24"
                        disabled={isLoading || isDrawing || isEditingOnMap}
                    >
                        {isLoading ? (
                            <Icon
                                path="M12 4V2A10 10 0 002 12h2a8 8 0 018-8z"
                                className="w-5 h-5 animate-spin"
                            />
                        ) : (
                            "Search"
                        )}
                    </button>
                </form>
                {suggestions.length > 0 && (
                    <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((s) => (
                            <li
                                key={s.place_id}
                                onClick={() => handleSuggestionClick(s)}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                            >
                                {s.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="flex items-center gap-2">
                {!isDrawing && !isEditingOnMap ? (
                    <button
                        onClick={handleStartDrawing}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
                    >
                        <Icon path="M12.95 2.146a.5.5 0 01.707 0l2.853 2.854a.5.5 0 010 .707l-10 10a.5.5 0 01-.353.146H5.5a.5.5 0 01-.5-.5v-3.5a.5.5 0 01.146-.354l10-10zM14.5 4.5l-9 9v1h1l9-9-1-1z" />{" "}
                        Draw Fence
                    </button>
                ) : isDrawing ? (
                    <>
                        <button
                            onClick={handleFinishDrawing}
                            disabled={currentPoints.length < 3}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
                        >
                            <Icon path="M5 13l4 4L19 7" /> Finish
                        </button>
                        <button
                            onClick={handleUndoLastPoint}
                            disabled={currentPoints.length === 0}
                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 flex items-center gap-2"
                        >
                            <Icon path="M9 14l-5-5m0 0l5-5m-5 5h12a3 3 0 003 3v1M20 21v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1" /> Undo
                        </button>
                        <button
                            onClick={handleCancelDrawing}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2"
                        >
                            <Icon path="M6 18L18 6M6 6l12 12" /> Cancel
                        </button>
                    </>
                ) : isEditingOnMap ? (
                    <>
                        <button
                            onClick={handleFinishMapEditing}
                            disabled={mapEditingPoints.length < 3}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
                        >
                            <Icon path="M5 13l4 4L19 7" /> Finish Edit
                        </button>
                        <button
                            onClick={handleUndoMapEditingPoint}
                            disabled={mapEditingPoints.length === 0}
                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 flex items-center gap-2"
                        >
                            <Icon path="M9 14l-5-5m0 0l5-5m-5 5h12a3 3 0 003 3v1M20 21v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1" /> Undo
                        </button>
                        <button
                            onClick={handleCancelMapEditing}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2"
                        >
                            <Icon path="M6 18L18 6M6 6l12 12" /> Cancel
                        </button>
                    </>
                ) : null}
                <button
                    onClick={handleClearAll}
                    disabled={isDrawing || isEditingOnMap}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 flex items-center gap-2"
                >
                    <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-11V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />{" "}
                    Clear All
                </button>
            </div>
        </div>
    </header>
);

export default Header; 