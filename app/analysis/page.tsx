'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer } from '@/components/ui/chart'
import Link from 'next/link'

// Function to generate random data
const generateData = (count: number) => {
  const data = []
  let lastVOC = Math.random() * 5 + 1 // Start with a random VOC between 1 and 6 ppm
  let lastTemp = Math.random() * 10 + 20 // Start with a random temperature between 20 and 30 °C
  let lastHumidity = Math.random() * 20 + 40 // Start with a random humidity between 40 and 60 %

  for (let i = 0; i < count; i++) {
    const time = new Date(Date.now() - (count - 1 - i) * 300000) // Generate time for last 'count' 5-minute intervals
    const voc = Math.max(0, Math.min(10, lastVOC + (Math.random() - 0.5))) // Adjust VOC randomly, keep between 0 and 10
    const temperature = Math.max(15, Math.min(35, lastTemp + (Math.random() - 0.5))) // Adjust temperature randomly, keep between 15 and 35
    const humidity = Math.max(30, Math.min(70, lastHumidity + (Math.random() - 0.5))) // Adjust humidity randomly, keep between 30 and 70

    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      voc: Number(voc.toFixed(2)),
      temperature: Number(temperature.toFixed(1)),
      humidity: Number(humidity.toFixed(1))
    })

    lastVOC = voc
    lastTemp = temperature
    lastHumidity = humidity
  }
  return data
}

export default function AnalysisPage() {
  const [isNewDeviceConnected, setIsNewDeviceConnected] = useState(false)
  const [sensorData, setSensorData] = useState(generateData(12)) // Start with 1 hour of data (12 * 5 minutes)
  const [currentReadings, setCurrentReadings] = useState(sensorData[sensorData.length - 1])

  // NEW: Fetch real VOC data from backend
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const res = await fetch('/api/voc') // You must set up this endpoint
        const data = await res.json()
        setSensorData(prev => [...prev.slice(1), data])
        setCurrentReadings(data)
      } catch (err) {
        console.error('Failed to fetch real sensor data:', err)
      }
    }
    const interval = setInterval(fetchRealData, 5000) // Fetch every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const handleConnectNewDevice = () => {
    // In a real application, this would trigger the device connection process
    setIsNewDeviceConnected(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            LabNose
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/about">
                  <Button variant="ghost">About</Button>
                </Link>
              </li>
              <li>
                <Link href="/analysis">
                  <Button variant="ghost">Analysis</Button>
                </Link>
              </li>
              <li>
                <Link href="/profile">
                  <Button variant="ghost">Profile</Button>
                </Link>
              </li>
              <li>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">LabNose Analysis</h1>
        <Tabs defaultValue="main-device" className="space-y-4">
          <TabsList>
            <TabsTrigger value="main-device">Main Device</TabsTrigger>
            <TabsTrigger value="new-device">Connect New Device</TabsTrigger>
          </TabsList>
          <TabsContent value="main-device">
            <div className="space-y-4">
              <ChartContainer
                data={sensorData}
                config={{
                  voc: {
                    label: "VOC (ppm)",
                    color: "hsl(var(--chart-1))",
                  },
                  temperature: {
                    label: "Temperature (°C)",
                    color: "hsl(var(--chart-2))",
                  },
                  humidity: {
                    label: "Humidity (%)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="w-full"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Current VOC Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{currentReadings.voc.toFixed(2)} ppm</p>
                    <p className={`text-lg font-semibold ${currentReadings.voc < 3 ? 'text-green-500' : currentReadings.voc < 7 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {currentReadings.voc < 3 ? 'Good' : currentReadings.voc < 7 ? 'Moderate' : 'Poor'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Current Temperature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{currentReadings.temperature.toFixed(1)}°C</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Current Humidity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{currentReadings.humidity.toFixed(1)}%</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="new-device">
            <Card>
              <CardHeader>
                <CardTitle>Connect a New Device</CardTitle>
                <CardDescription>Add a new LabNose device to your network</CardDescription>
              </CardHeader>
              <CardContent>
                {isNewDeviceConnected ? (
                  <div className="text-center">
                    <p className="text-xl mb-4">New device successfully connected!</p>
                    <Button onClick={() => setIsNewDeviceConnected(false)}>Connect Another Device</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p>Follow these steps to connect a new LabNose device:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Power on your new LabNose device</li>
                      <li>Press and hold the connect button for 5 seconds</li>
                      <li>Wait for the LED to start blinking</li>
                      <li>Click the "Connect New Device" button below</li>
                    </ol>
                    <Button onClick={handleConnectNewDevice} className="w-full">Connect New Device</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          © {new Date().getFullYear()} LabNose. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
