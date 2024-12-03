"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, MapPin } from "lucide-react"
import Link from "next/link"

export function RecommendedPrograms() {
  // This would be fetched from the API in a real application
  const programs = [
    {
      id: 1,
      name: "Computer Science",
      university: "University of Technology",
      location: "United Kingdom",
      match: 95,
    },
    {
      id: 2,
      name: "Data Science",
      university: "Tech Institute",
      location: "Canada",
      match: 88,
    },
  ]

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recommended Programs</CardTitle>
        <Link href="/programs">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {programs.map((program) => (
            <div
              key={program.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{program.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {program.university}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {program.location}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{program.match}% Match</p>
                </div>
                <Button size="sm">Learn More</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}