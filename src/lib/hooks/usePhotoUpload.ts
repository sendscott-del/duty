'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false)

  const uploadPhoto = async (
    file: File,
    familyId: string,
    choreId: string,
    memberId: string,
    date: string
  ): Promise<string | null> => {
    setUploading(true)

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${familyId}/${choreId}/${date}_${memberId}.${ext}`

    const { error } = await supabase.storage
      .from('chore-photos')
      .upload(path, file, { upsert: true })

    setUploading(false)

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('chore-photos')
      .getPublicUrl(path)

    return urlData.publicUrl
  }

  return { uploadPhoto, uploading }
}
