"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Calendar } from "lucide-react"
import Link from "next/link"

export function UpcomingSessions() {
  // This would be fetched from the API in a real application
  const sessions = [
    {
      id: 1,
      type: "Program Consultation",
      date: "2024-03-20T10:00:00",
      status: "scheduled",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
        <Link href="/chat">
          <Button variant="outline" size="sm">
            <Video className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{session.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button size="sm">Join</Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming sessions
          </p>
        )}
      </CardContent>
    </Card>
  )
}