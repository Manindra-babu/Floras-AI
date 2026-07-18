import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  TreePine, 
  BarChart3, 
  Star, 
  Heart,
  Activity,
  Flame,
  Award
} from 'lucide-react'

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
    <div className="flex-1 flex flex-col bg-[#051610] text-[#F8F7F2] font-sans">
      
      {/* Immersive Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: 'linear-gradient(to bottom, rgba(5, 22, 16, 0.45), #051610), url("/hero_forest_bg.png")' 
        }}
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#02462E]/70 text-terracotta text-xs font-semibold tracking-wide uppercase mb-6 border border-white/10 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" /> Canopy Protection Initiative
            </span>

            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-offwhite leading-[1.1] mb-6">
              Lush Canopies<br />
              For Every <span className="text-terracotta italic underline decoration-wavy decoration-1">Neighborhood.</span>
            </h1>

            <p className="text-base sm:text-lg text-offwhite/85 max-w-xl mb-10 font-light leading-relaxed">
              Floras AI is a community-driven civic platform using artificial intelligence to map local street trees, diagnose health anomalies, and automate official arborist reports to prevent illegal removals.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => setActivePage('report')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-hover text-forest-dark text-sm font-semibold px-8 py-4 rounded-xl shadow-lg shadow-terracotta/10 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
              >
                <Camera className="h-4 w-4" />
                Report a Tree
              </button>
              <button
                onClick={() => setActivePage('map')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#02462E]/50 hover:bg-[#02462E]/80 text-offwhite border border-white/10 text-sm font-semibold px-8 py-4 rounded-xl backdrop-blur-md transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
              >
                <MapPin className="h-4 w-4 text-terracotta" />
                Explore Live Map
              </button>
            </div>
          </div>

          {/* Right Testimony/Trust Card Column */}
          <div className="lg:col-span-5 flex justify-center relative">
            
            {/* Main glassmorphism card */}
            <div className="w-full max-w-md bg-[#02462E]/65 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              <div className="flex items-center gap-1 mb-3 text-terracotta">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-terracotta text-terracotta" />
                ))}
                <span className="text-[10px] font-semibold text-offwhite/60 ml-2 tracking-widest uppercase">(5/5 RATING)</span>
              </div>

              <blockquote className="text-sm sm:text-base font-light text-offwhite/90 leading-relaxed mb-6 italic">
                "We mapped over forty street trees in our block. The AI accurately identified two infected maples, and the municipal portal routed a city arborist within 72 hours. Floras AI has completely changed how we protect our parkway."
              </blockquote>

              <div className="flex items-center gap-3 border-t border-white/10 pt-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-terracotta/25 flex items-center justify-center font-bold text-terracotta font-serif text-sm">
                  ED
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-offwhite">Estelle Darcy</h4>
                  <span className="text-[10px] text-offwhite/50 uppercase tracking-wider block">Citizen Guardian, Ward 4</span>
                </div>
              </div>

              {/* Float specs list */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-[#051610]/40 rounded-xl px-3.5 py-2.5 border border-white/5">
                  <Activity className="h-4 w-4 text-terracotta" />
                  <span className="text-xs text-offwhite/80 font-medium">AI Species Identification & Sickness Diagnosis</span>
                </div>
                <div className="flex items-center gap-2 bg-[#051610]/40 rounded-xl px-3.5 py-2.5 border border-white/5">
                  <ShieldCheck className="h-4 w-4 text-terracotta" />
                  <span className="text-xs text-offwhite/80 font-medium">Automatic Municipal Inspection Routing</span>
                </div>
                <div className="flex items-center gap-2 bg-[#051610]/40 rounded-xl px-3.5 py-2.5 border border-white/5">
                  <Heart className="h-4 w-4 text-terracotta" />
                  <span className="text-xs text-offwhite/80 font-medium">Open Portal for Tree Guardianship & Adoptions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Where Urban Trees Find Their Guardians */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left image container */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="/guardian_action.png" 
                alt="Citizen mapping tree" 
                className="w-full h-auto object-cover max-h-[450px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#051610] via-transparent to-transparent" />
            </div>

            {/* Experience floating badge */}
            <div className="absolute bottom-6 right-6 sm:-right-4 bg-terracotta text-forest-dark px-6 py-5 rounded-2xl shadow-xl border border-white/15 flex flex-col items-center">
              <span className="text-3xl font-bold font-serif leading-none tracking-tight">1.5k+</span>
              <span className="text-[9px] uppercase font-bold tracking-widest mt-1 text-forest-dark/80 whitespace-nowrap">Trees Logged</span>
            </div>
          </div>

          {/* Right content column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <span className="text-xs font-bold text-terracotta uppercase tracking-widest mb-3">Community Watch</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-offwhite mb-6 leading-tight">
              Where Urban Trees<br />Find Their Guardians.
            </h2>
            <p className="text-offwhite/70 text-sm sm:text-base leading-relaxed mb-8 font-light">
              Cities lose hundreds of mature trees every year due to unrecorded felling, construction encroachments, or unnoticed insect invasions. Floras AI gives residents the agency to catalog, inspect, and protect every individual trunk.
            </p>
            <button 
              onClick={() => setActivePage('map')}
              className="flex items-center gap-2 bg-[#02462E] hover:bg-[#0A5C3D] text-terracotta border border-terracotta/25 hover:border-terracotta/50 text-sm font-semibold px-6 py-3.5 rounded-xl transition-all cursor-pointer group"
            >
              Learn More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Golden Brand Banner */}
      <div className="bg-terracotta text-forest-dark py-5 px-6 font-serif overflow-hidden select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-6 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-center">
          <span className="flex items-center gap-1.5">🌳 Floras AI</span>
          <span className="hidden md:inline text-forest-dark/30">|</span>
          <span className="flex items-center gap-1.5">🍃 Canopy Protection</span>
          <span className="hidden md:inline text-forest-dark/30">|</span>
          <span className="flex items-center gap-1.5">🌍 Open Data Community</span>
          <span className="hidden md:inline text-forest-dark/30">|</span>
          <span className="flex items-center gap-1.5">🤖 Groq Health Diagnoses</span>
          <span className="hidden md:inline text-forest-dark/30">|</span>
          <span className="flex items-center gap-1.5">🍁 Local Guardians</span>
        </div>
      </div>

      {/* Section 3: Our Featured Protected Species */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-terracotta uppercase tracking-widest block mb-3">Urban Botanical Profile</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-offwhite mb-4">
            Our Featured Protected Species
          </h2>
          <p className="text-offwhite/60 text-sm sm:text-base font-light">
            These native street trees form the backbone of our urban canopy. Search and track them on the live map.
          </p>
        </div>

        {/* Species grid cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-[#02462E]/25 border border-white/10 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all group flex flex-col text-left">
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/species_oak.png" 
                alt="Oak Tree" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-terracotta/90 text-forest-dark rounded-full p-2 border border-white/10">
                <TreePine className="h-4 w-4" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-2 text-terracotta">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-terracotta text-terracotta" />
                  ))}
                  <span className="text-[9px] text-offwhite/50 ml-1.5 uppercase font-medium">Critical Canopy</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-offwhite mb-2">White Oak</h3>
                <span className="text-xs text-terracotta font-mono block mb-3">Quercus alba</span>
                <p className="text-offwhite/70 text-xs sm:text-sm font-light leading-relaxed mb-4">
                  Long-lived giants that support hundreds of beneficial insect species, forming the ecological anchor of parks and wide parkways.
                </p>
              </div>
              <button 
                onClick={() => setActivePage('map')}
                className="w-full py-2.5 rounded-xl bg-[#02462E]/60 hover:bg-terracotta hover:text-forest-dark text-terracotta text-xs font-semibold border border-terracotta/20 hover:border-transparent transition-all text-center cursor-pointer"
              >
                Track on Map
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#02462E]/25 border border-white/10 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all group flex flex-col text-left">
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/species_maple.png" 
                alt="Maple Tree" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-terracotta/90 text-forest-dark rounded-full p-2 border border-white/10">
                <TreePine className="h-4 w-4" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-2 text-terracotta">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-terracotta text-terracotta" />
                  ))}
                  <span className="text-[9px] text-offwhite/50 ml-1.5 uppercase font-medium">Vibrant Shade</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-offwhite mb-2">Sugar Maple</h3>
                <span className="text-xs text-terracotta font-mono block mb-3">Acer saccharum</span>
                <p className="text-offwhite/70 text-xs sm:text-sm font-light leading-relaxed mb-4">
                  Offers dense shade, beautiful autumn colors, and sugar-rich sap. Highly sensitive to soil compaction and road salt.
                </p>
              </div>
              <button 
                onClick={() => setActivePage('map')}
                className="w-full py-2.5 rounded-xl bg-[#02462E]/60 hover:bg-terracotta hover:text-forest-dark text-terracotta text-xs font-semibold border border-terracotta/20 hover:border-transparent transition-all text-center cursor-pointer"
              >
                Track on Map
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#02462E]/25 border border-white/10 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all group flex flex-col text-left">
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/species_pine.png" 
                alt="Pine Tree" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-terracotta/90 text-forest-dark rounded-full p-2 border border-white/10">
                <TreePine className="h-4 w-4" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-2 text-terracotta">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-terracotta text-terracotta" />
                  ))}
                  <span className="text-[9px] text-offwhite/50 ml-1.5 uppercase font-medium">Evergreen Guardian</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-offwhite mb-2">White Pine</h3>
                <span className="text-xs text-terracotta font-mono block mb-3">Pinus strobus</span>
                <p className="text-offwhite/70 text-xs sm:text-sm font-light leading-relaxed mb-4">
                  Evergreen branches provide vital thermal cover for wildlife and capture particulate air pollution all year round.
                </p>
              </div>
              <button 
                onClick={() => setActivePage('map')}
                className="w-full py-2.5 rounded-xl bg-[#02462E]/60 hover:bg-terracotta hover:text-forest-dark text-terracotta text-xs font-semibold border border-terracotta/20 hover:border-transparent transition-all text-center cursor-pointer"
              >
                Track on Map
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Section 4: Capabilities & Services We Provide */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-terracotta uppercase tracking-widest block mb-3">App Features</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-offwhite mb-4">
            Capabilities We Provide
          </h2>
          <p className="text-offwhite/60 text-sm sm:text-base font-light">
            Using technology to connect local communities with tree care and municipal forestry departments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Card 1 */}
          <div className="bg-[#02462E]/15 border border-white/5 p-8 rounded-3xl hover:bg-[#02462E]/35 transition-all text-left flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-terracotta/10 text-terracotta rounded-xl flex items-center justify-center mb-6 border border-terracotta/10 group-hover:bg-terracotta group-hover:text-forest-dark transition-all duration-300">
                <Camera className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-offwhite mb-3">AI Diagnostics</h3>
              <p className="text-offwhite/70 text-xs sm:text-sm font-light leading-relaxed mb-6">
                Take a photo of a leaf or tree canopy. The AI classifies the species and screens it for disease or blight instantly.
              </p>
            </div>
            <button 
              onClick={() => setActivePage('report')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta hover:underline cursor-pointer"
            >
              Analyze Tree <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-[#02462E]/15 border border-white/5 p-8 rounded-3xl hover:bg-[#02462E]/35 transition-all text-left flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-terracotta/10 text-terracotta rounded-xl flex items-center justify-center mb-6 border border-terracotta/10 group-hover:bg-terracotta group-hover:text-forest-dark transition-all duration-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-offwhite mb-3">Arborist Reports</h3>
              <p className="text-offwhite/70 text-xs sm:text-sm font-light leading-relaxed mb-6">
                Generate pre-filled, compliant emails with geotags and photos to submit tree concerns directly to city authorities.
              </p>
            </div>
            <button 
              onClick={() => setActivePage('map')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta hover:underline cursor-pointer"
            >
              Send Alert <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-[#02462E]/15 border border-white/5 p-8 rounded-3xl hover:bg-[#02462E]/35 transition-all text-left flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-terracotta/10 text-terracotta rounded-xl flex items-center justify-center mb-6 border border-terracotta/10 group-hover:bg-terracotta group-hover:text-forest-dark transition-all duration-300">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-offwhite mb-3">Tree Adoptions</h3>
              <p className="text-offwhite/70 text-xs sm:text-sm font-light leading-relaxed mb-6">
                Foster a street tree near you. Log regular watering, seasonal mulching, and care updates to earn contributor points.
              </p>
            </div>
            <button 
              onClick={() => setActivePage('map')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta hover:underline cursor-pointer"
            >
              Adopt Tree <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Card 4 */}
          <div className="bg-[#02462E]/15 border border-white/5 p-8 rounded-3xl hover:bg-[#02462E]/35 transition-all text-left flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-terracotta/10 text-terracotta rounded-xl flex items-center justify-center mb-6 border border-terracotta/10 group-hover:bg-terracotta group-hover:text-forest-dark transition-all duration-300">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-offwhite mb-3">GIS Canopy Heatmap</h3>
              <p className="text-offwhite/70 text-xs sm:text-sm font-light leading-relaxed mb-6">
                Monitor thermal and species distributions in real time to locate neighborhoods lacking canopy shade.
              </p>
            </div>
            <button 
              onClick={() => setActivePage('dashboard')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta hover:underline cursor-pointer"
            >
              Open Dashboard <ArrowRight className="h-3 w-3" />
            </button>
          </div>

        </div>
      </section>

      {/* Section 5: Civic Impact Counters */}
      <section className="bg-[#02462E]/15 py-20 px-4 sm:px-6 lg:px-8 w-full border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="text-left">
            <span className="text-xs font-bold text-terracotta uppercase tracking-widest block mb-3">Civic Milestones & Impact</span>
            <h2 className="text-3xl font-serif font-bold text-offwhite mb-4 leading-tight">
              We Achieve the Best<br />for Our Canopies.
            </h2>
            <p className="text-offwhite/70 text-sm sm:text-base font-light max-w-md">
              Collective community mapping is the most powerful tool for municipal environmental accountability. Here is our tracking milestone so far.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="text-left">
              <span className="block text-4xl sm:text-5xl font-serif font-bold text-terracotta mb-2">
                {loading ? '1,500+' : `${stats.totalTrees}`}
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-offwhite/80">Trees Geotagged</h4>
              <p className="text-[10px] text-offwhite/50 mt-1 font-light">Accurately mapped cataloged trunks</p>
            </div>
            <div className="text-left border-l border-white/10 pl-6">
              <span className="block text-4xl sm:text-5xl font-serif font-bold text-terracotta mb-2">
                99.2%
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-offwhite/80">AI Match Rate</h4>
              <p className="text-[10px] text-offwhite/50 mt-1 font-light">PlantNet botanical identification success</p>
            </div>
            <div className="text-left mt-4">
              <span className="block text-4xl sm:text-5xl font-serif font-bold text-terracotta mb-2">
                450+
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-offwhite/80">Active Guardians</h4>
              <p className="text-[10px] text-offwhite/50 mt-1 font-light">Local residents tracking street trees</p>
            </div>
            <div className="text-left border-l border-white/10 pl-6 mt-4">
              <span className="block text-4xl sm:text-5xl font-serif font-bold text-terracotta mb-2">
                {loading ? '120+' : `${stats.alertsSent}`}
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-offwhite/80">Official Reports Sent</h4>
              <p className="text-[10px] text-offwhite/50 mt-1 font-light">Concerns routed to city arborists</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
