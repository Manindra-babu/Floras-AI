import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import L from 'leaflet'
import { 
  Camera, 
  MapPin, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  AlertTriangle,
  FileText, 
  Image as ImageIcon,
  LogIn
} from 'lucide-react'

export default function ReportTree({ setActivePage }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  
  // Form States
  const [photoFile, setPhotoFile] = useState(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [latitude, setLatitude] = useState(37.7749) // Default SF
  const [longitude, setLongitude] = useState(-122.4194)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState('')
  
  // PlantNet States
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [identifiedSpecies, setIdentifiedSpecies] = useState('')
  const [confidence, setConfidence] = useState(1.0)
  const [speciesError, setSpeciesError] = useState('')
  const [confirmedSpecies, setConfirmedSpecies] = useState('')
  
  // Note & Submission States
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [newTreeId, setNewTreeId] = useState('')
  const [initialStatus, setInitialStatus] = useState('healthy')

  // Overlap Proximity States
  const [showOverlapModal, setShowOverlapModal] = useState(false)
  const [overlappingTree, setOverlappingTree] = useState(null)
  const [overlappingDistance, setOverlappingDistance] = useState(0)
  const [selectedCondition, setSelectedCondition] = useState('healthy')
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false)

  // Map References
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerInstanceRef = useRef(null)

  // Mini Map Success Reference
  const successMapContainerRef = useRef(null)
  const successMapInstanceRef = useRef(null)

  // 1. GPS Location Fetching
  const getGPSLocation = () => {
    setGpsLoading(true)
    setGpsError('')
    
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.')
      setGpsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setGpsLoading(false)
      },
      (error) => {
        console.error('GPS error:', error)
        setGpsError('Could not auto-detect GPS. Please position the map marker manually.')
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }

  // Auto-fetch location once when user starts Step 2
  useEffect(() => {
    if (step === 2) {
      getGPSLocation()
    }
  }, [step])

  // 2. Leaflet Map setup for Step 2 (Location Adjustment)
  useEffect(() => {
    if (step === 2 && mapContainerRef.current) {
      // Small timeout to allow container to fully mount in DOM and avoid leaflet layout glitch
      const timer = setTimeout(() => {
        if (!mapInstanceRef.current) {
          // Initialize Map
          mapInstanceRef.current = L.map(mapContainerRef.current, {
            zoomControl: true,
            scrollWheelZoom: true
          }).setView([latitude, longitude], 16)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapInstanceRef.current)

          // Custom Tree Pin SVG
          const customPin = L.divIcon({
            className: 'custom-map-report-pin',
            html: `<div class="w-8 h-8 rounded-full bg-forest border-2 border-offwhite flex items-center justify-center text-offwhite shadow-lg animate-pin-pulse">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 8 8H4z"/><path d="m12 8 6 6H6z"/><path d="m12 14 4 4H8z"/><path d="M12 18v4"/></svg>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })

          // Draggable Marker
          markerInstanceRef.current = L.marker([latitude, longitude], {
            draggable: true,
            icon: customPin
          }).addTo(mapInstanceRef.current)

          // Handle Dragging
          markerInstanceRef.current.on('dragend', () => {
            const position = markerInstanceRef.current.getLatLng()
            setLatitude(position.lat)
            setLongitude(position.lng)
          })

          // Handle Map Click to position marker
          mapInstanceRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng
            setLatitude(lat)
            setLongitude(lng)
            markerInstanceRef.current.setLatLng([lat, lng])
          })
        }
      }, 100)

      return () => {
        clearTimeout(timer)
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
          markerInstanceRef.current = null
        }
      }
    }
  }, [step])

  // Sync marker if coordinates change from GPS button
  useEffect(() => {
    if (step === 2 && mapInstanceRef.current && markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([latitude, longitude])
      mapInstanceRef.current.panTo([latitude, longitude])
    }
  }, [latitude, longitude])

  // 3. Leaflet Map setup for Success Step
  useEffect(() => {
    if (step === 5 && successMapContainerRef.current) {
      const timer = setTimeout(() => {
        if (!successMapInstanceRef.current) {
          successMapInstanceRef.current = L.map(successMapContainerRef.current, {
            zoomControl: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false
          }).setView([latitude, longitude], 17)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: ''
          }).addTo(successMapInstanceRef.current)

          const successPin = L.divIcon({
            className: 'success-pin',
            html: `<div class="w-8 h-8 rounded-full bg-forest border-2 border-offwhite flex items-center justify-center text-offwhite shadow-lg animate-pin-drop">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 8 8H4z"/><path d="m12 8 6 6H6z"/><path d="m12 14 4 4H8z"/><path d="M12 18v4"/></svg>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })

          L.marker([latitude, longitude], { icon: successPin }).addTo(successMapInstanceRef.current)
        }
      }, 100)

      return () => {
        clearTimeout(timer)
        if (successMapInstanceRef.current) {
          successMapInstanceRef.current.remove()
          successMapInstanceRef.current = null
        }
      }
    }
  }, [step])

  // 4. File selection handler
  const handlePhotoChange = (file) => {
    if (file) {
      setPhotoFile(file)
      setPhotoUrl(URL.createObjectURL(file))
      setStep(2) // proceed immediately to step 2 once photo is set
    }
  }

  // 5. Trigger Species ID
  const startSpeciesIdentification = async () => {
    setStep(3)
    setIsIdentifying(true)
    setSpeciesError('')

    try {
      const result = await api.identifySpecies(photoFile)
      setIdentifiedSpecies(result.species)
      setConfirmedSpecies(result.species)
      setConfidence(result.score)
    } catch (e) {
      console.error(e)
      setSpeciesError('AI species identification failed. You can enter the name manually below.')
      setConfirmedSpecies('')
    } finally {
      setIsIdentifying(false)
    }
  }

  // 6. Submit Tree Report with Proximity Overlap Checking
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Fetch existing trees from database
      const existingTrees = await api.getTrees()
      
      let closestTree = null
      let minDistance = Infinity

      existingTrees.forEach(t => {
        // Calculate distance in meters using basic local approximation
        const dLat = (t.latitude - latitude) * 111139
        const dLon = (t.longitude - longitude) * 111139 * Math.cos(latitude * Math.PI / 180)
        const dist = Math.sqrt(dLat * dLat + dLon * dLon)
        
        if (dist < minDistance) {
          minDistance = dist
          closestTree = t
        }
      })

      // If a tree exists within 25 meters, trigger the overlap resolution modal
      if (closestTree && minDistance < 25) {
        setOverlappingTree(closestTree)
        setOverlappingDistance(Math.round(minDistance))
        setSelectedCondition(closestTree.current_status || 'healthy')
        setShowOverlapModal(true)
        setIsSubmitting(false)
      } else {
        // No overlap, proceed with creating a new tree record
        await executeCreateNewTree()
      }
    } catch (e) {
      console.error(e)
      setSubmitError('Failed to process tree report. Please try again.')
      setIsSubmitting(false)
    }
  }

  const executeCreateNewTree = async () => {
    setIsSubmitting(true)
    try {
      const tree = await api.createTree({
        species: confirmedSpecies.trim() || 'Unknown Species',
        species_confidence: identifiedSpecies === confirmedSpecies ? confidence : 1.0,
        latitude,
        longitude,
        note,
        photoFile,
        reported_by: user.id,
        status: initialStatus
      })
      setNewTreeId(tree.id)
      setStep(5) // Move to success step
    } catch (e) {
      console.error(e)
      setSubmitError('Failed to save tree report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateExistingTree = async () => {
    setIsUpdatingExisting(true)
    setSubmitError('')

    try {
      await api.updateTreeStatus(overlappingTree.id, {
        status: selectedCondition,
        note: note || `Reported status check-in. Condition updated to ${selectedCondition}.`,
        photoFile,
        updated_by: user.id
      })
      
      // Successfully updated, show success screen referencing the updated tree ID
      setShowOverlapModal(false)
      setNewTreeId(overlappingTree.id)
      setStep(5)
    } catch (e) {
      console.error(e)
      setSubmitError('Failed to update the existing tree. Please try again.')
    } finally {
      setIsUpdatingExisting(false)
    }
  }

  // Authentication check wrapper
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-offwhite-dark rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-forest/5 text-forest rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogIn className="h-8 w-8 text-terracotta" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-forest mb-3">Sign In Required</h2>
          <p className="text-charcoal/70 text-sm mb-6 leading-relaxed">
            To maintain accurate mapping data and avoid spam, you must log in to register a tree in the database. Anonymous users can browse the map and stats.
          </p>
          <button
            onClick={() => setActivePage('auth')}
            className="w-full flex items-center justify-center gap-2 bg-forest text-offwhite hover:bg-forest-light text-base font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md"
          >
            Sign In / Sign Up
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
      {/* Step Indicators */}
      {step < 5 && (
        <div className="flex items-center justify-between mb-8 px-2">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                  step === num 
                    ? 'bg-forest border-forest text-offwhite' 
                    : step > num 
                      ? 'bg-forest/10 border-forest text-forest' 
                      : 'bg-white border-offwhite-dark text-charcoal/40'
                }`}
              >
                {step > num ? <Check className="h-4 w-4" /> : num}
              </div>
              {num < 4 && (
                <div 
                  className={`h-0.5 w-10 sm:w-16 mx-1 sm:mx-2 rounded-full ${
                    step > num ? 'bg-forest' : 'bg-offwhite-dark'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-offwhite-dark rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8">
        
        {/* STEP 1: UPLOAD / PHOTO CAMERA */}
        {step === 1 && (
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-forest mb-2">Select a Tree Photo</h2>
            <p className="text-charcoal/60 text-xs sm:text-sm mb-6">
              Take a snapshot on your phone or upload an existing image.
            </p>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-offwhite-dark hover:border-forest/50 transition-colors rounded-2xl p-10 bg-offwhite/30 flex flex-col items-center justify-center min-h-[250px] relative group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handlePhotoChange(e.target.files[0])}
              />
              
              <div className="w-16 h-16 bg-forest/5 text-forest rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                <Camera className="h-8 w-8 text-terracotta" />
              </div>
              <span className="font-semibold text-sm text-forest mb-1">
                Tap to open camera / photo library
              </span>
              <span className="text-xs text-charcoal/50">
                or drag & drop here (Desktop)
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: GPS CONFIRMATION */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-forest mb-2 text-center">Confirm Location</h2>
            <p className="text-charcoal/60 text-xs sm:text-sm mb-6 text-center">
              We've estimated the tree's position. Drag the pin to adjust if necessary.
            </p>

            {/* Image Preview Thumbnail */}
            <div className="flex gap-4 items-center bg-offwhite p-3 rounded-2xl border border-offwhite-dark mb-4">
              <img 
                src={photoUrl} 
                alt="Tree Preview" 
                className="w-14 h-14 rounded-lg object-cover border border-offwhite-dark"
              />
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-charcoal/50">Reported Photo</span>
                <span className="block text-xs truncate text-charcoal/80 font-mono">
                  Lat: {latitude.toFixed(6)}, Lon: {longitude.toFixed(6)}
                </span>
              </div>
              <button 
                onClick={getGPSLocation}
                disabled={gpsLoading}
                className="bg-forest hover:bg-forest-light text-offwhite p-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
              >
                {gpsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                <span>Refresh GPS</span>
              </button>
            </div>

            {gpsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Draggable Map Canvas */}
            <div className="w-full h-72 bg-offwhite-dark rounded-2xl overflow-hidden border border-offwhite-dark shadow-inner relative z-0 mb-6">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 hover:text-forest text-charcoal/70 text-sm font-semibold transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              
              <button
                onClick={startSpeciesIdentification}
                className="flex items-center gap-1.5 bg-forest hover:bg-forest-light text-offwhite text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-md"
              >
                Next: AI Identification <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AI SPECIES ID */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-forest mb-2 text-center">Species Identification</h2>
            
            {isIdentifying ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-terracotta animate-spin mb-4" />
                <span className="text-sm font-medium text-forest font-serif animate-pulse">
                  Analyzing leaf & tree characteristics...
                </span>
                <span className="text-xs text-charcoal/50 mt-1">Calling PlantNet API services</span>
              </div>
            ) : (
              <div>
                <p className="text-charcoal/60 text-xs sm:text-sm mb-6 text-center">
                  Verify or manually correct the identified tree species.
                </p>

                {speciesError ? (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 text-yellow-800 text-xs sm:text-sm rounded-xl flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertCircle className="h-4 w-4 text-terracotta" />
                      <span>Identification Fallback</span>
                    </div>
                    <span>{speciesError}</span>
                  </div>
                ) : (
                  <div className="mb-6 p-5 bg-forest/5 border border-forest/15 rounded-2xl flex items-start gap-4">
                    <div className="bg-forest text-offwhite p-2.5 rounded-xl shrink-0">
                      <Sparkles className="h-5 w-5 text-terracotta" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-charcoal/50 uppercase tracking-wide">Top AI Prediction</span>
                      <h3 className="text-lg font-serif font-bold text-forest mt-0.5">
                        {identifiedSpecies}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-16 bg-offwhite-dark h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-terracotta h-full rounded-full" 
                            style={{ width: `${confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-charcoal/70 font-semibold font-mono">
                          {(confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Input Manual Correction */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-forest uppercase tracking-wide mb-2">
                    Confirmed Species Name
                  </label>
                  <input
                    type="text"
                    value={confirmedSpecies}
                    onChange={(e) => setConfirmedSpecies(e.target.value)}
                    placeholder="e.g. Coast Redwood (Sequoia sempervirens)"
                    className="w-full bg-offwhite border border-offwhite-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
                  />
                  <p className="text-[10px] text-charcoal/40 mt-1.5">
                    Feel free to override the AI result if you know the exact common or scientific name.
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 hover:text-forest text-charcoal/70 text-sm font-semibold transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  
                  <button
                    onClick={() => setStep(4)}
                    disabled={!confirmedSpecies.trim()}
                    className="flex items-center gap-1.5 bg-forest hover:bg-forest-light text-offwhite text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Notes <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: NOTES & FINAL DETAILS */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-forest mb-2 text-center">Add Notes & Submit</h2>
            <p className="text-charcoal/60 text-xs sm:text-sm mb-6 text-center">
              Add any optional context about the tree to complete your report.
            </p>

            <div className="mb-6 bg-offwhite p-4 rounded-2xl border border-offwhite-dark text-xs text-charcoal/70 space-y-1.5">
              <div className="flex justify-between">
                <span className="font-semibold">Species:</span>
                <span className="italic">{confirmedSpecies}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Coordinates:</span>
                <span className="font-mono">{latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Initial Health:</span>
                <span className={`font-semibold uppercase tracking-wide ${
                  initialStatus === 'healthy' ? 'text-forest' : initialStatus === 'sick' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {initialStatus.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Condition Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#02462E] uppercase tracking-wide mb-2">
                Initial Tree Health Condition
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setInitialStatus('healthy')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    initialStatus === 'healthy'
                      ? 'bg-[#02462E] border-[#02462E] text-[#F8F7F2] shadow-sm font-bold'
                      : 'bg-[#F8F7F2] border-offwhite-dark text-charcoal/70 hover:bg-slate-50'
                  }`}
                >
                  Healthy
                </button>
                <button
                  type="button"
                  onClick={() => setInitialStatus('sick')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    initialStatus === 'sick'
                      ? 'bg-[#F1B400] border-[#F1B400] text-[#02462E] shadow-sm font-bold'
                      : 'bg-[#F8F7F2] border-offwhite-dark text-charcoal/70 hover:bg-slate-50'
                  }`}
                >
                  Sick / Injured
                </button>
                <button
                  type="button"
                  onClick={() => setInitialStatus('cut_down')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    initialStatus === 'cut_down'
                      ? 'bg-red-600 border-red-600 text-offwhite shadow-sm font-bold'
                      : 'bg-[#F8F7F2] border-offwhite-dark text-charcoal/70 hover:bg-slate-50'
                  }`}
                >
                  Stump / Cut Down
                </button>
              </div>
            </div>

            {/* Note Area */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-forest uppercase tracking-wide mb-2">
                Field Notes / Landmarks (Optional)
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Large old tree located on the street corner right next to the bus stop shelter. Appears fully matured."
                className="w-full bg-offwhite border border-offwhite-dark rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-forest text-charcoal resize-none"
              />
            </div>

            {submitError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Control */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(3)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 hover:text-forest text-charcoal/70 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-terracotta hover:bg-terracotta-hover text-offwhite text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-md disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Submit to Census
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS PANEL */}
        {step === 5 && (
          <div className="text-center py-4">
            {/* Checked Indicator */}
            <div className="w-16 h-16 bg-forest text-offwhite rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <Check className="h-8 w-8" />
            </div>

            <h2 className="text-3xl font-serif font-bold text-forest mb-2">
              {overlappingTree && newTreeId === overlappingTree.id ? 'Tree Log Updated!' : 'Tree Reported!'}
            </h2>
            <p className="text-charcoal/70 text-sm max-w-sm mx-auto mb-6">
              {overlappingTree && newTreeId === overlappingTree.id 
                ? "Thank you for updating this tree! Your new photo and health condition status have been added to the history timeline of this specimen."
                : "Thank you for contributing to Floras AI! This tree is now live on our map and public dashboard database."}
            </p>

            {/* Mini Map View */}
            <div className="max-w-sm mx-auto h-40 bg-offwhite rounded-2xl overflow-hidden border border-offwhite-dark shadow-inner mb-8 relative z-0">
              <div ref={successMapContainerRef} className="w-full h-full" />
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-sm mx-auto">
              <button
                onClick={() => setActivePage('map')}
                className="w-full bg-forest hover:bg-forest-light text-offwhite text-sm font-semibold px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                View on Full Map
              </button>
              <button
                onClick={() => {
                  setStep(1)
                  setPhotoFile(null)
                  setPhotoUrl('')
                  setConfirmedSpecies('')
                  setIdentifiedSpecies('')
                  setNote('')
                  setInitialStatus('healthy')
                }}
                className="w-full bg-offwhite border border-offwhite-dark hover:bg-offwhite-dark/80 text-forest text-sm font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer"
              >
                Report Another Tree
              </button>
            </div>
          </div>
        )}

        {/* Overlap Detection Modal */}
        {showOverlapModal && overlappingTree && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-offwhite-dark rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
              
              {/* Modal Header */}
              <div className="bg-[#02462E] text-[#F8F7F2] px-6 py-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#F1B400]" />
                <span className="font-serif font-semibold text-base">Nearby Tree Detected</span>
              </div>

              {/* Modal Content */}
              <div className="p-6 text-left">
                <p className="text-charcoal/80 text-xs sm:text-sm leading-relaxed mb-4">
                  An existing <span className="font-semibold text-forest">{overlappingTree.species.split(' (')[0]}</span> was found <span className="font-semibold text-terracotta">{overlappingDistance} meters</span> away from your selected coordinates.
                </p>
                
                <div className="bg-offwhite p-4 rounded-2xl border border-offwhite-dark mb-5 text-xs text-charcoal/70 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Species:</span>
                    <span className="italic">{overlappingTree.species.split(' (')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logged Coordinates:</span>
                    <span className="font-mono">{overlappingTree.latitude.toFixed(5)}, {overlappingTree.longitude.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Known Status:</span>
                    <span className="font-bold uppercase text-forest">{overlappingTree.current_status}</span>
                  </div>
                </div>

                <p className="text-charcoal/75 text-[11px] mb-4 leading-relaxed">
                  If this is a new photo of that same tree, you can add it to its timeline and update its current health condition below:
                </p>

                {/* Condition Selector */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-[#02462E] uppercase tracking-wide mb-2">
                    Update Tree Condition
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCondition('healthy')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                        selectedCondition === 'healthy'
                          ? 'bg-[#02462E] border-[#02462E] text-[#F8F7F2] shadow-sm font-bold'
                          : 'bg-offwhite border-offwhite-dark text-charcoal/70 hover:bg-slate-50'
                      }`}
                    >
                      Healthy
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCondition('sick')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                        selectedCondition === 'sick'
                          ? 'bg-[#F1B400] border-[#F1B400] text-[#02462E] shadow-sm font-bold'
                          : 'bg-offwhite border-offwhite-dark text-charcoal/70 hover:bg-slate-50'
                      }`}
                    >
                      Sick
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCondition('cut_down')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                        selectedCondition === 'cut_down'
                          ? 'bg-red-600 border-red-600 text-offwhite shadow-sm font-bold'
                          : 'bg-offwhite border-offwhite-dark text-charcoal/70 hover:bg-slate-50'
                      }`}
                    >
                      Cut Down
                    </button>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="space-y-3">
                  <button
                    onClick={handleUpdateExistingTree}
                    disabled={isUpdatingExisting}
                    className="w-full py-3 bg-[#02462E] hover:bg-[#0A5C3D] text-[#F1B400] font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingExisting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin animate-none" />
                        Updating Tree...
                      </>
                    ) : (
                      'Update Existing Tree & Photo'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowOverlapModal(false)
                      executeCreateNewTree()
                    }}
                    disabled={isUpdatingExisting || isSubmitting}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-charcoal/70 border border-offwhite-dark font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    No, Create New Tree Record
                  </button>
                  <button
                    onClick={() => {
                      setShowOverlapModal(false)
                      setOverlappingTree(null)
                    }}
                    disabled={isUpdatingExisting}
                    className="w-full py-2.5 text-center text-xs text-charcoal/50 hover:text-charcoal hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
