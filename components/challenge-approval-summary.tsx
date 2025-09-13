import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Shield } from "lucide-react"

export function ChallengeApprovalSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Users className="w-5 h-5" />
            User Submissions
          </CardTitle>
          <CardDescription className="text-blue-600">Community-driven challenge creation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Users can submit their own challenges</li>
            <li>• Comprehensive submission form with validation</li>
            <li>• Automatic pending status assignment</li>
            <li>• Track submission history</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Clock className="w-5 h-5" />
            Approval Workflow
          </CardTitle>
          <CardDescription className="text-yellow-600">Quality control and moderation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                Pending
              </Badge>
              <span className="text-sm text-yellow-700">Awaiting review</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-200 text-green-800">
                Approved
              </Badge>
              <span className="text-sm text-yellow-700">Live on platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="bg-red-200 text-red-800">
                Rejected
              </Badge>
              <span className="text-sm text-yellow-700">Not published</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="w-5 h-5" />
            Admin Controls
          </CardTitle>
          <CardDescription className="text-green-600">Powerful moderation tools</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-green-700">
            <li>• Review pending submissions</li>
            <li>• One-click approve/reject actions</li>
            <li>• Separate tabs for organization</li>
            <li>• Track approval history</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
