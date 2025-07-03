import React, { useState, useEffect, useRef, useCallback } from "react"
import Header from "./components/Header";
import MessageOverlay from "./components/MessageOverlay";
import ShiftIndicator from "./components/ShiftIndicator";
import Sidebar from "./components/Sidebar";

// Main App Component
export default function App() {
    // State variables
    const [map, setMap] = useState(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentPoints, setCurrentPoints] = useState([])
    const [geofences, setGeofences] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState({ text: "", type: "" })
    const [copiedId, setCopiedId] = useState(null)
    const [editingFenceId, setEditingFenceId] = useState(null)
    const [editingFenceName, setEditingFenceName] = useState("")
    const [editingCoordsId, setEditingCoordsId] = useState(null)
    const [editingCoords, setEditingCoords] = useState("")
    const [isEditingOnMap, setIsEditingOnMap] = useState(false)
    const [mapEditingFenceId, setMapEditingFenceId] = useState(null)
    const [mapEditingPoints, setMapEditingPoints] = useState([])
    const [isShiftPressed, setIsShiftPressed] = useState(false)
    const [zoomLevel, setZoomLevel] = useState(12); // Initial zoom

    // Refs to keep track of Leaflet layers and UI elements
    const mapRef = useRef(null)
    const drawingLayerRef = useRef(null)
    const drawingMarkersRef = useRef([])
    const geofenceLayersRef = useRef([])
    const searchContainerRef = useRef(null)

    // --- Map Initialization ---
    useEffect(() => {
        const leafletCss = document.createElement("link")
        leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        leafletCss.rel = "stylesheet"
        leafletCss.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        leafletCss.crossOrigin = ""
        document.head.appendChild(leafletCss)

        const leafletJs = document.createElement("script")
        leafletJs.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        leafletJs.integrity =
            "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        leafletJs.crossOrigin = ""
        document.head.appendChild(leafletJs)

        leafletJs.onload = () => {
            const mapContainer = document.getElementById('map');
            if (mapContainer && !mapContainer._leaflet_id) {
                const mapInstance = L.map("map").setView([28.4595, 77.0266], 12)
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }).addTo(mapInstance)
                setMap(mapInstance)
                mapRef.current = mapInstance
                setZoomLevel(mapInstance.getZoom());

                mapInstance.on('zoomend', () => {
                    setZoomLevel(mapInstance.getZoom());
                });
            }
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
            // It's good practice to remove dynamically added scripts/styles, but can be tricky on fast refreshes.
            // For this app's lifecycle, it's generally safe.
        }
    }, [])

    // --- Global Click Listener for Hiding Suggestions ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)
            ) {
                setSuggestions([])
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // --- Message Handling ---
    const showMessage = useCallback((text, type = "info", duration = 4000) => {
        setMessage({ text, type })
        setTimeout(() => setMessage({ text: "", type: "" }), duration)
    }, [])

    const getScaleForZoom = (zoom) => {
        const baseZoom = 12;
        // Exponential scaling factor - reduced for less aggressive scaling
        const scaleFactor = Math.pow(1.1, zoom - baseZoom);
        
        // Define base sizes - reduced for smaller elements overall
        const baseMarkerSize = 8;
        const baseDraggableMarkerSize = 10;
        const baseLineWidth = 2;
        const baseDraggableLineWidth = 3;
    
        return {
            savedMarker: Math.max(6, Math.min(16, baseMarkerSize * scaleFactor)),
            draggableMarker: Math.max(8, Math.min(20, baseDraggableMarkerSize * scaleFactor)),
            savedLine: Math.max(1, Math.min(6, baseLineWidth * scaleFactor)),
            draggableLine: Math.max(1.5, Math.min(8, baseDraggableLineWidth * scaleFactor)),
        };
    };

    // --- Helper Functions ---
    const ensureClosedLoop = (points) => {
        if (points.length < 3) return points
        
        const firstPoint = points[0]
        const lastPoint = points[points.length - 1]
        
        // Check if the loop is already closed (first and last points are the same)
        const isAlreadyClosed = firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1]
        
        if (!isAlreadyClosed) {
            // Add the first point at the end to close the loop
            return [...points, firstPoint]
        }
        
        return points
    }

    const validateAndCreateBounds = (points) => {
        if (!points || points.length === 0) return null
        
        try {
            // Extract all valid coordinates
            const validPoints = points.filter(point => 
                Array.isArray(point) && 
                point.length === 2 && 
                typeof point[0] === 'number' && 
                typeof point[1] === 'number' &&
                !isNaN(point[0]) && !isNaN(point[1]) &&
                isFinite(point[0]) && isFinite(point[1])
            )
            
            if (validPoints.length === 0) return null
            
            const lats = validPoints.map(point => point[0])
            const lngs = validPoints.map(point => point[1])
            
            const minLat = Math.min(...lats)
            const maxLat = Math.max(...lats)
            const minLng = Math.min(...lngs)
            const maxLng = Math.max(...lngs)
            
            // Ensure bounds are not identical (add small padding if needed)
            const latDiff = maxLat - minLat
            const lngDiff = maxLng - minLng
            
            const padding = 0.001 // Small padding for single points or very small areas
            
            const finalMinLat = latDiff === 0 ? minLat - padding : minLat
            const finalMaxLat = latDiff === 0 ? maxLat + padding : maxLat
            const finalMinLng = lngDiff === 0 ? minLng - padding : minLng
            const finalMaxLng = lngDiff === 0 ? maxLng + padding : maxLng
            
            return [
                [finalMinLat, finalMinLng],
                [finalMaxLat, finalMaxLng]
            ]
        } catch (error) {
            console.error('Error creating bounds:', error)
            return null
        }
    }

    // --- Drawing Logic ---
    useEffect(() => {
        if (!map) return
        const handleMapClick = (e) => {
            // Don't add points if shift is pressed (used for edge insertion)
            if (isShiftPressed) return;

            // Only handle clicks when drawing or map editing
            if (!isDrawing && !isEditingOnMap) return;

            const clickPoint = map.latLngToContainerPoint(e.latlng);
            const pointsBeingEdited = isDrawing ? currentPoints : mapEditingPoints;
            const markerPixelThreshold = 15; // To avoid creating points on top of existing ones

            for (const p of pointsBeingEdited) {
                const markerLatLng = L.latLng(p[0], p[1]);
                const markerPoint = map.latLngToContainerPoint(markerLatLng);
                
                if (clickPoint.distanceTo(markerPoint) < markerPixelThreshold) {
                    showMessage("Too close to an existing point. Drag the point to move it or right-click to delete.", "info", 3000);
                    return;
                }
            }
            
            if (isDrawing) {
                setCurrentPoints((prevPoints) => [
                    ...prevPoints,
                    [e.latlng.lat, e.latlng.lng],
                ])
            } else if (isEditingOnMap) {
                setMapEditingPoints((prevPoints) => [
                    ...prevPoints,
                    [e.latlng.lat, e.latlng.lng],
                ])
            }
        }
        map.on("click", handleMapClick)
        return () => {
            map.off("click", handleMapClick)
        }
    }, [map, isDrawing, isEditingOnMap, isShiftPressed, currentPoints, mapEditingPoints, showMessage])

    // Effect to update the drawing preview
    useEffect(() => {
        if (!map) return
        if (drawingLayerRef.current) drawingLayerRef.current.remove()
        drawingMarkersRef.current.forEach((marker) => marker.remove())
        drawingMarkersRef.current = []

        const scale = getScaleForZoom(zoomLevel);
        const pointsToShow = isDrawing ? currentPoints : (isEditingOnMap ? mapEditingPoints : [])
        const isInEditMode = isDrawing || isEditingOnMap

        if (pointsToShow.length > 0 && isInEditMode) {
            pointsToShow.forEach((point, index) => {
                const isLastPoint = index === pointsToShow.length - 1;
                const markerSize = scale.draggableMarker;
                
                let markerColor = isDrawing ? '#3388ff' : '#ff8833'; // Default: blue for drawing, orange for editing
                let shadowColor = isDrawing ? 'rgba(51,136,255,0.8)' : 'rgba(255,136,51,0.8)';
                
                if (isLastPoint) {
                    markerColor = '#22c55e'; // Highlight color for the last point (green)
                    shadowColor = 'rgba(34,197,94,0.8)';
                }

                const marker = L.marker(point, {
                    draggable: true,
                    icon: L.divIcon({
                        className: "custom-div-icon draggable-marker",
                        html: `<div style='background-color:${markerColor}; cursor: move;' class='marker-pin draggable-pin'></div>`,
                        iconSize: [markerSize, markerSize],
                        iconAnchor: [markerSize/2, markerSize/2],
                    }),
                }).addTo(map)

                const element = marker.getElement();
                if (element) {
                    const pin = element.querySelector('.draggable-pin');
                    if (pin) {
                        pin.style.width = `${markerSize}px`;
                        pin.style.height = `${markerSize}px`;
                    }
                }

                // Add drag event handlers
                marker.on('dragstart', () => {
                    map.dragging.disable()
                    showMessage(isDrawing ? "Dragging point..." : "Adjusting geofence point...", "info", 1000)
                })

                marker.on('drag', (e) => {
                    const newLatLng = e.target.getLatLng()
                    const newPoint = [newLatLng.lat, newLatLng.lng]
                    
                    // Update only the visual polygon without changing state
                    if (drawingLayerRef.current) {
                        const updatedPoints = [...pointsToShow]
                        updatedPoints[index] = newPoint
                        drawingLayerRef.current.setLatLngs(updatedPoints)
                    }
                })

                marker.on('dragend', (e) => {
                    map.dragging.enable()
                    const newLatLng = e.target.getLatLng()
                    const newPoint = [newLatLng.lat, newLatLng.lng]
                    
                    // Update the point at the specific index only when drag ends
                    if (isDrawing) {
                        setCurrentPoints(prevPoints => {
                            const updatedPoints = [...prevPoints]
                            updatedPoints[index] = newPoint
                            return updatedPoints
                        })
                    } else if (isEditingOnMap) {
                        setMapEditingPoints(prevPoints => {
                            const updatedPoints = [...prevPoints]
                            updatedPoints[index] = newPoint
                            return updatedPoints
                        })
                    }
                    
                    showMessage("Point position updated!", "success", 2000)
                })

                // Add hover effects
                marker.on('mouseover', () => {
                    const element = marker.getElement()
                    if (element) {
                        const pin = element.querySelector('.draggable-pin')
                        if (pin) {
                            pin.style.transform = 'scale(1.2)'
                            pin.style.boxShadow = `0 4px 12px ${shadowColor}`
                        }
                    }
                })

                marker.on('mouseout', () => {
                    const element = marker.getElement()
                    if (element) {
                        const pin = element.querySelector('.draggable-pin')
                        if (pin) {
                            pin.style.transform = 'scale(1)'
                            pin.style.boxShadow = '0 2px 6px rgba(0,0,0,0.6)'
                        }
                    }
                })

                // Add right-click delete functionality
                marker.on('contextmenu', (e) => {
                    e.originalEvent.preventDefault()
                    if (confirm('Delete this point?')) {
                        if (isDrawing) {
                            setCurrentPoints(prevPoints => {
                                const updatedPoints = prevPoints.filter((_, i) => i !== index)
                                return updatedPoints
                            })
                        } else if (isEditingOnMap) {
                            setMapEditingPoints(prevPoints => {
                                const updatedPoints = prevPoints.filter((_, i) => i !== index)
                                return updatedPoints
                            })
                        }
                        showMessage("Point deleted.", "info")
                    }
                })

                drawingMarkersRef.current.push(marker)
            })
        }
        
        if (pointsToShow.length > 1 && isInEditMode) {
            const polygon = L.polygon(pointsToShow, {
                color: isDrawing ? "#3388ff" : "#ff8833",
                weight: scale.draggableLine, // Thinner for editing mode
                opacity: isDrawing ? 0.8 : 0.6, // More subtle for editing mode
                dashArray: isDrawing ? "8, 4" : "6, 4", // Shorter dashes for editing
                fillOpacity: 0.1, // Light fill to make the area more clickable
            }).addTo(map)
            
            // Add click handler to polygon for inserting points on edges
            polygon.on('click', (e) => {
                e.originalEvent.stopPropagation() // Prevent map click from firing
                
                const clickLat = e.latlng.lat
                const clickLng = e.latlng.lng
                
                // When clicking inside the polygon (the blue/orange area), always insert a point on the nearest edge.
                if (isDrawing) {
                    insertPointOnEdge(clickLat, clickLng, currentPoints, setCurrentPoints)
                } else if (isEditingOnMap) {
                    insertPointOnEdge(clickLat, clickLng, mapEditingPoints, setMapEditingPoints)
                }
            })
            
            drawingLayerRef.current = polygon
        }
    }, [map, currentPoints, mapEditingPoints, isDrawing, isEditingOnMap, zoomLevel])

    // --- Debounced Search for Suggestions ---
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSuggestions([])
            return
        }

        const delayDebounceFn = setTimeout(async () => {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                searchQuery
            )}&format=json&limit=5`
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout for suggestions

                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'GeofenceApp/1.0'
                    }
                })
                
                clearTimeout(timeoutId)
                
                if (response.ok) {
                const data = await response.json()
                setSuggestions(data || [])
                } else {
                    console.warn('Suggestions API error:', response.status)
                    setSuggestions([])
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                console.error("Suggestion fetch error:", error)
                }
                setSuggestions([])
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery])

    // --- UI Handlers ---
    const handleStartDrawing = () => {
        setIsDrawing(true)
        setCurrentPoints([])
        // Change cursor style when drawing
        if (map) {
            map.getContainer().style.cursor = 'crosshair'
        }
        showMessage("Click on the map to add points. Hold Shift and click on edges to insert points between existing ones. Drag points to adjust position. Press Ctrl+Z (or Cmd+Z) to undo.", "info", 7000)
    }

    const handleFinishDrawing = () => {
        if (currentPoints.length < 3) {
            showMessage(
                "You need at least 3 points to create a geofence.",
                "error"
            )
            return
        }
        
        const closedPoints = ensureClosedLoop(currentPoints)
        const newGeofence = {
            id: Date.now(),
            points: closedPoints,
            name: `Custom Fence #${geofences.length + 1}`,
        }
        setGeofences((prev) => [...prev, newGeofence])
        setIsDrawing(false)
        setIsShiftPressed(false)

        if (drawingLayerRef.current) drawingLayerRef.current.remove()
        drawingMarkersRef.current.forEach((marker) => marker.remove())
        drawingMarkersRef.current = []

        setCurrentPoints([])
        // Reset cursor style
        if (map) {
            map.getContainer().style.cursor = ''
        }
        showMessage("Geofence created successfully with closed loop!", "success")
    }

    const handleCancelDrawing = () => {
        setIsDrawing(false)
        setIsShiftPressed(false)
        setCurrentPoints([])
        // Reset cursor style
        if (map) {
            map.getContainer().style.cursor = ''
        }
        showMessage("Drawing cancelled.", "info")
    }

    const handleUndoLastPoint = useCallback(() => {
        if (currentPoints.length > 0) {
            setCurrentPoints((prevPoints) => prevPoints.slice(0, -1))
            showMessage("Last point removed.", "info")
        }
    }, [currentPoints.length, showMessage])

    const handleClearAll = () => {
        if (confirm("Are you sure you want to clear all geofences? This will permanently delete all saved data.")) {
        setGeofences([])
        setIsDrawing(false)
        setCurrentPoints([])
            // Clear from localStorage as well
            try {
                localStorage.removeItem('geofences')
                showMessage("All geofences cleared from storage.", "success")
            } catch (error) {
                console.error('Error clearing localStorage:', error)
                showMessage("Geofences cleared, but error clearing storage.", "error")
            }
        }
    }

    const executeSearch = async (locationName) => {
        setIsLoading(true)
        setSuggestions([])

        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            locationName
        )}&format=json&polygon_geojson=1&limit=1`

        let data = null
        
        // First, handle the API call separately
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'GeofenceApp/1.0'
                }
            })
            
            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`)
            }

            data = await response.json()
        } catch (error) {
            console.error("Geocoding API error:", error)
            
            let errorMessage = "Failed to fetch location data."
            
            if (error.name === 'AbortError') {
                errorMessage = "Search request timed out. Please try again."
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                errorMessage = "Network error. Please check your internet connection and try again."
            } else if (error.message.includes('CORS')) {
                errorMessage = "Location service temporarily unavailable. Please try again later."
            } else if (error.message.includes('API returned')) {
                errorMessage = `Location service error: ${error.message}`
            }
            
            showMessage(errorMessage, "error")
            setIsLoading(false)
            return
        }

        // Now process the successful response
        try {
            if (data && data.length > 0) {
                const result = data[0]
                let fencePoints = null
                let boundsForFitting = null
                let messageType = "success"
                let successMessage = `Accurate geofence created for "${result.display_name}"`

                if (
                    result.geojson &&
                    (result.geojson.type === "Polygon" ||
                        result.geojson.type === "MultiPolygon")
                ) {
                    let coordinates
                    if (result.geojson.type === "Polygon") {
                        coordinates = result.geojson.coordinates[0].map((p) => [
                            p[1],
                            p[0],
                        ])
                    } else {
                        coordinates = result.geojson.coordinates[0][0].map(
                            (p) => [p[1], p[0]]
                        )
                    }
                    fencePoints = coordinates
                    boundsForFitting = validateAndCreateBounds(fencePoints)
                } else if (result.boundingbox) {
                    const [latMin, latMax, lonMin, lonMax] = result.boundingbox
                    fencePoints = [
                        [parseFloat(latMin), parseFloat(lonMin)],
                        [parseFloat(latMin), parseFloat(lonMax)],
                        [parseFloat(latMax), parseFloat(lonMax)],
                        [parseFloat(latMax), parseFloat(lonMin)],
                    ]
                    boundsForFitting = validateAndCreateBounds(fencePoints)
                    messageType = "info"
                    successMessage = `Precise boundary not found. Created a rectangular fence for "${result.display_name}"`
                }

                if (fencePoints) {
                    const closedPoints = ensureClosedLoop(fencePoints)
                    const newGeofence = {
                        id: Date.now(),
                        points: closedPoints,
                        name: result.display_name,
                    }
                    setGeofences((prev) => [...prev, newGeofence])
                    
                    // Safely fit bounds with validation
                    if (map && boundsForFitting) {
                        try {
                            map.fitBounds(boundsForFitting, {
                                padding: [20, 20],
                                maxZoom: 16
                            })
                        } catch (boundsError) {
                            console.warn('Could not fit bounds, using fallback:', boundsError)
                            // Fallback: just center on the first point
                            if (fencePoints.length > 0) {
                                map.setView(fencePoints[0], 13)
                            }
                        }
                    }
                    
                    showMessage(successMessage + " (closed loop)", messageType)
                } else {
                    showMessage(
                        "Location data not found. Please try a different search term.",
                        "error"
                    )
                }
            } else {
                showMessage(
                    "Location not found. Please try a different search term.",
                    "error"
                )
            }
        } catch (error) {
            console.error("Error processing location data:", error)
            showMessage("Error creating geofence from location data. Please try again.", "error")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (!searchQuery) return
        executeSearch(searchQuery)
    }

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion.display_name)
        executeSearch(suggestion.display_name)
    }

    const handleCopyCoords = (fence) => {
        const coordsString = JSON.stringify(fence.points, null, 2)
        const textarea = document.createElement("textarea")
        textarea.value = coordsString
        document.body.appendChild(textarea)
        textarea.select()
        try {
            document.execCommand("copy")
            setCopiedId(fence.id)
            setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
            console.error("Failed to copy coords: ", err)
            showMessage("Failed to copy coordinates.", "error")
        }
        document.body.removeChild(textarea)
    }

    const handleStartEditing = (fence) => {
        setEditingFenceId(fence.id)
        setEditingFenceName(fence.name)
        // Cancel coordinate editing if active
        setEditingCoordsId(null)
        setEditingCoords("")
    }

    const handleCancelEditing = () => {
        setEditingFenceId(null)
        setEditingFenceName("")
    }

    const handleSaveEditing = () => {
        if (editingFenceName.trim() === "") {
            showMessage("Fence name cannot be empty.", "error")
            return
        }
        
        setGeofences(prevGeofences => 
            prevGeofences.map(fence => 
                fence.id === editingFenceId 
                    ? { ...fence, name: editingFenceName.trim() }
                    : fence
            )
        )
        
        setEditingFenceId(null)
        setEditingFenceName("")
        showMessage("Fence name updated!", "success")
    }

    const handleDeleteFence = (fenceId) => {
        if (confirm("Are you sure you want to delete this geofence?")) {
            setGeofences(prevGeofences => 
                prevGeofences.filter(fence => fence.id !== fenceId)
            )
            showMessage("Geofence deleted!", "success")
        }
    }

    const handleFocusOnFence = (fence) => {
        if (!map || !fence.points || fence.points.length === 0) {
            showMessage("Cannot focus on fence: invalid data", "error")
            return
        }
        
        try {
            const bounds = validateAndCreateBounds(fence.points)
            
            if (!bounds) {
                throw new Error("Could not calculate valid bounds")
            }
            
            // Fit the map to the fence bounds with some padding
            map.fitBounds(bounds, {
                padding: [30, 30],
                maxZoom: 15
            })
            
            showMessage(`Focused on "${fence.name}"`, "info", 2000)
        } catch (error) {
            console.error('Error focusing on fence:', error)
            
            // Fallback: center on the first valid point
            try {
                const firstValidPoint = fence.points.find(point => 
                    Array.isArray(point) && 
                    point.length === 2 && 
                    typeof point[0] === 'number' && 
                    typeof point[1] === 'number' &&
                    !isNaN(point[0]) && !isNaN(point[1])
                )
                
                if (firstValidPoint) {
                    map.setView(firstValidPoint, 13)
                    showMessage(`Centered on "${fence.name}" (bounds unavailable)`, "info", 2000)
                } else {
                    showMessage("Error focusing on geofence: invalid coordinates", "error")
                }
            } catch (fallbackError) {
                showMessage("Error focusing on geofence. Please try again.", "error")
            }
        }
    }

    const handleStartEditingCoords = (fence) => {
        setEditingCoordsId(fence.id)
        setEditingCoords(JSON.stringify(fence.points, null, 2))
        // Cancel name editing if active
        setEditingFenceId(null)
        setEditingFenceName("")
    }

    const handleCancelEditingCoords = () => {
        setEditingCoordsId(null)
        setEditingCoords("")
    }

    const handleSaveEditingCoords = () => {
        try {
            const parsedCoords = JSON.parse(editingCoords)
            
            // Validate coordinates format
            if (!Array.isArray(parsedCoords)) {
                throw new Error("Coordinates must be an array")
            }
            
            if (parsedCoords.length < 3) {
                throw new Error("Geofence must have at least 3 points")
            }
            
            // Validate each coordinate pair
            const validCoords = parsedCoords.every(coord => 
                Array.isArray(coord) && 
                coord.length === 2 && 
                typeof coord[0] === 'number' && 
                typeof coord[1] === 'number' &&
                coord[0] >= -90 && coord[0] <= 90 &&  // Valid latitude
                coord[1] >= -180 && coord[1] <= 180   // Valid longitude
            )
            
            if (!validCoords) {
                throw new Error("Invalid coordinate format. Each coordinate must be [latitude, longitude] with valid ranges.")
            }
            
            // Ensure the coordinates form a closed loop
            const closedCoords = ensureClosedLoop(parsedCoords)
            
            // Update the geofence
            setGeofences(prevGeofences => 
                prevGeofences.map(fence => 
                    fence.id === editingCoordsId 
                        ? { ...fence, points: closedCoords }
                        : fence
                )
            )
            
            setEditingCoordsId(null)
            setEditingCoords("")
            showMessage("Coordinates updated successfully with closed loop!", "success")
            
        } catch (error) {
            showMessage(`Invalid coordinates: ${error.message}`, "error")
        }
    }

    const handleStartMapEditing = (fence) => {
        setIsEditingOnMap(true)
        setMapEditingFenceId(fence.id)
        setMapEditingPoints([...fence.points])
        
        // Cancel other editing modes
        setEditingCoordsId(null)
        setEditingCoords("")
        setEditingFenceId(null)
        setEditingFenceName("")
        
        // Set cursor style
        if (map) {
            map.getContainer().style.cursor = 'crosshair'
        }
        
        showMessage(`Editing "${fence.name}" on map. Click empty areas to add points, hold Shift + click edges to insert between points, drag to move, right-click to delete. Press Ctrl+Z (or Cmd+Z) to undo.`, "info", 8000)
    }

    const handleFinishMapEditing = () => {
        if (mapEditingPoints.length < 3) {
            showMessage("Geofence must have at least 3 points.", "error")
            return
        }

        const closedPoints = ensureClosedLoop(mapEditingPoints)
        
        setGeofences(prevGeofences => 
            prevGeofences.map(fence => 
                fence.id === mapEditingFenceId 
                    ? { ...fence, points: closedPoints }
                    : fence
            )
        )

        setIsEditingOnMap(false)
        setIsShiftPressed(false)
        setMapEditingFenceId(null)
        setMapEditingPoints([])
        
        // Reset cursor style
        if (map) {
            map.getContainer().style.cursor = ''
        }
        
        showMessage("Geofence updated successfully!", "success")
    }

    const handleCancelMapEditing = () => {
        setIsEditingOnMap(false)
        setIsShiftPressed(false)
        setMapEditingFenceId(null)
        setMapEditingPoints([])
        
        // Reset cursor style
        if (map) {
            map.getContainer().style.cursor = ''
        }
        
        showMessage("Map editing cancelled.", "info")
    }

    const handleUndoMapEditingPoint = useCallback(() => {
        if (mapEditingPoints.length > 0) {
            setMapEditingPoints(prevPoints => prevPoints.slice(0, -1))
            showMessage("Last point removed.", "info")
        }
    }, [mapEditingPoints.length, showMessage])

    // --- Layer Rendering for Final Geofences ---
    useEffect(() => {
        if (!map) return
        geofenceLayersRef.current.forEach((layer) => layer.remove())
        geofenceLayersRef.current = []

        const scale = getScaleForZoom(zoomLevel);

        geofences.forEach((fence) => {
            // Skip rendering the fence that's currently being edited on map
            if (isEditingOnMap && fence.id === mapEditingFenceId) {
                return
            }

            const isEditingThisFenceInSidebar = fence.id === editingFenceId || fence.id === editingCoordsId;

            const polygon = L.polygon(fence.points, {
                color: "#28a745",
                fillColor: "#28a745",
                fillOpacity: 0.3,
                weight: scale.savedLine,
                opacity: 0.8,
            }).addTo(map)
            
            // Add click handler for edge insertion on saved geofences
            polygon.on('click', (e) => {
                e.originalEvent.stopPropagation()
                
                const clickLat = e.latlng.lat
                const clickLng = e.latlng.lng

                // If not editing, clicking the polygon should start editing mode.
                if (!isDrawing && !isEditingOnMap && !editingFenceId && !editingCoordsId) {
                    if (isShiftPressed) {
                        // With shift, directly insert point and start editing.
                        if (confirm(`Insert a new point on "${fence.name}"? This will start map editing mode.`)) {
                            handleStartMapEditing(fence)
                            setTimeout(() => {
                                insertPointOnEdge(clickLat, clickLng, fence.points, setMapEditingPoints)
                            }, 100)
                        }
                    } else {
                        // Without shift, just start editing.
                        if (confirm(`Start editing "${fence.name}" on the map?`)) {
                            handleStartMapEditing(fence)
                        }
                    }
                } else if (isEditingOnMap && fence.id === mapEditingFenceId) {
                    // If already editing this fence, a click (with or without shift) inserts a point on the edge.
                    insertPointOnEdge(clickLat, clickLng, mapEditingPoints, setMapEditingPoints)
                }
            })
            
            if (!isEditingThisFenceInSidebar) {
                polygon.bindPopup(`<b>${fence.name}</b><br>ID: ${fence.id}<br>Points: ${fence.points.length}`)
            }
            geofenceLayersRef.current.push(polygon)

            fence.points.forEach((point, pointIndex) => {
                const markerSize = scale.savedMarker;
                const marker = L.marker(point, {
                    draggable: !isEditingThisFenceInSidebar,
                    icon: L.divIcon({
                        className: "custom-div-icon saved-marker",
                        html: `<div style='background-color:#28a745; cursor: move;' class='marker-pin saved-pin'></div>`,
                        iconSize: [markerSize, markerSize],
                        iconAnchor: [markerSize/2, markerSize/2],
                    }),
                }).addTo(map)

                const element = marker.getElement();
                if (element) {
                    const pin = element.querySelector('.saved-pin');
                    if (pin) {
                        pin.style.width = `${markerSize}px`;
                        pin.style.height = `${markerSize}px`;
                    }
                }

                if (!isEditingThisFenceInSidebar) {
                    // Add drag event handlers for saved geofences
                    marker.on('dragstart', () => {
                        map.dragging.disable()
                        showMessage("Adjusting saved geofence...", "info", 1000)
                    })

                    marker.on('drag', (e) => {
                        const newLatLng = e.target.getLatLng()
                        const newPoint = [newLatLng.lat, newLatLng.lng]
                        
                        // Update only the visual polygon without changing state
                        const updatedPoints = [...fence.points]
                        updatedPoints[pointIndex] = newPoint
                        polygon.setLatLngs(updatedPoints)
                    })

                    marker.on('dragend', (e) => {
                        map.dragging.enable()
                        const newLatLng = e.target.getLatLng()
                        const newPoint = [newLatLng.lat, newLatLng.lng]
                        
                        // Update the specific point in the specific geofence only when drag ends
                        setGeofences(prevGeofences => {
                            return prevGeofences.map(prevFence => {
                                if (prevFence.id === fence.id) {
                                    const updatedPoints = [...prevFence.points]
                                    updatedPoints[pointIndex] = newPoint
                                    return { ...prevFence, points: updatedPoints }
                                }
                                return prevFence
                            })
                        })
                        
                        showMessage("Geofence point updated!", "success", 2000)
                    })

                    // Add right-click delete functionality for saved points
                    marker.on('contextmenu', (e) => {
                        e.originalEvent.preventDefault()
                        if (fence.points.length <= 3) {
                            showMessage("Cannot delete point. Geofence must have at least 3 points.", "error")
                            return
                        }
                        
                        if (confirm('Delete this point from the saved geofence?')) {
                            setGeofences(prevGeofences => {
                                return prevGeofences.map(prevFence => {
                                    if (prevFence.id === fence.id) {
                                        const updatedPoints = prevFence.points.filter((_, i) => i !== pointIndex)
                                        return { ...prevFence, points: updatedPoints }
                                    }
                                    return prevFence
                                })
                            })
                            showMessage("Point deleted from geofence.", "info")
                        }
                    })
                }

                // Add hover effects for saved markers
                marker.on('mouseover', () => {
                    const element = marker.getElement()
                    if (element) {
                        const pin = element.querySelector('.saved-pin')
                        if (pin) {
                            pin.style.transform = 'scale(1.3)'
                            pin.style.boxShadow = '0 4px 12px rgba(40,167,69,0.8)'
                        }
                    }
                })

                marker.on('mouseout', () => {
                    const element = marker.getElement()
                    if (element) {
                        const pin = element.querySelector('.saved-pin')
                        if (pin) {
                            pin.style.transform = 'scale(1)'
                            pin.style.boxShadow = '0 1px 3px rgba(0,0,0,0.5)'
                        }
                    }
                })

                geofenceLayersRef.current.push(marker)
            })
        })
    }, [geofences, map, isEditingOnMap, mapEditingFenceId, isShiftPressed, isDrawing, editingFenceId, editingCoordsId, zoomLevel])

    // --- LocalStorage Persistence ---
    useEffect(() => {
        // Load geofences from localStorage on component mount
        try {
            const savedGeofences = localStorage.getItem('geofences')
            if (savedGeofences) {
                const parsedGeofences = JSON.parse(savedGeofences)
                if (Array.isArray(parsedGeofences) && parsedGeofences.length > 0) {
                    setGeofences(parsedGeofences)
                    showMessage(`Loaded ${parsedGeofences.length} saved geofences`, "success", 3000)
                }
            }
        } catch (error) {
            console.error('Error loading geofences from localStorage:', error)
            showMessage("Error loading saved geofences", "error")
        }
    }, [])

    useEffect(() => {
        // Save geofences to localStorage whenever they change
        try {
            if (geofences.length > 0) {
                localStorage.setItem('geofences', JSON.stringify(geofences))
            } else {
                localStorage.removeItem('geofences')
            }
        } catch (error) {
            console.error('Error saving geofences to localStorage:', error)
            showMessage("Error saving geofences", "error")
        }
    }, [geofences])

    const handleExportGeofences = () => {
        if (geofences.length === 0) {
            showMessage("No geofences to export.", "error")
            return
        }

        try {
            const dataStr = JSON.stringify(geofences, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(dataBlob)
            
            const link = document.createElement('a')
            link.href = url
            link.download = `geofences-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            
            showMessage("Geofences exported successfully!", "success")
        } catch (error) {
            console.error('Error exporting geofences:', error)
            showMessage("Error exporting geofences.", "error")
        }
    }

    const handleImportGeofences = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result)
                
                if (!Array.isArray(importedData)) {
                    throw new Error("Invalid file format")
                }

                // Validate each geofence structure
                const validGeofences = importedData.filter(fence => 
                    fence.id && fence.name && Array.isArray(fence.points) && fence.points.length >= 3
                )

                if (validGeofences.length === 0) {
                    throw new Error("No valid geofences found in file")
                }

                // Assign new IDs to avoid conflicts
                const newGeofences = validGeofences.map(fence => ({
                    ...fence,
                    id: Date.now() + Math.random(),
                    name: fence.name + " (imported)",
                    points: ensureClosedLoop(fence.points)
                }))

                setGeofences(prev => [...prev, ...newGeofences])
                showMessage(`Successfully imported ${newGeofences.length} geofences with closed loops!`, "success")
                
            } catch (error) {
                console.error('Error importing geofences:', error)
                showMessage("Error importing geofences. Please check file format.", "error")
            }
        }
        
        reader.readAsText(file)
        // Reset file input
        event.target.value = ''
    }

    // Helper function to find the closest edge and insert a point
    const insertPointOnEdge = (clickLat, clickLng, points, setPointsFunction) => {
        if (points.length < 2) return

        let closestEdgeIndex = 0
        let minDistance = Infinity

        // Find the closest edge to the click point
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i]
            const p2 = points[i + 1]
            
            // Calculate distance from click point to line segment
            const distance = distanceToLineSegment(clickLat, clickLng, p1[0], p1[1], p2[0], p2[1])
            
            if (distance < minDistance) {
                minDistance = distance
                closestEdgeIndex = i
            }
        }

        // If it's a closed polygon, also check the edge from last point to first point
        if (points.length > 2) {
            const lastPoint = points[points.length - 1]
            const firstPoint = points[0]
            const distance = distanceToLineSegment(clickLat, clickLng, lastPoint[0], lastPoint[1], firstPoint[0], firstPoint[1])
            
            if (distance < minDistance) {
                minDistance = distance
                closestEdgeIndex = points.length - 1 // Insert at the end (before closing)
            }
        }

        // Insert the new point after the closest edge start point
        const newPoint = [clickLat, clickLng]
        setPointsFunction(prevPoints => {
            const newPoints = [...prevPoints]
            newPoints.splice(closestEdgeIndex + 1, 0, newPoint)
            return newPoints
        })

        showMessage("Point inserted on edge!", "success", 2000)
    }

    // Helper function to calculate distance from point to line segment
    const distanceToLineSegment = (px, py, x1, y1, x2, y2) => {
        const A = px - x1
        const B = py - y1
        const C = x2 - x1
        const D = y2 - y1

        const dot = A * C + B * D
        const lenSq = C * C + D * D
        let param = -1
        
        if (lenSq !== 0) {
            param = dot / lenSq
        }

        let xx, yy

        if (param < 0) {
            xx = x1
            yy = y1
        } else if (param > 1) {
            xx = x2
            yy = y2
        } else {
            xx = x1 + param * C
            yy = y1 + param * D
        }

        const dx = px - xx
        const dy = py - yy
        return Math.sqrt(dx * dx + dy * dy)
    }

    // --- Keyboard Event Listeners for Shift & Undo ---
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Handle Shift key for edge insertion mode
            if (event.key === 'Shift' && (isDrawing || isEditingOnMap)) {
                setIsShiftPressed(true)
                if (map) {
                    map.getContainer().style.cursor = 'copy'
                }
            }
            
            // Handle Ctrl+Z (Windows/Linux) and Cmd+Z (Mac) for undo
            if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
                if (isDrawing) {
                    event.preventDefault()
                    handleUndoLastPoint()
                } else if (isEditingOnMap) {
                    event.preventDefault()
                    handleUndoMapEditingPoint()
                }
            }
        }

        const handleKeyUp = (event) => {
            if (event.key === 'Shift') {
                setIsShiftPressed(false)
                // Reset cursor to crosshair when in drawing/editing mode
                if (map && (isDrawing || isEditingOnMap)) {
                    map.getContainer().style.cursor = 'crosshair'
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [map, isDrawing, isEditingOnMap, handleUndoLastPoint, handleUndoMapEditingPoint, setIsShiftPressed])

    return (
        <div className="flex flex-col h-screen bg-gray-100 font-sans">
            <style>{`
        .custom-div-icon .marker-pin { border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.5); }
        .custom-div-icon .draggable-pin { border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.6); transition: all 0.2s ease; }
        .custom-div-icon .saved-pin { border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.5); transition: all 0.2s ease; }
        .draggable-marker { cursor: move !important; }
        .saved-marker { cursor: move !important; }
        .draggable-marker:hover .draggable-pin { box-shadow: 0 4px 12px rgba(51,136,255,0.8) !important; }
        .saved-marker:hover .saved-pin { box-shadow: 0 4px 12px rgba(40,167,69,0.8) !important; }
        .leaflet-div-icon { background: transparent; border: none; }
      `}</style>
            <Header
                isDrawing={isDrawing}
                isEditingOnMap={isEditingOnMap}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearchSubmit={handleSearchSubmit}
                isLoading={isLoading}
                suggestions={suggestions}
                handleSuggestionClick={handleSuggestionClick}
                searchContainerRef={searchContainerRef}
                handleStartDrawing={handleStartDrawing}
                handleFinishDrawing={handleFinishDrawing}
                handleUndoLastPoint={handleUndoLastPoint}
                handleCancelDrawing={handleCancelDrawing}
                currentPoints={currentPoints}
                handleFinishMapEditing={handleFinishMapEditing}
                handleUndoMapEditingPoint={handleUndoMapEditingPoint}
                handleCancelMapEditing={handleCancelMapEditing}
                mapEditingPoints={mapEditingPoints}
                handleClearAll={handleClearAll}
            />
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 relative">
                    <div id="map" className="w-full h-full z-0"></div>
                    <MessageOverlay message={message} />
                    <ShiftIndicator isShiftPressed={isShiftPressed} isDrawing={isDrawing} isEditingOnMap={isEditingOnMap} />
                </main>
                <Sidebar
                    geofences={geofences}
                    handleExportGeofences={handleExportGeofences}
                    handleImportGeofences={handleImportGeofences}
                    isDrawing={isDrawing}
                    isEditingOnMap={isEditingOnMap}
                    handleStartDrawing={handleStartDrawing}
                    // GeofenceCard props
                    editingFenceId={editingFenceId}
                    setEditingFenceId={setEditingFenceId}
                    editingFenceName={editingFenceName}
                    setEditingFenceName={setEditingFenceName}
                    handleSaveEditing={handleSaveEditing}
                    handleCancelEditing={handleCancelEditing}
                    handleStartEditing={handleStartEditing}
                    handleFocusOnFence={handleFocusOnFence}
                    handleCopyCoords={handleCopyCoords}
                    copiedId={copiedId}
                    handleDeleteFence={handleDeleteFence}
                    editingCoordsId={editingCoordsId}
                    setEditingCoordsId={setEditingCoordsId}
                    editingCoords={editingCoords}
                    setEditingCoords={setEditingCoords}
                    handleSaveEditingCoords={handleSaveEditingCoords}
                    handleCancelEditingCoords={handleCancelEditingCoords}
                    handleStartEditingCoords={handleStartEditingCoords}
                    handleStartMapEditing={handleStartMapEditing}
                    mapEditingFenceId={mapEditingFenceId}
                />
            </div>
        </div>
    )
}