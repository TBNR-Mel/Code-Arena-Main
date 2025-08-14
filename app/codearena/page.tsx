import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="text-xl font-medium">C_Arena</div>
        <Link href="/about" className="text-foreground hover:text-muted-foreground underline underline-offset-4">
          About
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-12 text-center min-h-[calc(100vh-120px)]">
        <div className="max-w-sm space-y-12">
          {/* Main Heading and Subtext */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold leading-tight text-foreground">
              Strengthen your computational thinking skills.
            </h1>
            <div className="space-y-1 text-foreground">
              <p className="text-lg">Solve coding challenges.</p>
              <p className="text-lg">It's intuitive and super easy to navigate.</p>
            </div>
          </div>

          {/* Rocket Icon */}
          <div className="flex justify-center py-4">
            <div className="text-7xl">🚀</div>
          </div>

          {/* Get Started Section */}
          <div className="space-y-4">
            <Link href="/codearena/challenges" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-medium rounded-lg">
                Get Started
              </Button>
            </Link>
            <p className="text-muted-foreground">No email or password required.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
