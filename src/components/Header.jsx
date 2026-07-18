import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { TreePine, Menu, X, LogIn, LogOut, User, Plus, Award } from 'lucide-react'

export default function Header({ activePage, setActivePage }) {
  const { user, signOut, isMockAuth } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNav = (page) => {
    setActivePage(page)
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-forest text-offwhite sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Title */}
          <div 
            onClick={() => handleNav('landing')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="bg-offwhite text-forest p-1.5 rounded-lg transition-transform group-hover:scale-105">
              <TreePine className="h-6 w-6" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-tight block leading-none">Floras AI</span>
              <span className="text-[10px] text-offwhite/70 block tracking-wider uppercase mt-0.5">Community-Driven</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNav('map')}
              className={`hover:text-terracotta transition-colors py-2 text-sm font-medium ${
                activePage === 'map' ? 'text-terracotta border-b-2 border-terracotta' : 'text-offwhite/90'
              }`}
            >
              Live Map
            </button>
            <button
              onClick={() => handleNav('dashboard')}
              className={`hover:text-terracotta transition-colors py-2 text-sm font-medium ${
                activePage === 'dashboard' ? 'text-terracotta border-b-2 border-terracotta' : 'text-offwhite/90'
              }`}
            >
              Community Dashboard
            </button>
            <button
              onClick={() => handleNav('leaderboard')}
              className={`hover:text-terracotta transition-colors py-2 text-sm font-medium ${
                activePage === 'leaderboard' ? 'text-terracotta border-b-2 border-terracotta' : 'text-offwhite/90'
              }`}
            >
              Leaderboard
            </button>
            {user && (
              <button
                onClick={() => handleNav('adopted')}
                className={`hover:text-terracotta flex items-center gap-1 transition-colors py-2 text-sm font-medium ${
                  activePage === 'adopted' ? 'text-terracotta border-b-2 border-terracotta' : 'text-offwhite/90'
                }`}
              >
                <Award className="h-4 w-4" />
                My Adopted Trees
              </button>
            )}
          </nav>

          {/* Right Side Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Report Button */}
            <button
              onClick={() => handleNav('report')}
              className="flex items-center gap-2 bg-terracotta hover:bg-terracotta-hover text-offwhite px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Report a Tree
            </button>

            {/* Auth Action */}
            {user ? (
              <div className="flex items-center gap-3 bg-forest-light px-3 py-1.5 rounded-xl border border-offwhite/10">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-terracotta" />
                  <span className="text-xs text-offwhite-dark max-w-[120px] truncate" title={user.email}>
                    {user.email.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="text-offwhite/70 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('auth')}
                className="flex items-center gap-1.5 hover:text-terracotta text-offwhite/90 text-sm font-medium transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => handleNav('report')}
              className="flex items-center gap-1 bg-terracotta hover:bg-terracotta-hover text-offwhite p-2 rounded-xl text-sm font-medium shadow-sm transition-all"
              title="Report a Tree"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-offwhite hover:text-terracotta p-1.5 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-forest-light bg-forest px-4 pt-2 pb-4 space-y-2 animate-pin-drop">
          <button
            onClick={() => handleNav('map')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              activePage === 'map' ? 'bg-forest-light text-terracotta' : 'hover:bg-forest-light'
            }`}
          >
            Live Map
          </button>
          <button
            onClick={() => handleNav('dashboard')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              activePage === 'dashboard' ? 'bg-forest-light text-terracotta' : 'hover:bg-forest-light'
            }`}
          >
            Community Dashboard
          </button>
          <button
            onClick={() => handleNav('leaderboard')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              activePage === 'leaderboard' ? 'bg-forest-light text-terracotta' : 'hover:bg-forest-light'
            }`}
          >
            Leaderboard
          </button>
          {user && (
            <button
              onClick={() => handleNav('adopted')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
                activePage === 'adopted' ? 'bg-forest-light text-terracotta' : 'hover:bg-forest-light'
              }`}
            >
              My Adopted Trees
            </button>
          )}

          <div className="border-t border-forest-light pt-2 mt-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-forest-light rounded-lg">
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {user.email}
                </span>
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('auth')}
                className="w-full flex items-center justify-center gap-2 bg-forest-light hover:bg-forest-dark border border-offwhite/10 px-4 py-2 rounded-xl text-base font-medium transition-all"
              >
                <LogIn className="h-5 w-5 text-terracotta" />
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
