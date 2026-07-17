import React, { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { Download, Share2, X, Loader2, MessageSquare, Check } from 'lucide-react'
import { api } from '../services/api'

export default function ShareCard({ tree, onClose }) {
  const cardRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [areaName, setAreaName] = useState('Local Area')

  useEffect(() => {
    // Reverse geocode location to find neighborhood/area name
    async function getArea() {
      try {
        const address = await api.reverseGeocode(tree.latitude, tree.longitude)
        // Extract neighborhood/suburb/city from nominatim address
        const parts = address.split(', ')
        const localName = parts[1] || parts[0] || 'Local Area'
        setAreaName(localName)
      } catch (err) {
        console.error('Error reverse geocoding for card:', err)
      }
    }
    if (tree) {
      getArea()
    }
  }, [tree])

  const handleDownload = async () => {
    if (!cardRef.current) return
    setLoading(true)
    setDownloadSuccess(false)
    try {
      // Small timeout to make sure image is fully loaded in DOM
      await new Promise(r => setTimeout(r, 300))

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1B4332', // fallback forest color
        scale: 2 // double quality for crisp text
      })

      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `tree-card-${tree.id.substring(0, 8)}.png`
      link.href = image
      link.click()

      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    } catch (err) {
      console.error('Error rendering card canvas:', err)
      alert('Could not render image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppShare = async () => {
    // Render/download image first
    await handleDownload()
    
    // Caption
    const speciesCommon = tree.species.split(' (')[0]
    const text = `🌳 I reported a ${speciesCommon} near ${areaName} on Tree Census AI! \n\nHelp protect our urban forest. Join the census: ${window.location.origin}`
    
    // Open WhatsApp
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  const speciesCommon = tree.species.split(' (')[0]
  const speciesScientific = tree.species.match(/\(([^)]+)\)/)?.[1] || 'N/A'

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl relative animate-scale-up">
        {/* Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full bg-offwhite hover:bg-offwhite-dark transition-colors text-charcoal/60"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h3 className="font-serif font-bold text-forest text-lg">Share Tree Card</h3>
          <p className="text-[10px] text-charcoal/50 uppercase tracking-wide font-semibold mt-0.5">
            Download or share this tree profile card
          </p>
        </div>

        {/* --- SHARABLE CARD DOM TARGET --- */}
        <div className="overflow-hidden rounded-2xl shadow-lg border border-offwhite-dark relative">
          <div 
            ref={cardRef}
            className="w-full aspect-square relative flex flex-col justify-end bg-forest text-offwhite p-5 overflow-hidden"
            style={{ width: '320px', height: '320px', margin: '0 auto' }}
          >
            {/* Background Image */}
            <img 
              src={tree.photo_url} 
              alt={tree.species} 
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
              crossOrigin="anonymous"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80'
              }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/95 via-forest-dark/45 to-transparent z-10 pointer-events-none" />

            {/* Card Content Overlay */}
            <div className="relative z-20 space-y-2 text-left">
              {/* Verified Badge */}
              {tree.verified && (
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-offwhite text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 shadow-sm">
                  ✓ Verified Specimen
                </span>
              )}

              {/* Title & Scientific name */}
              <div className="space-y-0.5">
                <h4 className="font-serif font-bold text-xl leading-tight text-white tracking-wide">
                  {speciesCommon}
                </h4>
                <p className="text-[10px] text-offwhite/80 font-medium italic leading-none">
                  {speciesScientific}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-white/15 pt-2 flex items-center justify-between">
                <div>
                  <span className="block text-[8px] text-offwhite/60 uppercase tracking-widest font-semibold">Location</span>
                  <span className="text-[11px] font-medium text-white block truncate max-w-[180px]">
                    Near {areaName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] text-offwhite/60 uppercase tracking-widest font-semibold">Status</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    tree.current_status === 'healthy' 
                      ? 'bg-forest/50 text-white border-white/10' 
                      : tree.current_status === 'sick'
                        ? 'bg-yellow-500/50 text-white border-white/10'
                        : 'bg-red-600/50 text-white border-white/10'
                  }`}>
                    {tree.current_status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Watermark Logo */}
              <div className="border-t border-white/10 pt-1.5 flex items-center justify-between text-[8px] text-offwhite/50 uppercase tracking-wider font-semibold">
                <span>Tree Census AI</span>
                <span>Urban Forest Patrol</span>
              </div>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest-hover text-offwhite font-bold py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Card Image...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="h-4 w-4 text-green-400" />
                <span>Card Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download PNG Card</span>
              </>
            )}
          </button>

          <button
            onClick={handleWhatsAppShare}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            <span>Share to WhatsApp</span>
          </button>
          
          <p className="text-[10px] text-charcoal/40 text-center leading-normal">
            * WhatsApp share will trigger a download and open chat. Make sure to attach the downloaded card image!
          </p>
        </div>
      </div>
    </div>
  )
}
