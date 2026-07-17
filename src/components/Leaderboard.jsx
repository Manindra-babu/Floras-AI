import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { Trophy, Calendar, Award, Shield, User, ChevronUp, Loader2, ArrowRight } from 'lucide-react'

export default function Leaderboard({ setActivePage }) {
  const { user } = useAuth()
  const [period, setPeriod] = useState('all') // 'month' | 'all'
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRankInfo, setUserRankInfo] = useState(null)

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true)
      try {
        const data = await api.getLeaderboard(period)
        setLeaders(data)

        // Find logged in user rank
        if (user) {
          const index = data.findIndex(item => item.userId === user.id)
          if (index !== -1) {
            setUserRankInfo({
              rank: index + 1,
              score: data[index].impactScore,
              reports: data[index].reports,
              updates: data[index].statusUpdates,
              adoptions: data[index].adoptions
            })
          } else {
            setUserRankInfo({
              rank: data.length + 1,
              score: 0,
              reports: 0,
              updates: 0,
              adoptions: 0
            })
          }
        } else {
          setUserRankInfo(null)
        }
      } catch (err) {
        console.error('Error loading leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [period, user])

  const getContributionBadge = (type) => {
    switch (type) {
      case 'Reporter':
        return <span className="bg-forest/10 text-forest border border-forest/10 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Top Reporter</span>
      case 'Updater':
        return <span className="bg-yellow-500/10 text-yellow-700 border border-yellow-500/10 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Top Updater</span>
      case 'Adopter':
        return <span className="bg-terracotta/10 text-terracotta border border-terracotta/10 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Top Adopter</span>
      default:
        return <span className="bg-charcoal/5 text-charcoal/60 border border-charcoal/5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Guardian</span>
    }
  }

  const getRankMedal = (rank) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-amber-500 fill-amber-500/20" />
    if (rank === 2) return <Trophy className="h-5 w-5 text-slate-400 fill-slate-400/20" />
    if (rank === 3) return <Trophy className="h-5 w-5 text-amber-700 fill-amber-700/20" />
    return <span className="font-mono font-bold text-charcoal/40 text-xs w-5 text-center">{rank}</span>
  }

  return (
    <div className="flex-1 bg-offwhite py-8 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-forest/5 border border-forest/15 px-3 py-1 rounded-full text-forest text-xs font-bold uppercase tracking-wider mb-2">
          <Award className="h-3.5 w-3.5 text-terracotta" /> Canopy Guardians
        </div>
        <h2 className="text-3xl font-serif font-bold text-forest tracking-tight sm:text-4xl">
          Top Tree Guardians
        </h2>
        <p className="text-sm text-charcoal/70 max-w-md mx-auto leading-relaxed">
          Citizens active in reporting, updating health statuses, and adopting urban trees.
        </p>
      </div>

      {/* Leaderboard Controls (Period Toggle) */}
      <div className="flex justify-center">
        <div className="bg-white border border-offwhite-dark rounded-xl p-1 shadow-sm flex items-center gap-1">
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'all'
                ? 'bg-forest text-offwhite shadow-sm'
                : 'text-charcoal/60 hover:text-forest'
            }`}
          >
            All-Time Impact
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'month'
                ? 'bg-forest text-offwhite shadow-sm'
                : 'text-charcoal/60 hover:text-forest'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Main Ranking Table Card */}
      <div className="bg-white border border-offwhite-dark rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 text-terracotta animate-spin" />
            <span className="text-xs font-semibold text-forest">Calculating impact scores...</span>
          </div>
        ) : leaders.length === 0 ? (
          <div className="py-20 text-center text-charcoal/50 text-xs">
            No contributor activity recorded for this period yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-forest/5 border-b border-offwhite-dark text-[10px] font-bold text-forest uppercase tracking-wider">
                  <th className="py-4 px-6 text-center w-16">Rank</th>
                  <th className="py-4 px-4">Guardian Name</th>
                  <th className="py-4 px-4 text-center">Reports (x3)</th>
                  <th className="py-4 px-4 text-center">Updates (x2)</th>
                  <th className="py-4 px-4 text-center">Adoptions (x1)</th>
                  <th className="py-4 px-6 text-right w-32">Impact Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-offwhite-dark">
                {leaders.slice(0, 10).map((leader, index) => {
                  const rank = index + 1
                  const isCurrentUser = user && leader.userId === user.id
                  return (
                    <tr 
                      key={leader.userId} 
                      className={`hover:bg-offwhite/40 transition-colors ${
                        isCurrentUser ? 'bg-forest/5' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center">
                          {getRankMedal(rank)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold font-serif ${
                            rank === 1 
                              ? 'bg-amber-100 text-amber-800' 
                              : rank === 2 
                                ? 'bg-slate-100 text-slate-800' 
                                : rank === 3 
                                  ? 'bg-amber-50 text-amber-900' 
                                  : 'bg-offwhite-dark text-forest'
                          }`}>
                            {leader.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-charcoal flex items-center gap-1">
                              {leader.displayName}
                              {isCurrentUser && (
                                <span className="text-[9px] bg-forest text-offwhite px-1.5 py-0.5 rounded font-sans uppercase tracking-wider font-bold">You</span>
                              )}
                            </span>
                            <div className="mt-0.5">
                              {getContributionBadge(leader.topContribution)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-xs font-semibold text-charcoal/70">
                        {leader.reports}
                      </td>
                      <td className="py-4 px-4 text-center text-xs font-semibold text-charcoal/70">
                        {leader.statusUpdates}
                      </td>
                      <td className="py-4 px-4 text-center text-xs font-semibold text-charcoal/70">
                        {leader.adoptions}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-bold font-mono text-forest">
                          {leader.impactScore} pts
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Logged In User Bottom Panel */}
      {userRankInfo ? (
        <div className="bg-forest text-offwhite rounded-3xl p-6 shadow-md border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="h-12 w-12 rounded-full bg-offwhite text-forest flex items-center justify-center font-bold text-lg shadow-inner">
              #{userRankInfo.rank}
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg">Your Guardian Rank</h4>
              <p className="text-xs text-offwhite/85 mt-0.5 leading-relaxed">
                Ranked **#{userRankInfo.rank}** with **{userRankInfo.score}** points ({userRankInfo.reports} reports, {userRankInfo.updates} health updates, {userRankInfo.adoptions} adoptions).
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('map')}
            className="flex items-center gap-1 bg-white hover:bg-offwhite-dark text-forest text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            Explore & Report Trees <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-white border border-offwhite-dark rounded-3xl p-6 text-center space-y-3">
          <p className="text-xs text-charcoal/60">
            Sign in to track your impact score, adopt trees, and climb the Guardian Leaderboard!
          </p>
          <button
            onClick={() => setActivePage('auth')}
            className="inline-flex items-center gap-1.5 bg-forest hover:bg-forest-hover text-offwhite text-xs font-bold px-4.5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Sign In / Register
          </button>
        </div>
      )}
    </div>
  )
}
