'use client'

import { useState, useCallback, useEffect } from "react"
import { useOrganization } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateOrganizationLogo, removeOrganizationLogo, getOrganizationLogo } from "../actions"
import Image from "next/image"
import { useDropzone } from "react-dropzone"

export function LogoSettings() {
  const { organization } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    async function loadLogo() {
      if (!organization?.id) return;

      try {
        const logoUrl = await getOrganizationLogo();
        if (logoUrl) {
          setPreview(logoUrl);
        }
      } catch (error) {
        console.error('Error loading logo:', error);
        toast.error("Failed to load logo");
      }
    }

    loadLogo();
  }, [organization?.id]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file || !organization?.name) return
    // Show preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    setLoading(true)
    try {
      // Upload to blob storage and update database
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orgName', organization.name);
      
      const url = await updateOrganizationLogo(formData);
      
      // Update preview with the actual URL
      setPreview(url)
      toast.success("Organization logo has been updated successfully")
    } catch (error) {
      console.error('Error updating logo:', error)
      toast.error("Failed to update organization logo. Please try again.")
      // Revert preview on error
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }, [organization?.name])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  })

  const handleRemoveLogo = async () => {
    setLoading(true);
    try {
      await removeOrganizationLogo();
      setPreview(null);
      toast.success("Organization logo has been removed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove organization logo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300"}
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} disabled={loading} />
        {preview ? (
          <div className="relative w-48 h-48 mx-auto">
            <Image
              src={preview}
              alt="Organization logo"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <div className="text-gray-500">
            {isDragActive ? (
              <p>Drop the logo here ...</p>
            ) : (
              <p>Drag and drop your logo here, or click to select</p>
            )}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        <p>Accepted file types: PNG, JPG, GIF</p>
        <p>Maximum file size: 5MB</p>
      </div>

      {preview && (
        <Button
          variant="destructive"
          onClick={handleRemoveLogo}
          disabled={loading}
        >
          Remove Logo
        </Button>
      )}
    </div>
  )
}
