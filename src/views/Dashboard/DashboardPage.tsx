import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Calendar } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sessions</CardDescription>
            <CardTitle className="text-2xl">24k</CardTitle>
            <span className="text-green-500 text-xs">+33.45%</span>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Sessions</CardDescription>
            <CardTitle className="text-2xl">00:18</CardTitle>
            <span className="text-red-500 text-xs">-10.35%</span>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bounce Rate</CardDescription>
            <CardTitle className="text-2xl">$2400</CardTitle>
            <span className="text-green-500 text-xs">+22.5%</span>
          </CardHeader>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Growth</CardTitle>
          <CardDescription>Overall information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-end justify-between">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-purple-500 w-6 rounded-t-md"
                style={{
                  height: `${Math.random() * 100 + 50}px`,
                  opacity: i % 2 === 0 ? 1 : 0.7,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-md mr-3">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Task {i + 1}</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <Progress value={75} className="h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Task Progress</span>
                  <span className="text-sm font-medium">38%</span>
                </div>
                <Progress value={38} className="h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
