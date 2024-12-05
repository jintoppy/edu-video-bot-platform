'use client'

import { useState, useEffect } from "react"
import { useOrganization } from "@clerk/nextjs"
import { HexColorPicker } from "react-colorful"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { updateOrganizationTheme, getOrganizationTheme, updateOrganizationLogo, removeOrganizationLogo } from "../actions"
import { toast } from "sonner"
import { ImageIcon, Trash2 } from "lucide-react"

export function ThemeSettings() {
  const { organization } = useOrganization()
  const [primaryColor, setPrimaryColor] = useState("#3B82F6")
  const [secondaryColor, setSecondaryColor] = useState("#10B981")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      if (!organization?.id) return;

      try {
        const theme = await getOrganizationTheme();
        if (theme) {
          setPrimaryColor(theme.primaryColor);
          setSecondaryColor(theme.secondaryColor);
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
        toast.error("Failed to load theme settings");
      }
    }

    loadSettings();
  }, [organization?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateOrganizationTheme({
        primary: primaryColor,
        secondary: secondaryColor,
      })
      toast.success("Theme updated successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to update theme")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organization?.name) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orgName', organization.name);
      
      await updateOrganizationLogo(formData);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload logo");
    }
  };

  const handleLogoRemove = async () => {
    try {
      await removeOrganizationLogo();
      toast.success("Logo removed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove logo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label>Organization Logo</Label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Upload Logo
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLogoRemove}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Logo
          </Button>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Label>Primary Color</Label>
          <div className="flex gap-4">
            <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-28"
            />
          </div>
          <div 
            className="h-12 rounded-md" 
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        <div className="space-y-4">
          <Label>Secondary Color</Label>
          <div className="flex gap-4">
            <HexColorPicker color={secondaryColor} onChange={setSecondaryColor} />
            <Input
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-28"
            />
          </div>
          <div 
            className="h-12 rounded-md" 
            style={{ backgroundColor: secondaryColor }}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
