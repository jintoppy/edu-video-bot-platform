'use client'

import { useState, useEffect } from "react"
import { useOrganization } from "@clerk/nextjs"
import { HexColorPicker } from "react-colorful"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { updateOrganizationTheme } from "../actions"
import { toast } from "sonner"
import { db } from "@/lib/db"
import { organizationSettings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export function ThemeSettings() {
  const { organization } = useOrganization()
  const [primaryColor, setPrimaryColor] = useState("#3B82F6")
  const [secondaryColor, setSecondaryColor] = useState("#10B981")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      if (!organization?.id) return;

      try {
        const settings = await db.query.organizationSettings.findFirst({
          where: eq(organizationSettings.organizationId, organization.id)
        });

        if (settings?.theme) {
          const theme = settings.theme as { primaryColor: string; secondaryColor: string };
          setPrimaryColor(theme.primaryColor);
          setSecondaryColor(theme.secondaryColor);
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
