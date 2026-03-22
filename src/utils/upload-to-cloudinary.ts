"use client"

import axios from "axios"

type UploadResult = { url: string; publicId?: string }

export async function uploadToCloudinary(
    file: File,
    opts?: { onProgress?: (pct: number) => void }
): Promise<UploadResult> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !preset) throw new Error("Cloudinary env vars missing")

    const form = new FormData()
    form.append("file", file)
    form.append("upload_preset", preset)

    const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        form,
        {
            onUploadProgress: (e) => {
                if (opts?.onProgress && e.total) {
                    const pct = Math.round((e.loaded * 100) / e.total)
                    opts.onProgress(pct)
                }
            },
        }
    )

    return {
        url: res.data.secure_url as string,
        publicId: res.data.public_id as string | undefined,
    }
}
