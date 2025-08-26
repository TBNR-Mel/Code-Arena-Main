import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <h1 className="text-xl font-semibold">C_Arena</h1>
        <Link href="/about" className="text-foreground hover:text-foreground/80 underline underline-offset-4">
          About
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-2xl space-y-8">
          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Strengthen your computational thinking skills.
          </h2>

          {/* Subtext */}
          <div className="space-y-2 text-lg text-muted-foreground">
            <p>Solve coding challenges.</p>
            <p>It's intuitive and super easy to navigate.</p>
          </div>

          {/* Rocket Illustration */}
          <div className="py-8">
            <div className="text-8xl">🚀</div>
          </div>

          {/* Get Started Button */}
          <div className="space-y-4">
            <Link href="/codearena/challenges">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium">
                Get Started
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">No email or password required.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
