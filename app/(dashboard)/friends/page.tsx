import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function FriendsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Friends</h1>
        <p className="text-muted-foreground mt-2">
          Connect with others and share your lists
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Users className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Coming Soon</CardTitle>
          <CardDescription className="text-center">
            The friends feature is currently under development. Soon you'll be able to:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-center text-muted-foreground">
            <li>✨ Connect with other users</li>
            <li>✨ Share your lists with friends</li>
            <li>✨ See what your friends are recommending</li>
            <li>✨ Get personalized suggestions based on friends' preferences</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
