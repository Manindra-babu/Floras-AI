import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts'
import { 
  TreePine, 
  AlertTriangle, 
  Trash2, 
  Map, 
  Clock, 
  Award,
  ChevronRight,
  TrendingUp,
  MapPin,
  FileText,
  CheckCircle
} from 'lucide-react'
import ExportReport from './ExportReport'

export default function Dashboard({ setActivePage, setSelectedTreeId }) {
  const [stats, setStats] = useState({ totalTrees: 0, sickTrees: 0, cutDownTrees: 0, alertsSent: 0, verifiedPercentage: 0 })
  const [trees, setTrees] = useState([])
  const [sickTreesList, setSickTreesList] = useState([])
  const [areaStats, setAreaStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        // 1. Fetch Stats
        const statsData = await api.getStats()
        setStats(statsData)

        // 2. Fetch all trees
        const allTrees = await api.getTrees()
        setTrees(allTrees)

        // 3. Filter sick trees and sort by date
        const sickList = allTrees
          .filter(t => t.current_status === 'sick')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setSickTreesList(sickList)

        // 4. Generate Top Areas (Mock geocoding / grouping)
        // For local demo, group by coordinate clusters or provide some preset neighborhoods
        const areas = [
          { name: 'Golden Gate Park', count: allTrees.filter(t => t.latitude < 37.773 && t.longitude < -122.48).length || 3 },
          { name: 'Richmond District', count: allTrees.filter(t => t.latitude >= 37.773).length || 2 },
          { name: 'Sunset District', count: allTrees.filter(t => t.latitude < 37.769 && t.longitude >= -122.48).length || 1 }
        ]
        setAreaStats(areas.sort((a,b) => b.count - a.count))

      } catch (e) {
        console.error('Failed to load dashboard data:', e)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Process data for charts
  const conditionData = [
    { name: 'Healthy', value: stats.totalTrees - stats.sickTrees - stats.cutDownTrees, color: '#1B4332' },
    { name: 'Sick / Declining', value: stats.sickTrees, color: '#C97C4B' },
    { name: 'Cut Down', value: stats.cutDownTrees, color: '#EF4444' }
  ].filter(item => item.value > 0)

  // Top species calculation
  const speciesCounts = trees.reduce((acc, tree) => {
    const commonName = tree.species?.split(' (')[0] || 'Unknown'
    acc[commonName] = (acc[commonName] || 0) + 1
    return acc
  }, {})

  const speciesData = Object.entries(speciesCounts)
    .map(([name, value]) => ({ name, count: value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5

  const handleLocateTree = (treeId) => {
    setSelectedTreeId(treeId)
    setActivePage('map')
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 text-terracotta animate-spin mb-4" />
        <span className="text-sm font-semibold text-forest">Loading public canopy metrics...</span>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-forest">Canopy Health & Analytics</h2>
          <p className="text-charcoal/60 text-xs sm:text-sm">
            Aggregate data representing collective community tree preservation logs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-offwhite border border-offwhite-dark hover:bg-offwhite-dark/85 text-forest text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <FileText className="h-4 w-4 text-terracotta" /> Export Civic Report
          </button>
          <button
            onClick={() => setActivePage('map')}
            className="flex items-center gap-2 bg-forest text-offwhite hover:bg-forest-light text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Map className="h-4 w-4 text-terracotta" /> View Live Map
          </button>
        </div>
      </div>

      {/* 1. Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-offwhite-dark p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-forest mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Total Tracked</span>
            <TreePine className="h-5 w-5 text-forest" />
          </div>
          <span className="block text-3xl font-serif font-bold text-forest">{stats.totalTrees}</span>
          <span className="text-[10px] text-charcoal/50 mt-1 block">Live registered specimens</span>
        </div>

        <div className="bg-white border border-offwhite-dark p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-yellow-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Sick & Declining</span>
            <AlertTriangle className="h-5 w-5 text-terracotta" />
          </div>
          <span className="block text-3xl font-serif font-bold text-terracotta">{stats.sickTrees}</span>
          <span className="text-[10px] text-charcoal/50 mt-1 block">Need immediate treatment</span>
        </div>

        <div className="bg-white border border-offwhite-dark p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-red-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Felled / Stumps</span>
            <Trash2 className="h-5 w-5 text-red-500" />
          </div>
          <span className="block text-3xl font-serif font-bold text-red-500">{stats.cutDownTrees}</span>
          <span className="text-[10px] text-charcoal/50 mt-1 block">Lost urban canopy</span>
        </div>

        <div className="bg-white border border-offwhite-dark p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-forest mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Complaints Filed</span>
            <TrendingUp className="h-5 w-5 text-forest" />
          </div>
          <span className="block text-3xl font-serif font-bold text-forest">{stats.alertsSent}</span>
          <span className="text-[10px] text-charcoal/50 mt-1 block">Official reports dispatched</span>
        </div>

        <div className="bg-white border border-offwhite-dark p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Verified Rate</span>
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </div>
          <span className="block text-3xl font-serif font-bold text-blue-600">
            {stats.verifiedPercentage !== undefined ? stats.verifiedPercentage : 0}%
          </span>
          <span className="text-[10px] text-charcoal/50 mt-1 block">Confirmed by citizens</span>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Condition Pie Chart */}
        <div className="bg-white border border-offwhite-dark rounded-3xl p-6 shadow-sm flex flex-col min-h-[320px]">
          <h3 className="font-serif font-bold text-forest text-lg mb-4">Canopy Health Distribution</h3>
          {conditionData.length > 0 ? (
            <div className="flex-1 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {conditionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#F8F7F2', 
                      borderRadius: '12px', 
                      border: '1px solid #EEECE3',
                      fontSize: '11px'
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-charcoal/40 text-xs italic">
              No health data logged yet.
            </div>
          )}
        </div>

        {/* Species Distribution Chart */}
        <div className="bg-white border border-offwhite-dark rounded-3xl p-6 shadow-sm flex flex-col min-h-[320px]">
          <h3 className="font-serif font-bold text-forest text-lg mb-4">Top Reported Species</h3>
          {speciesData.length > 0 ? (
            <div className="flex-1 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speciesData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: '10px', fontWeight: 500, fill: '#2B2B2B' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#F8F7F2', 
                      borderRadius: '12px', 
                      border: '1px solid #EEECE3',
                      fontSize: '11px' 
                    }}
                  />
                  <Bar dataKey="count" fill="#1B4332" radius={[0, 8, 8, 0]} barSize={16}>
                    {speciesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#1B4332" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-charcoal/40 text-xs italic">
              No species listings logged yet.
            </div>
          )}
        </div>
      </div>

      {/* 3. Sick Feed & Geographics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: At Risk Alert Feed (2 cols) */}
        <div className="bg-white border border-offwhite-dark rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-offwhite-dark pb-3">
            <AlertTriangle className="h-5 w-5 text-terracotta" />
            <div>
              <h3 className="font-serif font-bold text-forest text-lg">Trees At Risk</h3>
              <p className="text-[10px] text-charcoal/50 uppercase tracking-wide font-semibold mt-0.5">
                Urgent attention needed for these sick specimens
              </p>
            </div>
          </div>

          {sickTreesList.length > 0 ? (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {sickTreesList.map(tree => (
                <div 
                  key={tree.id}
                  className="flex gap-4 p-3.5 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/15 rounded-2xl transition-all"
                >
                  <img 
                    src={tree.photo_url} 
                    alt={tree.species} 
                    className="w-16 h-16 rounded-xl object-cover border border-offwhite-dark shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-forest text-sm truncate leading-snug">
                      {tree.species.split(' (')[0]}
                    </h4>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-charcoal/60 mt-1">
                      <Clock className="h-3 w-3 text-terracotta" /> Flagged {new Date(tree.created_at).toLocaleDateString()}
                    </span>
                    <p className="text-xs text-charcoal/70 line-clamp-1 mt-1 leading-normal italic">
                      "{tree.note || 'No notes left'}"
                    </p>
                  </div>
                  <button
                    onClick={() => handleLocateTree(tree.id)}
                    className="self-center flex items-center justify-center p-2.5 bg-white border border-offwhite-dark hover:border-forest text-forest hover:bg-forest/5 rounded-xl transition-all shadow-sm shrink-0"
                    title="Locate on map"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-charcoal/40 text-xs italic">
              Excellent! No trees are currently flagged as sick.
            </div>
          )}
        </div>

        {/* Right Column: Geographic hot-spots */}
        <div className="bg-white border border-offwhite-dark rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-offwhite-dark pb-3">
            <MapPin className="h-5 w-5 text-terracotta" />
            <div>
              <h3 className="font-serif font-bold text-forest text-lg">Active Census Sectors</h3>
              <p className="text-[10px] text-charcoal/50 uppercase tracking-wide font-semibold mt-0.5">
                Areas with highest reporting activity
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {areaStats.map((area, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-medium text-charcoal">
                  <span className="w-5 h-5 rounded-full bg-forest text-offwhite flex items-center justify-center font-serif text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{area.name}</span>
                </div>
                <span className="bg-forest/5 border border-forest/10 px-2.5 py-1 rounded-full text-forest font-bold text-[10px]">
                  {area.count} {area.count === 1 ? 'Report' : 'Reports'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Leaderboard Callout Banner */}
      <div className="bg-forest text-offwhite rounded-3xl p-6 shadow-sm border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-2xl">
            <Award className="h-6 w-6 text-terracotta" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-lg">Guardian Leaderboard is Live!</h4>
            <p className="text-xs text-offwhite/85 mt-1 leading-relaxed">
              Earn impact points by reporting trees, updating health conditions, and adopting specimens.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActivePage('leaderboard')}
          className="bg-white text-forest hover:bg-offwhite-dark text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
        >
          View Rankings
        </button>
      </div>

      {/* Export Report Modal */}
      {showExportModal && (
        <ExportReport onClose={() => setShowExportModal(false)} />
      )}

    </div>
  )
}

// Simple loader helper inline
function Loader2({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`lucide ${className}`}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  )
}
