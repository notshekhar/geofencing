import React from "react";
import Icon from "./Icon";

const EmptyState = ({ handleStartDrawing, isDrawing, isEditingOnMap }) => (
    <div className="text-center py-12">
        <div className="mb-6">
            <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-20 h-20 text-gray-300 mx-auto" />
        </div>
        <h3 className="text-xl font-medium text-gray-600 mb-3">No Geofences Yet</h3>
        <p className="text-sm text-gray-500 mb-8 px-6 leading-relaxed">
            Start by drawing a custom geofence or searching for a location to create your first boundary.
        </p>
        <div className="space-y-3 mb-8">
            <button
                onClick={handleStartDrawing}
                disabled={isDrawing || isEditingOnMap}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm font-medium"
            >
                <Icon path="M12.95 2.146a.5.5 0 01.707 0l2.853 2.854a.5.5 0 010 .707l-10 10a.5.5 0 01-.353.146H5.5a.5.5 0 01-.5-.5v-3.5a.5.5 0 01.146-.354l10-10zM14.5 4.5l-9 9v1h1l9-9-1-1z" className="w-4 h-4" />
                Start Drawing
            </button>
            <button
                onClick={() => document.getElementById('import-file-input').click()}
                disabled={isDrawing || isEditingOnMap}
                className="w-full px-4 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm font-medium"
            >
                <Icon path="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" className="w-4 h-4" />
                Import Geofences
            </button>
        </div>
        <div className="pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Quick Start Tips</h4>
            <div className="space-y-3 text-sm text-gray-600 text-left">
                <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Search for a location in the search bar above</span>
                </div>
                <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Click "Draw Fence" to create custom boundaries</span>
                </div>
                <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Drag points to adjust fence shapes</span>
                </div>
                <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Hold Shift and click on polygon edges to insert points between existing ones</span>
                </div>
                <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Press Ctrl+Z (Windows) or Cmd+Z (Mac) to undo while drawing or editing</span>
                </div>
                <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Right-click points to delete them</span>
                </div>
                <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Geofences automatically form closed loops</span>
                </div>
                <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Click "Go to Fence" to navigate to any saved geofence</span>
                </div>
                <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Hold Shift and click on saved geofence edges to insert points and enter editing mode</span>
                </div>
                <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>If location search fails, try different search terms or check your internet connection</span>
                </div>
            </div>
        </div>
    </div>
);

export default EmptyState; 