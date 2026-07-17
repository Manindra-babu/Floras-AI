import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { X, Upload, Loader2, AlertCircle, Heart, AlertTriangle, Trash2 } from 'lucide-react'

export default function UpdateStatus({ tree, onClose, onUpdateSuccess }) {
  const { user } = useAuth()
  const [status, setStatus] = useState(tree.current_status)
  const [note, setNote] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handlePhotoChange = (file) => {
    if (file) {
      setPhotoFile(file)
      setPhotoUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      setError('You must be signed in to update status.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await api.updateTreeStatus(tree.id, {
        status,
        note: note.trim() || `Status updated to ${status}.`,
        photoFile,
        updated_by: user.id
      })
      onUpdateSuccess()
    } catch (err) {
      console.error(err)
      setError('Failed to update status. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-offwhite-dark rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-forest text-offwhite px-6 py-4">
          <h3 className="font-serif font-semibold text-lg">Update Tree Status</h3>
          <button onClick={onClose} className="hover:text-terracotta transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-forest uppercase tracking-wide mb-3">
              Select New Health Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Healthy */}
              <button
                type="button"
                onClick={() => setStatus('healthy')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  status === 'healthy'
                    ? 'bg-forest/10 border-forest text-forest shadow-sm'
                    : 'border-offwhite-dark bg-white hover:bg-offwhite/50 text-charcoal/60'
                }`}
              >
                <Heart className={`h-5 w-5 ${status === 'healthy' ? 'fill-forest text-forest' : 'text-charcoal/40'}`} />
                <span>Healthy</span>
              </button>

              {/* Sick */}
              <button
                type="button"
                onClick={() => setStatus('sick')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  status === 'sick'
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600 shadow-sm'
                    : 'border-offwhite-dark bg-white hover:bg-offwhite/50 text-charcoal/60'
                }`}
              >
                <AlertTriangle className={`h-5 w-5 ${status === 'sick' ? 'text-yellow-600' : 'text-charcoal/40'}`} />
                <span>Sick / Dying</span>
              </button>

              {/* Cut Down */}
              <button
                type="button"
                onClick={() => setStatus('cut_down')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  status === 'cut_down'
                    ? 'bg-red-500/10 border-red-500 text-red-600 shadow-sm'
                    : 'border-offwhite-dark bg-white hover:bg-offwhite/50 text-charcoal/60'
                }`}
              >
                <Trash2 className={`h-5 w-5 ${status === 'cut_down' ? 'text-red-600' : 'text-charcoal/40'}`} />
                <span>Cut Down</span>
              </button>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-forest uppercase tracking-wide mb-2">
              Upload Current Photo (Optional)
            </label>
            
            {photoUrl ? (
              <div className="relative rounded-2xl border border-offwhite-dark overflow-hidden h-32 bg-offwhite">
                <img src={photoUrl} alt="Update Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoUrl('')
                  }}
                  className="absolute top-2 right-2 bg-charcoal/70 hover:bg-charcoal text-offwhite p-1 rounded-full shadow-md"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-offwhite-dark hover:border-forest/30 transition-colors rounded-2xl p-4 bg-offwhite/30 flex items-center justify-center gap-2 cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-4 w-4 text-terracotta" />
                <span className="text-xs font-medium text-forest">Tap to upload a photo</span>
              </div>
            )}
          </div>

          {/* Note Area */}
          <div>
            <label className="block text-xs font-bold text-forest uppercase tracking-wide mb-2">
              Visual Symptoms / Status Notes
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what has changed (e.g. bark disease spots, developer activity, yellow leaves, tree stump remaining)."
              className="w-full bg-offwhite border border-offwhite-dark rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-forest text-charcoal resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/2 bg-offwhite border border-offwhite-dark hover:bg-offwhite-dark/85 text-forest font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 bg-forest hover:bg-forest-light text-offwhite font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
