import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { isMockMode } from '../supabaseClient'
import { api } from '../services/api'
import L from 'leaflet'
import UpdateStatus from './UpdateStatus'
import SendComplaint from './SendComplaint'
import { 
  X, 
  Filter, 
  Calendar, 
  MapPin, 
  Heart, 
  AlertTriangle, 
  Trash2, 
  ChevronRight, 
  Camera, 
  Award,
  Sparkles,
  Info,
  Clock,
  Share2,
  ShieldAlert,
  Check,
  Eye
} from 'lucide-react'
import ImageSlider from './ImageSlider'
import ShareCard from './ShareCard'

export default function LiveMap({ selectedTreeId, setSelectedTreeId }) {
  const { user } = useAuth()
  
  // Data States
  const [trees, setTrees] = useState([])
  const [filteredTrees, setFilteredTrees] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Selected Tree Details
  const [selectedTreeDetails, setSelectedTreeDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  
  // Add-on States
  const [compareMode, setCompareMode] = useState(false)
  const [beforePhotoIdx, setBeforePhotoIdx] = useState(0)
  const [afterPhotoIdx, setAfterPhotoIdx] = useState(0)
  const [showShareModal, setShowShareModal] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmError, setConfirmError] = useState('')
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('all')
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all') // all | 7days | 30days
  const [uniqueSpecies, setUniqueSpecies] = useState([])

  // Modal / Overlay States
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showComplaintModal, setShowComplaintModal] = useState(false)

  // Map References
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({}) // tracks marker instances by tree.id

  // 1. Fetch initial trees
  const loadTrees = async (selectedIdToKeep = null) => {
    try {
      setLoading(true)
      const data = await api.getTrees()
      setTrees(data)
      
      // Extract unique species for filters
      const species = Array.from(new Set(data.map(t => t.species).filter(Boolean))).sort()
      setUniqueSpecies(species)

      if (selectedIdToKeep) {
        // If we updated a tree, reload its details too
        loadTreeDetails(selectedIdToKeep)
      }
    } catch (e) {
      console.error('Failed to load trees:', e)
    } finally {
      setLoading(false)
    }
  }

  const loadTreeDetails = async (treeId) => {
    setLoadingDetails(true)
    try {
      const details = await api.getTreeDetails(treeId)
      setSelectedTreeDetails(details)
    } catch (e) {
      console.error('Failed to fetch tree details:', e)
      setSelectedTreeDetails(null)
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => {
    loadTrees()
  }, [])

  // 2. Fetch details when selectedTreeId changes
  useEffect(() => {
    setCompareMode(false)
    setBeforePhotoIdx(0)
    setAfterPhotoIdx(0)
    setConfirmError('')
    if (selectedTreeId) {
      loadTreeDetails(selectedTreeId)
    } else {
      setSelectedTreeDetails(null)
    }
  }, [selectedTreeId])

  // Initialize comparison slider indices when details load
  useEffect(() => {
    if (selectedTreeDetails?.history) {
      const photoHistory = selectedTreeDetails.history.filter(h => h.photo_url)
      if (photoHistory.length >= 2) {
        setBeforePhotoIdx(0)
        setAfterPhotoIdx(photoHistory.length - 1)
      }
    }
  }, [selectedTreeDetails])

  const handleConfirmStatus = async () => {
    if (!user || !details) return
    setConfirmLoading(true)
    setConfirmError('')
    try {
      await api.confirmTreeStatus(details.id, details.current_status, user.id)
      await loadTreeDetails(details.id)
      await loadTrees()
    } catch (err) {
      setConfirmError(err.message || 'Error confirming status.')
    } finally {
      setConfirmLoading(false)
    }
  }

  // 3. Apply Filters
  useEffect(() => {
    let result = [...trees]

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(t => t.current_status === statusFilter)
    }

    // Species Filter
    if (speciesFilter !== 'all') {
      result = result.filter(t => t.species === speciesFilter)
    }

    // Time Filter
    if (timeFilter !== 'all') {
      const now = new Date()
      let days = timeFilter === '7days' ? 7 : 30
      const cutoff = new Date(now.setDate(now.getDate() - days))
      result = result.filter(t => new Date(t.created_at) >= cutoff)
    }

    setFilteredTrees(result)
  }, [trees, statusFilter, speciesFilter, timeFilter])

  // 4. Initialize and Manage Leaflet Map
  useEffect(() => {
    let timer;
    console.log("LiveMap: useEffect triggered. Container ref:", mapContainerRef.current)
    
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const container = mapContainerRef.current
      console.log(`LiveMap: Container dimensions on mount - Width: ${container.clientWidth}px, Height: ${container.clientHeight}px`)
      
      timer = setTimeout(() => {
        console.log(`LiveMap: Initializing map after 100ms. Container dimensions - Width: ${container.clientWidth}px, Height: ${container.clientHeight}px`)
        
        // Find average center of trees or fallback to SF default
        const center = trees.length > 0 
          ? [trees[0].latitude, trees[0].longitude]
          : [37.7749, -122.4194]
        
        console.log("LiveMap: Computed center:", center, "Trees count:", trees.length)

        try {
          mapInstanceRef.current = L.map(container, {
            zoomControl: false // position it manually on the right
          }).setView(center, 14)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapInstanceRef.current)

          L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current)
          
          console.log("LiveMap: Leaflet map initialized successfully!")
          
          // Force a size recalculation just in case the container resized
          mapInstanceRef.current.invalidateSize()
        } catch (err) {
          console.error("LiveMap: Leaflet map initialization failed:", err)
        }
      }, 100)
    }

    return () => {
      if (timer) clearTimeout(timer)
      // Clean up map instance on unmount
      if (mapInstanceRef.current) {
        console.log("LiveMap: Cleaning up map instance on unmount")
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = {}
      }
    }
  }, [])

  // Auto-center map on first tree when loaded
  useEffect(() => {
    if (mapInstanceRef.current && filteredTrees.length > 0) {
      const currentCenter = mapInstanceRef.current.getCenter()
      // If currently at default SF coordinates, pan to the first tree's location
      if (Math.abs(currentCenter.lat - 37.7749) < 0.01 && Math.abs(currentCenter.lng - (-122.4194)) < 0.01) {
        mapInstanceRef.current.setView([filteredTrees[0].latitude, filteredTrees[0].longitude], 14)
      }
    }
  }, [filteredTrees])

  // 5. Update Map Markers based on Filtered Trees
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const currentMarkers = markersRef.current
    const map = mapInstanceRef.current

    // Keep track of IDs in the filtered list
    const activeIds = new Set(filteredTrees.map(t => t.id))

    // Remove markers that are no longer active
    Object.keys(currentMarkers).forEach(id => {
      if (!activeIds.has(id)) {
        currentMarkers[id].remove()
        delete currentMarkers[id]
      }
    })

    // Add or Update markers
    filteredTrees.forEach(tree => {
      // Choose Pin Color & Icon based on status
      let colorClass = 'bg-forest'
      let pulseClass = ''
      let svgPath = '<path d="m12 2 8 8H4z"/><path d="m12 8 6 6H6z"/><path d="m12 14 4 4H8z"/><path d="M12 18v4"/>' // Tree Icon

      if (tree.current_status === 'sick') {
        colorClass = 'bg-yellow-500'
        pulseClass = 'animate-pin-pulse'
        svgPath = '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' // Warning Icon
      } else if (tree.current_status === 'cut_down') {
        colorClass = 'bg-red-600'
        svgPath = '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>' // Trash/Removed Icon
      }

      const ringClass = tree.verified ? 'ring-2 ring-amber-400 ring-offset-1' : ''

      // Generate HTML string for custom Pin drop
      const pinHtml = `<div class="w-8 h-8 rounded-full ${colorClass} ${pulseClass} ${ringClass} border-2 border-offwhite flex items-center justify-center text-offwhite shadow-lg animate-pin-drop">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide">${svgPath}</svg>
                       </div>`

      const customIcon = L.divIcon({
        className: `custom-tree-pin-${tree.id}`,
        html: pinHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })

      if (currentMarkers[tree.id]) {
        // Update existing marker's icon and position
        currentMarkers[tree.id].setIcon(customIcon)
        currentMarkers[tree.id].setLatLng([tree.latitude, tree.longitude])
      } else {
        // Create new marker
        const marker = L.marker([tree.latitude, tree.longitude], { icon: customIcon })
          .addTo(map)
          .on('click', () => {
            setSelectedTreeId(tree.id)
            map.panTo([tree.latitude, tree.longitude])
          })
        currentMarkers[tree.id] = marker
      }
    })

    // If map needs auto-centering after filtering
    if (filteredTrees.length > 0 && Object.keys(currentMarkers).length === filteredTrees.length) {
      // Optional: map.fitBounds(L.featureGroup(Object.values(currentMarkers)).getBounds(), { padding: [50, 50] })
    }

  }, [filteredTrees])

  // Pan to selected tree when updated or clicked
  useEffect(() => {
    if (selectedTreeId && mapInstanceRef.current && markersRef.current[selectedTreeId]) {
      const marker = markersRef.current[selectedTreeId]
      mapInstanceRef.current.setView(marker.getLatLng(), 16)
    }
  }, [selectedTreeId])

  // 6. Handle Adoptions
  const toggleAdoption = async () => {
    if (!user || !selectedTreeDetails) return
    const isAdopted = selectedTreeDetails.adoptions.some(a => a.user_id === user.id)

    try {
      if (isAdopted) {
        await api.unadoptTree(selectedTreeId, user.id)
      } else {
        await api.adoptTree(selectedTreeId, user.id)
      }
      // Refresh details
      loadTreeDetails(selectedTreeId)
    } catch (e) {
      console.error('Error toggling adoption:', e)
    }
  }

  // Details Variables
  const details = selectedTreeDetails?.tree
  const historyList = selectedTreeDetails?.history || []
  const adoptions = selectedTreeDetails?.adoptions || []
  const confirmations = selectedTreeDetails?.confirmations || []
  
  const userAdopted = user && adoptions.some(a => a.user_id === user.id)
  const userConfirmed = user && confirmations.some(c => c.confirmed_by === user.id && c.status_confirmed === details?.current_status)
  
  const isReporterOrUpdater = user && details && (
    details.reported_by === user.id || 
    (historyList.length > 0 && historyList[historyList.length - 1].updated_by === user.id)
  )

  const photoHistory = historyList.filter(h => h.photo_url)

  return (
    <div 
      className="flex-1 flex flex-col md:flex-row relative overflow-hidden z-0"
      style={{ height: isMockMode ? 'calc(100vh - 104px)' : 'calc(100vh - 64px)' }}
    >
      
      {/* 1. MAP SIDE FILTERS (DESKTOP) & MOBILE DROPDOWNS */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-offwhite-dark rounded-2xl p-4 shadow-lg max-w-sm w-[90%] md:w-80 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-offwhite-dark">
          <span className="font-serif font-bold text-forest flex items-center gap-1.5 text-sm sm:text-base">
            <Filter className="h-4 w-4 text-terracotta" /> Filter Canopy
          </span>
          <span className="bg-forest/10 text-forest text-xs font-bold px-2 py-0.5 rounded-full">
            {filteredTrees.length} trees visible
          </span>
        </div>

        {/* Filter by Status */}
        <div>
          <label className="block text-[10px] font-bold text-charcoal/60 uppercase tracking-wider mb-1">
            Health Condition
          </label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs bg-offwhite border border-offwhite-dark rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest text-charcoal font-medium"
          >
            <option value="all">All Conditions</option>
            <option value="healthy">Healthy</option>
            <option value="sick">Sick / Diseased</option>
            <option value="cut_down">Cut Down / Stump</option>
          </select>
        </div>

        {/* Filter by Species */}
        <div>
          <label className="block text-[10px] font-bold text-charcoal/60 uppercase tracking-wider mb-1">
            Species Name
          </label>
          <select 
            value={speciesFilter} 
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="w-full text-xs bg-offwhite border border-offwhite-dark rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest text-charcoal font-medium max-w-full"
          >
            <option value="all">All Species ({uniqueSpecies.length})</option>
            {uniqueSpecies.map((spec, i) => (
              <option key={i} value={spec}>{spec.split(' (')[0]}</option>
            ))}
          </select>
        </div>

        {/* Filter by Date */}
        <div>
          <label className="block text-[10px] font-bold text-charcoal/60 uppercase tracking-wider mb-1">
            Report Window
          </label>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full text-xs bg-offwhite border border-offwhite-dark rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest text-charcoal font-medium"
          >
            <option value="all">All-time Reports</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* 2. LEAFLET MAP ELEMENT */}
      <div 
        className="flex-1 w-full relative z-0" 
        style={{ height: isMockMode ? 'calc(100vh - 104px)' : 'calc(100vh - 64px)' }}
      >
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* 3. SIDE PANEL DETAIL DRAWER (SLIDES IN ON PIN CLICK) */}
      {selectedTreeId && (
        <div 
          className="absolute right-0 bottom-0 md:top-0 z-20 w-full md:w-96 max-h-[75vh] md:max-h-full bg-white border-t md:border-t-0 md:border-l border-offwhite-dark shadow-2xl flex flex-col transition-all duration-300 animate-slide-in"
        >
          {/* Drawer Header */}
          <div className="flex justify-between items-center bg-forest text-offwhite px-5 py-4 shrink-0">
            <div className="min-w-0">
              <span className="block text-[10px] text-offwhite/70 uppercase tracking-wide font-medium leading-none">
                Tree Census Log Details
              </span>
              <h3 className="font-serif font-semibold text-base truncate mt-1 max-w-[240px] flex items-center gap-1.5">
                {details?.species?.split(' (')[0] || 'Loading...'}
                {details?.verified && (
                  <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-blue-200" title="Verified specimen">
                    ✓ Verified
                  </span>
                )}
              </h3>
            </div>
            <button 
              onClick={() => setSelectedTreeId(null)}
              className="text-offwhite/80 hover:text-terracotta transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {loadingDetails ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-terracotta animate-spin mb-3" />
                <span className="text-xs font-semibold text-forest">Retrieving health records...</span>
              </div>
            ) : details ? (
              <>
                {/* Photo Carousel / Main Image */}
                {/* Photo Comparison / Carousel / Main Image */}
                {compareMode && photoHistory.length >= 2 ? (
                  <div className="shrink-0">
                    <ImageSlider 
                      beforeImage={photoHistory[beforePhotoIdx].photo_url}
                      beforeDate={new Date(photoHistory[beforePhotoIdx].created_at).toLocaleDateString()}
                      beforeStatus={photoHistory[beforePhotoIdx].status}
                      afterImage={photoHistory[afterPhotoIdx].photo_url}
                      afterDate={new Date(photoHistory[afterPhotoIdx].created_at).toLocaleDateString()}
                      afterStatus={photoHistory[afterPhotoIdx].status}
                    />

                    {/* Thumbnail selectors for choosing before/after */}
                    {photoHistory.length > 2 && (
                      <div className="mt-3 space-y-2 bg-offwhite p-3 rounded-2xl border border-offwhite-dark">
                        <div>
                          <span className="block text-[8px] font-bold text-charcoal/50 uppercase tracking-wider mb-1">Select "Before" Photo:</span>
                          <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {photoHistory.map((item, idx) => (
                              <button
                                key={item.id}
                                disabled={idx >= afterPhotoIdx}
                                onClick={() => setBeforePhotoIdx(idx)}
                                className={`relative h-10 w-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                                  idx >= afterPhotoIdx ? 'opacity-30 cursor-not-allowed border-transparent' :
                                  beforePhotoIdx === idx ? 'border-forest ring-1 ring-forest/30' : 'border-offwhite-dark hover:border-charcoal/30'
                                }`}
                              >
                                <img src={item.photo_url} className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-[7px] text-white font-bold">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="block text-[8px] font-bold text-charcoal/50 uppercase tracking-wider mb-1">Select "After" Photo:</span>
                          <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {photoHistory.map((item, idx) => (
                              <button
                                key={item.id}
                                disabled={idx <= beforePhotoIdx}
                                onClick={() => setAfterPhotoIdx(idx)}
                                className={`relative h-10 w-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                                  idx <= beforePhotoIdx ? 'opacity-30 cursor-not-allowed border-transparent' :
                                  afterPhotoIdx === idx ? 'border-terracotta ring-1 ring-terracotta/30' : 'border-offwhite-dark hover:border-charcoal/30'
                                }`}
                              >
                                <img src={item.photo_url} className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-[7px] text-white font-bold">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-offwhite-dark aspect-video bg-offwhite shadow-sm shrink-0">
                    <img 
                      src={details.photo_url} 
                      alt={details.species} 
                      className="w-full h-full object-cover animate-fade-in"
                    />
                    
                    {/* Floating Status Banner */}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-md flex items-center gap-1 ${
                      details.current_status === 'healthy' 
                        ? 'bg-forest text-offwhite border-offwhite/20' 
                        : details.current_status === 'sick'
                          ? 'bg-yellow-500 text-charcoal border-white/20'
                          : 'bg-red-600 text-offwhite border-offwhite/20'
                    }`}>
                      {details.current_status === 'healthy' && <Heart className="h-3 w-3 fill-offwhite" />}
                      {details.current_status === 'sick' && <AlertTriangle className="h-3 w-3" />}
                      {details.current_status === 'cut_down' && <Trash2 className="h-3 w-3" />}
                      {details.current_status.replace('_', ' ')}
                    </span>
                  </div>
                )}

                {/* Compare toggle button */}
                {photoHistory.length >= 2 && (
                  <button
                    onClick={() => setCompareMode(!compareMode)}
                    className="w-full py-2 bg-forest/5 hover:bg-forest/10 border border-forest/10 rounded-xl text-xs font-bold text-forest flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="h-4 w-4 text-terracotta" />
                    <span>{compareMode ? 'Show Current Photo' : 'Compare Photos Over Time'}</span>
                  </button>
                )}

                {/* Details Block */}
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-forest text-base">Species Profile</h4>
                  <div className="bg-offwhite p-3.5 rounded-2xl border border-offwhite-dark text-xs text-charcoal/80 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-charcoal/50">Scientific Name:</span>
                      <span className="italic font-medium">{details.species?.match(/\(([^)]+)\)/)?.[1] || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-charcoal/50">AI Confidence:</span>
                      <span className="font-mono font-semibold">{(details.species_confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-charcoal/50">Coordinates:</span>
                      <span className="font-mono">{details.latitude.toFixed(5)}, {details.longitude.toFixed(5)}</span>
                    </div>
                    {details.note && (
                      <div className="border-t border-offwhite-dark pt-2 mt-1">
                        <span className="font-bold text-charcoal/50 block mb-0.5">Field Notes:</span>
                        <p className="leading-relaxed italic">{details.note}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification / Confirmation Widget */}
                <div className="bg-blue-50/40 border border-blue-100/50 p-4 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="h-4.5 w-4.5 text-blue-600" />
                      <span className="font-serif font-bold text-xs text-blue-900">Verification Status</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
                      {details.verified ? 'Verified ✓' : `${confirmations.length}/2 Confirmations`}
                    </span>
                  </div>

                  <p className="text-[10px] text-charcoal/70 leading-normal">
                    {details.verified 
                      ? 'This tree status is fully verified by multiple independent citizen science reports.'
                      : 'This report needs at least 2 independent confirmations from other users to be marked as verified.'}
                  </p>

                  {user ? (
                    isReporterOrUpdater ? (
                      <span className="block text-[9px] text-charcoal/50 italic text-center">
                        You submitted this status report, so you cannot verify it.
                      </span>
                    ) : userConfirmed ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-1 bg-green-50 border border-green-200 text-green-700 font-semibold py-2 rounded-xl text-xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>You confirmed this status</span>
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          onClick={handleConfirmStatus}
                          disabled={confirmLoading}
                          className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-offwhite font-bold py-2 rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {confirmLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span>Confirm This Status</span>
                        </button>
                        {confirmError && (
                          <span className="block text-[9px] text-red-600 text-center font-semibold">{confirmError}</span>
                        )}
                      </div>
                    )
                  ) : (
                    <span className="block text-[9px] text-charcoal/50 italic text-center">
                      Sign in to confirm this tree's status.
                    </span>
                  )}
                </div>

                {/* Adoption Widget */}
                <div className="bg-forest/5 border border-forest/10 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className={`h-5 w-5 ${userAdopted ? 'text-terracotta fill-terracotta' : 'text-charcoal/40'}`} />
                    <div>
                      <span className="block font-serif font-bold text-xs text-forest">Adopt this Tree</span>
                      <span className="block text-[9px] text-charcoal/50 uppercase tracking-wider font-semibold">
                        {adoptions.length} {adoptions.length === 1 ? 'Adopter' : 'Adopters'}
                      </span>
                    </div>
                  </div>

                  {user ? (
                    <button
                      onClick={toggleAdoption}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        userAdopted
                          ? 'bg-forest border-forest text-offwhite shadow-sm'
                          : 'bg-white border-offwhite-dark text-forest hover:bg-forest/5'
                      }`}
                    >
                      {userAdopted ? 'Adopted' : 'Adopt Tree'}
                    </button>
                  ) : (
                    <span className="text-[10px] text-charcoal/50 italic">Sign in to adopt</span>
                  )}
                </div>

                {/* Timeline / Health History Log */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-forest text-base flex items-center gap-1">
                    <Clock className="h-4 w-4 text-terracotta" /> Timeline of Health Logs
                  </h4>
                  <div className="relative border-l border-offwhite-dark pl-4 ml-2 space-y-4">
                    {historyList.map((log, index) => (
                      <div key={log.id} className="relative text-xs">
                        {/* Dot indicator */}
                        <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border border-white ${
                          log.status === 'healthy' 
                            ? 'bg-forest' 
                            : log.status === 'sick' 
                              ? 'bg-yellow-500' 
                              : 'bg-red-600'
                        }`} />
                        
                        <div className="flex items-center justify-between text-[10px] text-charcoal/50">
                          <span className="font-semibold uppercase tracking-wider text-forest/70">{log.status.replace('_', ' ')}</span>
                          <span>{new Date(log.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-charcoal/80 mt-0.5 leading-relaxed italic">"{log.note}"</p>
                        
                        {/* Thumbnail scroll if uploaded */}
                        {log.photo_url && index > 0 && log.photo_url !== details.photo_url && (
                          <div className="mt-1.5 rounded-lg overflow-hidden h-12 w-20 border border-offwhite-dark">
                            <img src={log.photo_url} alt="Log evidence" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-2 space-y-3 shrink-0">
                  {user ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowUpdateModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-offwhite border border-offwhite-dark hover:bg-offwhite-dark/85 text-forest font-semibold py-3 rounded-xl text-sm transition-colors cursor-pointer"
                      >
                        <Camera className="h-4 w-4 text-terracotta" />
                        <span>Update Tree Status</span>
                      </button>
                      
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest-hover text-offwhite font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-md"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share Tree Card</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest-hover text-offwhite font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-md"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share Tree Card</span>
                      </button>
                      
                      <div className="p-3 bg-yellow-50 border border-yellow-100 text-yellow-800 text-center text-xs rounded-xl flex items-center justify-center gap-1.5">
                        <Info className="h-4 w-4" />
                        <span>Sign in to log health updates or adopt this tree.</span>
                      </div>
                    </div>
                  )}

                  {(details.current_status === 'sick' || details.current_status === 'cut_down') && (
                    <button
                      onClick={() => setShowComplaintModal(true)}
                      className="w-full flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-hover text-offwhite font-bold py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer animate-pulse"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>File Official Complaint</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-charcoal/50 text-xs">
                Could not retrieve tree records.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MODALS (UPDATE STATUS & COMPLAINT) */}
      {showUpdateModal && details && (
        <UpdateStatus 
          tree={details} 
          onClose={() => setShowUpdateModal(false)}
          onUpdateSuccess={() => {
            setShowUpdateModal(false)
            loadTrees(selectedTreeId) // refresh pin list & keep selected tree active
          }}
        />
      )}

      {showComplaintModal && details && (
        <SendComplaint 
          tree={details}
          history={historyList}
          onClose={() => setShowComplaintModal(false)}
        />
      )}

      {showShareModal && details && (
        <ShareCard 
          tree={details}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}
