'use client'

import { useState, useEffect } from "react"
import { useOrganization } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updateOrganizationDetails, getOrganizationDetails } from "../actions"

export function OrganizationDetails() {
  const { toast } = useToast()
  const { organization } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState({
    name: '',
    subdomain: '',
    phone: '',
    address: '',
    email: ''
  })

  useEffect(() => {
    async function loadDetails() {
      if (!organization?.id) return;

      try {
        const orgDetails = await getOrganizationDetails();
        if (orgDetails) {
          setDetails(orgDetails);
        }
      } catch (error) {
        console.error('Error loading organization details:', error);
        toast({
          variant: "destructive",
          title: "Failed to load organization details",
        })
      }
    }

    loadDetails();
  }, [organization?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateOrganizationDetails(details)
      toast({
        title: "Organization details updated successfully",
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Failed to update organization details",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Organization Name</Label>
        <Input
          id="name"
          value={details.name}
          onChange={(e) => setDetails(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter organization name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subdomain">Subdomain</Label>
        <Input
          id="subdomain"
          value={details.subdomain}
          onChange={(e) => setDetails(prev => ({ ...prev, subdomain: e.target.value.toLowerCase() }))}
          placeholder="Enter subdomain"
          pattern="[a-z0-9-]+"
          title="Subdomain can only contain lowercase letters, numbers, and hyphens"
          required
        />
        <p className="text-sm text-muted-foreground">
          Your organization will be accessible at: {details.subdomain}.yourdomain.com
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={details.email}
          disabled
          className="bg-muted"
        />
        <p className="text-sm text-muted-foreground">Email cannot be edited</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={details.phone}
          onChange={(e) => setDetails(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Enter phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={details.address}
          onChange={(e) => setDetails(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Enter address"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
