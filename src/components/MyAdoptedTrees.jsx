import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { 
  TreePine, 
  MapPin, 
  Trash2, 
  Award, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  ShieldCheck,
  Heart
} from 'lucide-react'

export default function MyAdoptedTrees({ setActivePage, setSelectedTreeId }) {
  const { user } = useAuth()
  const [adoptedTrees, setAdoptedTrees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAdoptedTrees = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await api.getAdoptedTrees(user.id)
      
      // Let's attach the "days since last check" for each tree
      const updatedData = await Promise.all(data.map(async (tree) => {
        const details = await api.getTreeDetails(tree.id)
        // Find latest history date
        const sortedHist = [...details.history].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        const latestCheckDate = sortedHist[0] ? new Date(sortedHist[0].created_at) : new Date(tree.created_at)
        
        // Calculate days difference
        const diffTime = Math.abs(new Date() - latestCheckDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        return {
          ...tree,
          daysSinceLastCheck: diffDays,
          latestCheckDateString: latestCheckDate.toLocaleDateString()
        }
      }))

      setAdoptedTrees(updatedData)
    } catch (e) {
      console.error(e)
      setError('Could not load your adopted trees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdoptedTrees()
  }, [user])

  const handleUnadopt = async (treeId) => {
    if (!user) return
    try {
      await api.unadoptTree(treeId, user.id)
      setAdoptedTrees(prev => prev.filter(t => t.id !== treeId))
    } catch (e) {
      console.error(e)
      setError('Failed to remove adoption. Please try again.')
    }
  }

  const handleLocateAndCheck = (treeId) => {
    setSelectedTreeId(treeId)
    setActivePage('map')
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-offwhite-dark rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-forest/5 text-forest rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Award className="h-8 w-8 text-terracotta" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-forest mb-3 font-serif">Stewardship Center</h2>
          <p className="text-charcoal/70 text-sm mb-6 leading-relaxed">
            Please log in to review trees you've adopted, receive monitoring reminders, and log stewardship reports.
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 text-terracotta animate-spin mb-4" />
        <span className="text-sm font-semibold text-forest">Loading stewardship profile...</span>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-serif font-bold text-forest flex items-center gap-2">
          <Award className="h-8 w-8 text-terracotta" /> My Adopted Trees
        </h2>
        <p className="text-charcoal/60 text-xs sm:text-sm mt-1">
          You are acting as a guardian for these trees. Monitor them and log reports if you notice health issues.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Adopted Trees Grid */}
      {adoptedTrees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adoptedTrees.map(tree => {
            const isUrgent = tree.daysSinceLastCheck >= 7 || tree.current_status === 'sick'

            return (
              <div 
                key={tree.id}
                className="bg-white border border-offwhite-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Visual Header */}
                <div className="relative h-40 bg-offwhite border-b border-offwhite-dark shrink-0">
                  <img 
                    src={tree.photo_url} 
                    alt={tree.species} 
                    className="w-full h-full object-cover"
                  />
                  {/* Status Indicator overlay */}
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-md flex items-center gap-1 ${
                    tree.current_status === 'healthy' 
                      ? 'bg-forest text-offwhite border-offwhite/20' 
                      : tree.current_status === 'sick'
                        ? 'bg-yellow-500 text-charcoal border-white/20'
                        : 'bg-red-600 text-offwhite border-offwhite/20'
                  }`}>
                    {tree.current_status === 'healthy' && <Heart className="h-3 w-3 fill-offwhite" />}
                    {tree.current_status === 'sick' && <AlertTriangle className="h-3 w-3" />}
                    {tree.current_status === 'cut_down' && <Trash2 className="h-3 w-3" />}
                    {tree.current_status.replace('_', ' ')}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-forest text-lg leading-snug">
                      {tree.species.split(' (')[0]}
                    </h3>
                    <span className="text-[10px] text-charcoal/50 italic">{tree.species.match(/\(([^)]+)\)/)?.[1] || ''}</span>
                    
                    {/* Location coordinates */}
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-charcoal/50 mt-2 font-mono">
                      <MapPin className="h-3.5 w-3.5 text-terracotta shrink-0" />
                      <span>{tree.latitude.toFixed(5)}, {tree.longitude.toFixed(5)}</span>
                    </div>

                    {/* Stewardship Notification Reminders */}
                    <div className="mt-4 pt-3 border-t border-offwhite-dark">
                      {isUrgent ? (
                        <div className="flex gap-2 p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-2xl text-[11px] text-yellow-800">
                          <AlertTriangle className="h-4 w-4 text-terracotta shrink-0" />
                          <div>
                            <span className="font-bold">Attention Needed</span>
                            <p className="mt-0.5 leading-normal">
                              {tree.current_status === 'sick' 
                                ? 'This tree is currently flagged as sick. Verify treatment or file complaints.'
                                : `Stale check: Last status check was ${tree.daysSinceLastCheck} days ago.`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 p-3 bg-forest/5 border border-forest/10 rounded-2xl text-[11px] text-forest">
                          <CheckCircle className="h-4 w-4 text-forest shrink-0 fill-forest/10" />
                          <div>
                            <span className="font-bold">Stewardship Active</span>
                            <p className="mt-0.5 leading-normal">
                              Checked on recently (last verified {tree.latestCheckDateString}).
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleUnadopt(tree.id)}
                      className="w-1/3 flex items-center justify-center gap-1 border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500 rounded-xl py-2.5 text-xs font-semibold transition-all cursor-pointer"
                      title="Release guardianship"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Release</span>
                    </button>
                    <button
                      onClick={() => handleLocateAndCheck(tree.id)}
                      className="w-2/3 flex items-center justify-center gap-1.5 bg-forest hover:bg-forest-light text-offwhite rounded-xl py-2.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <span>Locate & Check In</span>
                      <ChevronRight className="h-3.5 w-3.5 text-terracotta" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-offwhite-dark p-12 rounded-3xl text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 bg-forest/5 text-forest rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TreePine className="h-6 w-6 text-terracotta" />
          </div>
          <h3 className="font-serif font-bold text-forest text-lg mb-2">No Adopted Trees</h3>
          <p className="text-charcoal/70 text-xs sm:text-sm mb-6 leading-relaxed">
            Stewardship helps monitor trees at risk. Find a tree on our live map and click "Adopt" to add it to your tracking list.
          </p>
          <button
            onClick={() => setActivePage('map')}
            className="inline-flex items-center gap-1.5 bg-forest text-offwhite hover:bg-forest-light text-xs font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <span>Browse the Map</span>
          </button>
        </div>
      )}

    </div>
  )
}

function Loader2({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`lucide ${className}`}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  )
}
