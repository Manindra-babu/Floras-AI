import React from 'react'
import { TreePine, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-offwhite/85 py-8 mt-auto border-t border-forest-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          {/* Logo and Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <TreePine className="h-6 w-6 text-terracotta" />
              <span className="font-serif font-semibold text-lg text-offwhite">Tree Census AI</span>
            </div>
            <p className="text-xs text-offwhite/60">
              Visualizing urban tree health, protecting our greenspace.
            </p>
          </div>

          {/* Mission statement */}
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-sm max-w-sm italic">
              "Turning invisible tree loss into visible, actionable public data to empower communities and save our urban forests."
            </p>
          </div>

          {/* Quick links & meta */}
          <div className="flex flex-col items-center md:items-end gap-2 text-xs text-offwhite/60">
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-terracotta fill-terracotta animate-pulse" />
              <span>for the community</span>
            </div>
            <p className="text-center md:text-right">
              &copy; {new Date().getFullYear()} Tree Census AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
