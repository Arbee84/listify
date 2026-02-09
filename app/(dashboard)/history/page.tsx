import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { History } from 'lucide-react'

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground mt-2">
          Track your recommendations and list changes
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <History className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Coming Soon</CardTitle>
          <CardDescription className="text-center">
            The history feature is currently under development. Soon you'll be able to:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-center text-muted-foreground">
            <li>✨ View your recommendation search history</li>
            <li>✨ Track changes to your lists over time</li>
            <li>✨ See what you've discovered through recommendations</li>
            <li>✨ Analyze your preferences and trends</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
