import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Camera, MapPin, AlertTriangle, ArrowRight, ShieldCheck, TreePine, BarChart3 } from 'lucide-react'

export default function LandingPage({ setActivePage }) {
  const [stats, setStats] = useState({ totalTrees: 0, sickTrees: 0, cutDownTrees: 0, alertsSent: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getStats()
        setStats(data)
      } catch (e) {
        console.error('Failed to load landing stats:', e)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-forest text-offwhite py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background graphic */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <TreePine className="w-96 h-96" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-light text-terracotta text-xs font-semibold tracking-wide uppercase mb-6 border border-offwhite/10">
            <ShieldCheck className="h-3.5 w-3.5" /> Civic Protection Initiative
          </span>

          <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-offwhite leading-tight mb-6">
            Every tree has a story.<br />
            <span className="text-terracotta">Let's track it</span> before it's gone.
          </h1>

          <p className="text-lg sm:text-xl text-offwhite-dark max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            A community-driven platform using AI to census local trees, monitor their health, and report illegal removals or disease directly to municipal authorities.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <button
              onClick={() => setActivePage('report')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-hover text-offwhite text-base font-semibold px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Camera className="h-5 w-5" />
              Report a Tree
            </button>
            <button
              onClick={() => setActivePage('map')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-forest-light hover:bg-forest-dark text-offwhite border border-offwhite/20 text-base font-semibold px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <MapPin className="h-5 w-5 text-terracotta" />
              Explore Live Map
            </button>
          </div>

          {/* Real-time Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto bg-forest-light/35 backdrop-blur-md p-6 rounded-2xl border border-offwhite/10 shadow-inner">
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-bold text-offwhite font-serif">
                {loading ? '...' : stats.totalTrees}
              </span>
              <span className="text-xs text-offwhite-dark/80 font-medium uppercase tracking-wide">Trees Tracked</span>
            </div>
            <div className="text-center border-l border-offwhite/10">
              <span className="block text-3xl sm:text-4xl font-bold text-terracotta font-serif">
                {loading ? '...' : stats.alertsSent}
              </span>
              <span className="text-xs text-offwhite-dark/80 font-medium uppercase tracking-wide">Alerts Generated</span>
            </div>
            <div className="text-center border-l border-offwhite/10">
              <span className="block text-3xl sm:text-4xl font-bold text-yellow-400 font-serif">
                {loading ? '...' : stats.sickTrees}
              </span>
              <span className="text-xs text-offwhite-dark/80 font-medium uppercase tracking-wide">Sick Flagged</span>
            </div>
            <div className="text-center border-l border-offwhite/10">
              <span className="block text-3xl sm:text-4xl font-bold text-red-400 font-serif">
                {loading ? '...' : stats.cutDownTrees}
              </span>
              <span className="text-xs text-offwhite-dark/80 font-medium uppercase tracking-wide">Cut Down</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-forest mb-4">
            How Floras AI Works
          </h2>
          <p className="text-charcoal/70 max-w-xl mx-auto text-sm sm:text-base">
            It takes less than a minute to add a tree to the public database and begin monitoring its health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl border border-offwhite-dark shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col items-center text-center group">
            <div className="w-14 h-14 bg-forest/5 text-forest rounded-2xl flex items-center justify-center mb-6 group-hover:bg-forest group-hover:text-offwhite transition-colors duration-300">
              <Camera className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-terracotta uppercase tracking-wide mb-2">Step 1</span>
            <h3 className="text-xl font-serif font-bold text-forest mb-3">Snap a Photo</h3>
            <p className="text-charcoal/80 text-sm leading-relaxed">
              Open the web app on your phone and take a picture of a tree near you, or drag-and-drop a photo from your desktop.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl border border-offwhite-dark shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col items-center text-center group">
            <div className="w-14 h-14 bg-forest/5 text-forest rounded-2xl flex items-center justify-center mb-6 group-hover:bg-forest group-hover:text-offwhite transition-colors duration-300">
              <MapPin className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-terracotta uppercase tracking-wide mb-2">Step 2</span>
            <h3 className="text-xl font-serif font-bold text-forest mb-3">AI ID & Geotag</h3>
            <p className="text-charcoal/80 text-sm leading-relaxed">
              Our integration with the PlantNet API identifies the species instantly, while your browser automatically logs the exact coordinates.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl border border-offwhite-dark shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col items-center text-center group">
            <div className="w-14 h-14 bg-forest/5 text-forest rounded-2xl flex items-center justify-center mb-6 group-hover:bg-forest group-hover:text-offwhite transition-colors duration-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-terracotta uppercase tracking-wide mb-2">Step 3</span>
            <h3 className="text-xl font-serif font-bold text-forest mb-3">Track & Report</h3>
            <p className="text-charcoal/80 text-sm leading-relaxed">
              Monitor changes over time. If a tree dies or is illegally cut down, generate pre-filled official complaints to send to municipal departments.
            </p>
          </div>
        </div>

        {/* Civic CTA banner */}
        <div className="bg-offwhite-dark/50 border border-offwhite-dark rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-forest mb-2">Help Protect Our Urban Canopy</h3>
            <p className="text-charcoal/80 text-sm sm:text-base leading-relaxed">
              Every year, thousands of city trees vanish without any record. Join our community to document and defend public greenery.
            </p>
          </div>
          <button
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-2 bg-forest text-offwhite hover:bg-forest-light text-sm font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <BarChart3 className="h-4 w-4" /> View Public Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  )
}
