'use client'

import * as React from 'react'
import { useOrganization, useSignIn, useSignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from 'next/link'

export default function OrgOnboardingPage() {
  const { isLoaded, signUp, setActive: setActiveSignUp } = useSignUp()
  const { signIn, setActive: setActiveSignIn } = useSignIn()
  const { organization } = useOrganization()
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  console.log('organization', organization);

  // Get the token and account status from the query params
  const searchParams = useSearchParams()
  const token = searchParams.get('__clerk_ticket')
  const accountStatus = searchParams.get('__clerk_status')

  // If there is no invitation token, restrict access to this page
  if (!token) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>No invitation token found. Please use the invitation link sent to your email.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Handle sign-in
  React.useEffect(() => {
    if (!signIn || !setActiveSignIn || !token || organization || accountStatus !== 'sign_in') {
      return
    }

    const createSignIn = async () => {
      setLoading(true)
      try {
        const signInAttempt = await signIn.create({
          strategy: 'ticket',
          ticket: token,
        })

        if (signInAttempt.status === 'complete') {
          await setActiveSignIn({
            session: signInAttempt.createdSessionId,
          })
        } else {
          console.error(JSON.stringify(signInAttempt, null, 2))
        }
      } catch (err) {
        console.error('Error:', JSON.stringify(err, null, 2))
      } finally {
        setLoading(false)
      }
    }

    createSignIn()
  }, [signIn, setActiveSignIn, token, organization, accountStatus])

  // Handle submission of the sign-up form
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    try {
      const signUpAttempt = await signUp.create({
        strategy: 'ticket',
        ticket: token,
        firstName,
        lastName,
        password,
      })

      if (signUpAttempt.status === 'complete') {
        await setActiveSignUp({ session: signUpAttempt.createdSessionId })
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

  if (accountStatus === 'sign_in' && !organization) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>Signing you in to your organization...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (accountStatus === 'sign_up' && !organization) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Please provide your information to join the organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome to Your Organization!</CardTitle>
          <CardDescription>Your account has been set up successfully.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-600">
            You can now access all organization features and start collaborating with your team.
          </p>
          <Link href="/admin">
          <Button>View Dashboard</Button>
        </Link>
        </CardContent>
      </Card>
    </div>
  )
}
