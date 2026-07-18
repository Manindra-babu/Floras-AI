import React, { useState } from 'react'
import { api } from '../services/api'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { X, FileText, Download, Loader2, Calendar, MapPin, CheckCircle } from 'lucide-react'

export default function ExportReport({ onClose }) {
  const [area, setArea] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [statuses, setStatuses] = useState({
    sick: true,
    cut_down: true,
    healthy: false
  })
  const [loading, setLoading] = useState(false)

  const handleStatusChange = (key) => {
    setStatuses(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const getFilteredData = async () => {
    const selectedStatuses = Object.entries(statuses)
      .filter(([_, checked]) => checked)
      .map(([status]) => status)

    return await api.getAuthorityReportData(
      area.trim(),
      startDate || null,
      endDate || null,
      selectedStatuses
    )
  }

  const exportPDF = async () => {
    setLoading(true)
    try {
      const data = await getFilteredData()
      
      if (data.length === 0) {
        alert('No trees match the selected filters. Please adjust your criteria.')
        return
      }

      const doc = new jsPDF()
      doc.setFont('helvetica')

      // 1. Report Header Logo / Accent Bar
      doc.setFillColor(27, 67, 50) // Forest Green
      doc.rect(0, 0, 210, 8, 'F')

      // 2. Header Titles
      doc.setFontSize(18)
      doc.setTextColor(27, 67, 50)
      doc.setFont('helvetica', 'bold')
      doc.text('FLORAS AI — CIVIC HEALTH REPORT', 14, 22)

      doc.setFontSize(9)
      doc.setTextColor(115, 115, 115)
      doc.setFont('helvetica', 'normal')
      doc.text('COMMUNITY-DRIVEN URBAN FORESTRY MANAGEMENT', 14, 27)

      // Divider line
      doc.setDrawColor(229, 229, 229)
      doc.line(14, 30, 196, 30)

      // 3. Metadata Panel Block
      doc.setFontSize(10)
      doc.setTextColor(43, 43, 43)
      doc.setFont('helvetica', 'bold')
      doc.text('Report Details:', 14, 38)
      
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 44)
      doc.text(`Geographic Scope: ${area.trim() || 'All Logged Sectors'}`, 14, 49)
      doc.text(`Reporting Window: ${startDate || 'All-Time'} to ${endDate || 'Present'}`, 14, 54)

      const activeStatusesText = Object.entries(statuses)
        .filter(([_, checked]) => checked)
        .map(([key]) => key.toUpperCase().replace('_', ' '))
        .join(', ')
      doc.text(`Target Filters: ${activeStatusesText}`, 14, 59)
      doc.text(`Total Flagged Trees: ${data.length} specimens`, 14, 64)

      // Table Setup
      const tableHeaders = [['Common Name', 'Status', 'Coordinates', 'Last Update', 'Guardian', 'Latest Field Notes']]
      const tableRows = data.map(t => [
        t.species.split(' (')[0],
        t.current_status.toUpperCase().replace('_', ' '),
        `${t.latitude.toFixed(5)}, ${t.longitude.toFixed(5)}`,
        new Date(t.last_updated_at).toLocaleDateString(),
        t.reported_by_name || 'Citizen Scientist',
        t.latest_note || 'No notes logged.'
      ])

      // Generate Table
      doc.autoTable({
        startY: 72,
        head: tableHeaders,
        body: tableRows,
        theme: 'striped',
        headStyles: { 
          fillColor: [27, 67, 50],
          textColor: [248, 247, 242],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 8,
          textColor: [43, 43, 43]
        },
        alternateRowStyles: {
          fillColor: [245, 247, 245]
        },
        columnStyles: {
          5: { cellWidth: 55 } // Wrap note details nicely
        }
      })

      // Footer notice / signature
      const finalY = doc.lastAutoTable.finalY + 15
      if (finalY < 270) {
        doc.setFontSize(8)
        doc.setTextColor(115, 115, 115)
        doc.setFont('helvetica', 'italic')
        doc.text('This document was compiled by community members via the Floras AI open platform.', 14, finalY)
        doc.text('For questions or to coordinate municipal operations, please consult the online portal.', 14, finalY + 4)
      }

      // Save PDF
      const filename = `canopy-civic-report-${new Date().toISOString().substring(0, 10)}.pdf`
      doc.save(filename)
    } catch (e) {
      console.error('Error generating PDF:', e)
      alert('Error generating PDF file.')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    setLoading(true)
    try {
      const data = await getFilteredData()

      if (data.length === 0) {
        alert('No trees match the selected filters. Please adjust your criteria.')
        return
      }

      const headers = ['Tree ID', 'Common Name', 'Scientific Name', 'Status', 'Latitude', 'Longitude', 'Date Reported', 'Last Update', 'Notes', 'Reporter']
      
      const csvRows = [
        headers.join(','), // header row
        ...data.map(t => {
          const common = t.species.split(' (')[0]
          const scientific = t.species.match(/\(([^)]+)\)/)?.[1] || 'N/A'
          return [
            `"${t.id}"`,
            `"${common.replace(/"/g, '""')}"`,
            `"${scientific.replace(/"/g, '""')}"`,
            `"${t.current_status.toUpperCase()}"`,
            t.latitude,
            t.longitude,
            `"${new Date(t.created_at).toLocaleDateString()}"`,
            `"${new Date(t.last_updated_at).toLocaleDateString()}"`,
            `"${(t.latest_note || '').replace(/"/g, '""')}"`,
            `"${(t.reported_by_name || 'Citizen Scientist').replace(/"/g, '""')}"`
          ].join(',')
        })
      ]

      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `canopy-report-${new Date().toISOString().substring(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      console.error('Error exporting CSV:', e)
      alert('Error exporting CSV file.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative animate-scale-up">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full bg-offwhite hover:bg-offwhite-dark transition-colors text-charcoal/60"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-forest/5 text-forest flex items-center justify-center rounded-2xl mb-2">
            <FileText className="h-6 w-6 text-terracotta" />
          </div>
          <h3 className="font-serif font-bold text-forest text-lg">Generate Authority Report</h3>
          <p className="text-[10px] text-charcoal/50 uppercase tracking-wide font-semibold mt-0.5">
            Compile community logs for municipal services
          </p>
        </div>

        {/* Filter Inputs */}
        <div className="space-y-4 pt-2">
          {/* Area Filter */}
          <div>
            <label className="block text-[10px] font-bold text-forest uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-terracotta" /> Filter by Area / Neighborhood Name
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Richmond District, Ward 5"
              className="w-full bg-offwhite border border-offwhite-dark rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
            />
          </div>

          {/* Date range row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-forest uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-terracotta" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-offwhite border border-offwhite-dark rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-forest uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-terracotta" /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-offwhite border border-offwhite-dark rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
              />
            </div>
          </div>

          {/* Target Status Checkboxes */}
          <div>
            <label className="block text-[10px] font-bold text-forest uppercase tracking-wider mb-2">
              Include Health Conditions
            </label>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-charcoal">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statuses.sick}
                  onChange={() => handleStatusChange('sick')}
                  className="rounded border-offwhite-dark text-forest focus:ring-forest accent-forest"
                />
                <span>Sick / Declining</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statuses.cut_down}
                  onChange={() => handleStatusChange('cut_down')}
                  className="rounded border-offwhite-dark text-forest focus:ring-forest accent-forest"
                />
                <span>Cut Down / Stumps</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statuses.healthy}
                  onChange={() => handleStatusChange('healthy')}
                  className="rounded border-offwhite-dark text-forest focus:ring-forest accent-forest"
                />
                <span>Healthy</span>
              </label>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-2 space-y-3">
          <button
            onClick={exportPDF}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-forest-hover text-offwhite font-bold py-3 rounded-xl text-sm transition-colors shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Preparing PDF File...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Generate Official PDF</span>
              </>
            )}
          </button>

          <button
            onClick={exportCSV}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-offwhite border border-offwhite-dark text-forest font-bold py-3 rounded-xl text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-terracotta" />
            <span>Download CSV Data File</span>
          </button>
        </div>
      </div>
    </div>
  )
}
