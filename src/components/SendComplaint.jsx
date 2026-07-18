import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { X, Copy, Mail, Loader2, MapPin, Check, AlertTriangle, Building, Shield } from 'lucide-react'

const RECIPIENT_EMAILS = {
  municipal: {
    label: 'Municipal Corporation / Tree Authority',
    email: 'tree-protection@municipal-authority.gov',
    description: 'Responsible for public street trees and local zoning tree removal permissions.'
  },
  forest: {
    label: 'State Forest Department',
    email: 'forest-inspector@state-protection.gov',
    description: 'Deals with forest conservation, protected species, and state environmental laws.'
  },
  ngo: {
    label: 'Green Canopy Action (NGO)',
    email: 'canopy-watch@earth-guardians.org',
    description: 'Local volunteer activists who advocate, pressure authorities, and plant replacement trees.'
  }
}

export default function SendComplaint({ tree, history, onClose }) {
  const [address, setAddress] = useState('')
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [recipientType, setRecipientType] = useState('municipal')
  const [copied, setCopied] = useState(false)

  // 1. Fetch Nominatim Reverse Geocoding on mount
  useEffect(() => {
    async function fetchAddress() {
      try {
        const addr = await api.reverseGeocode(tree.latitude, tree.longitude)
        setAddress(addr)
      } catch (err) {
        console.error(err)
        setAddress(`${tree.latitude.toFixed(5)}, ${tree.longitude.toFixed(5)}`)
      } finally {
        setLoadingAddress(false)
      }
    }
    fetchAddress()
  }, [tree.latitude, tree.longitude])

  // Get dates from history
  const creationDate = new Date(tree.created_at).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Get latest history status update date and note
  const sortedHistory = [...history].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const latestUpdate = sortedHistory[0]
  const updateDate = latestUpdate 
    ? new Date(latestUpdate.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : creationDate

  const latestNote = latestUpdate?.note || tree.note || 'No specific details provided.'
  const statusLabel = tree.current_status === 'sick' ? 'DISEASED / SICK / DECLINING' : 'CUT DOWN / ILLEGALLY REMOVED'

  // Generate Complaint Text
  const generateComplaintText = () => {
    return `Subject: Tree Protection Urgency: ${tree.current_status === 'sick' ? 'Diseased' : 'Cut Down'} ${tree.species}

To: ${RECIPIENT_EMAILS[recipientType].label} (${RECIPIENT_EMAILS[recipientType].email})

I am writing to formally report an issue regarding a local urban tree tracked in the public Floras AI database. 

TREE LOG DATA:
------------------------------------------
• Tree Species: ${tree.species}
• Current Condition: ${statusLabel}
• Logged Location Coordinates: Latitude ${tree.latitude.toFixed(6)}, Longitude ${tree.longitude.toFixed(6)}
• Estimated Civic Address: ${loadingAddress ? 'Fetching address...' : address}
• Original Census Report Date: ${creationDate}
• Health Incident Flagged Date: ${updateDate}
------------------------------------------

FIELD OBSERVATIONS & SYMPTOMS:
"${latestNote}"

IMAGE EVIDENCE REFERENCE:
${tree.photo_url}

Please dispatch an inspector to review the tree's health condition or investigate if an illegal felling occurred without proper permits. Under municipal regulations, we request written confirmation of your review or action.

Sincerely,
Concerned Local Resident
Reported via Floras AI Community Initiative.`
  }

  // Handle Copy to Clipboard
  const handleCopy = () => {
    const text = generateComplaintText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle mailto link trigger
  const handleSendEmail = () => {
    const recipient = RECIPIENT_EMAILS[recipientType].email
    const subject = encodeURIComponent(`Tree Protection Alert: ${tree.current_status === 'sick' ? 'Diseased' : 'Cut Down'} ${tree.species.split(' (')[0]}`)
    
    // Body needs to exclude the header stuff
    const bodyText = `I am writing to formally report an issue regarding a local urban tree tracked in the public Floras AI database. 

TREE LOG DATA:
• Tree Species: ${tree.species}
• Current Condition: ${statusLabel}
• Logged Location Coordinates: Latitude ${tree.latitude.toFixed(6)}, Longitude ${tree.longitude.toFixed(6)}
• Estimated Civic Address: ${loadingAddress ? 'Fetching address...' : address}
• Original Census Report Date: ${creationDate}
• Health Incident Flagged Date: ${updateDate}

FIELD OBSERVATIONS:
"${latestNote}"

IMAGE EVIDENCE REFERENCE:
${tree.photo_url}

Please dispatch an inspector to review the tree's health condition or investigate if an illegal felling occurred without proper permits.

Sincerely,
Concerned Local Resident
Reported via Floras AI Community Initiative.`

    const body = encodeURIComponent(bodyText)
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-offwhite-dark rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-forest text-offwhite px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-terracotta" />
            <h3 className="font-serif font-semibold text-lg">Generate Civic Complaint</h3>
          </div>
          <button onClick={onClose} className="hover:text-terracotta transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Geocoding address loader */}
          <div className="flex gap-2.5 items-start bg-offwhite p-3.5 rounded-2xl border border-offwhite-dark text-xs text-charcoal/80">
            <MapPin className="h-4 w-4 text-terracotta shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-forest">Tree Geolocation Address</span>
              {loadingAddress ? (
                <span className="flex items-center gap-1 text-charcoal/50 mt-0.5">
                  <Loader2 className="h-3 w-3 animate-spin" /> Querying Nominatim reverse geocoder...
                </span>
              ) : (
                <span className="font-medium mt-0.5 block leading-relaxed">{address}</span>
              )}
            </div>
          </div>

          {/* Select Recipient */}
          <div>
            <label className="block text-xs font-bold text-forest uppercase tracking-wide mb-2">
              Select Recipient Authority
            </label>
            <div className="space-y-2">
              {Object.entries(RECIPIENT_EMAILS).map(([key, item]) => (
                <label 
                  key={key} 
                  className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    recipientType === key 
                      ? 'bg-forest/5 border-forest text-forest' 
                      : 'bg-white border-offwhite-dark hover:bg-offwhite/50 text-charcoal/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="recipient"
                    value={key}
                    checked={recipientType === key}
                    onChange={() => setRecipientType(key)}
                    className="mt-1 accent-forest"
                  />
                  <div>
                    <span className="block font-semibold text-xs sm:text-sm">{item.label}</span>
                    <span className="block font-mono text-[10px] text-terracotta">{item.email}</span>
                    <span className="block text-[10px] text-charcoal/50 mt-0.5 leading-relaxed">{item.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Code/Text Preview Box */}
          <div>
            <label className="block text-xs font-bold text-forest uppercase tracking-wide mb-1.5 flex justify-between">
              <span>Complaint Text Preview</span>
              <span className="text-[10px] text-charcoal/40 font-normal">Scroll to read full text</span>
            </label>
            <div className="bg-offwhite p-4 rounded-2xl border border-offwhite-dark max-h-48 overflow-y-auto font-mono text-[10px] text-charcoal/80 whitespace-pre-wrap leading-normal border-inner shadow-inner">
              {generateComplaintText()}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-offwhite border border-offwhite-dark hover:bg-offwhite-dark/85 text-forest font-semibold py-3 rounded-xl text-sm transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Copied Complaint!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-terracotta" />
                  <span>Copy Complaint Text</span>
                </>
              )}
            </button>
            <button
              onClick={handleSendEmail}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-forest hover:bg-forest-light text-offwhite font-semibold py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              <span>Email Authority</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
