import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { isMockMode } from './supabaseClient'
import Header from './components/Header'
import Footer from './components/Footer'
import LandingPage from './components/LandingPage'
import LiveMap from './components/LiveMap'
import ReportTree from './components/ReportTree'
import Dashboard from './components/Dashboard'
import MyAdoptedTrees from './components/MyAdoptedTrees'
import Leaderboard from './components/Leaderboard'
import Auth from './components/Auth'
import { AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react'

function AppContent() {
  const [activePage, setActivePage] = useState('landing')
  const [selectedTreeId, setSelectedTreeId] = useState(null)
  const { user } = useAuth()

  // Render current active page
  const renderPage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage setActivePage={setActivePage} />
      case 'map':
        return <LiveMap selectedTreeId={selectedTreeId} setSelectedTreeId={setSelectedTreeId} />
      case 'report':
        return <ReportTree setActivePage={setActivePage} />
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} setSelectedTreeId={setSelectedTreeId} />
      case 'adopted':
        return <MyAdoptedTrees setActivePage={setActivePage} setSelectedTreeId={setSelectedTreeId} />
      case 'leaderboard':
        return <Leaderboard setActivePage={setActivePage} />
      case 'auth':
        return <Auth setActivePage={setActivePage} />
      default:
        return <LandingPage setActivePage={setActivePage} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-offwhite text-charcoal">
      
      {/* Mock Mode Sticky Banner Alert */}
      {isMockMode && (
        <div className="bg-terracotta text-offwhite text-xs px-4 py-2 text-center font-medium flex items-center justify-center gap-1.5 shrink-0 shadow-inner">
          <ShieldAlert className="h-4 w-4 text-white shrink-0" />
          <span>
            <strong>Demo Mode Active:</strong> Supabase and PlantNet API credentials not configured. Using local in-memory Mock Database.
          </span>
        </div>
      )}

      {/* Main Header */}
      <Header activePage={activePage} setActivePage={setActivePage} />

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col bg-[#F8F7F2]">
        {renderPage()}
      </main>

      {/* Main Footer */}
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
