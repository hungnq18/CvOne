import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Your analytics overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Analytics content will go here</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Activity content will go here</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Settings content will go here</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
