'use client'

import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ToastProvider, ToastViewport } from '@/components/ui/toast'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [deviceId, setDeviceId] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      fetchUserProfile()
    }
  }, [user])

  useEffect(() => {
    const storeUserData = async () => {
      const appState = window.history.state?.appState
      if (appState?.returnTo === '/authentication/profile' && appState?.signupData) {
        try {
          const response = await fetch('/api/auth/store-user-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(appState.signupData),
          })
          if (response.ok) {
            toast({
              title: "Account Created",
              description: "Your account has been successfully created and your data has been stored.",
            })
          } else {
            throw new Error('Failed to store user data')
          }
        } catch (error) {
          console.error('Error storing user data:', error)
          toast({
            title: "Error",
            description: "There was an error creating your account. Please try again.",
            variant: "destructive",
          })
        }
      }
    }

    if (isAuthenticated && !isLoading) {
      storeUserData()
    }
  }, [isAuthenticated, isLoading, toast])

  const fetchUserProfile = async () => {
    try {
      const token = await getAccessTokenSilently()
      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDeviceId(data.deviceId || '')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleSave = async () => {
    try {
      const token = await getAccessTokenSilently()
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, name, deviceId }),
      })

      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved.",
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your profile.</div>
  }

  return (
    <ToastProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information and LabNose device settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="deviceId">LabNose Device ID</Label>
                <Input
                  id="deviceId"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="Enter your LabNose device ID"
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <ToastViewport />
    </ToastProvider>
  )
}