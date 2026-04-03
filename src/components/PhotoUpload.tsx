'use client'

import { useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { usePhotoUpload } from '@/lib/hooks/usePhotoUpload'

interface PhotoUploadProps {
  familyId: string
  choreId: string
  memberId: string
  date: string
  onUploaded: (url: string) => void
  onCancel: () => void
}

export function PhotoUpload({ familyId, choreId, memberId, date, onUploaded, onCancel }: PhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { uploadPhoto, uploading } = usePhotoUpload()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = await uploadPhoto(file, familyId, choreId, memberId, date)
    if (url) {
      onUploaded(url)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 disabled:opacity-50"
      >
        <Camera size={14} />
        {uploading ? 'Uploading...' : 'Take Photo'}
      </button>
      <button
        onClick={onCancel}
        className="p-2 text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>
    </div>
  )
}
