"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export function ProfileCompletion() {
  // This would be fetched from the API in a real application
  const completionPercentage = 65

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Progress value={completionPercentage} className="h-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {completionPercentage}% Complete
            </span>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Complete Profile
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}