"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, CheckCircle } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"

export default function SubmitChallengePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [tags, setTags] = useState<string[]>(["algorithms", "data-structures", "beginner-friendly"])
  const [newTag, setNewTag] = useState("")

  const initialFormData = {
    title: "Two Sum Problem",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    language: "javascript",
    difficulty: "easy",
    concept: "Arrays, Hash Maps, Two Pointers",
    starter_code: `function twoSum(nums, target) {\n    // Your code here\n    // Return an array of two indices\n}`,
    solution: `function twoSum(nums, target) {\n    const numMap = new Map();\n    \n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        \n        if (numMap.has(complement)) {\n            return [numMap.get(complement), i];\n        }\n        \n        numMap.set(nums[i], i);\n    }\n    \n    return [];\n}`,
    test_cases: `Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n\nInput: nums = [3,3], target = 6\nOutput: [0,1]`,
    hints:
      "Try using a hash map to store numbers you've seen and their indices. For each number, check if its complement (target - current number) exists in the hash map.",
    resources:
      "https://leetcode.com/problems/two-sum/\nhttps://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
  }

  const [formData, setFormData] = useState(initialFormData)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("[v0] Starting challenge submission...")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to submit a challenge",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] User authenticated, preparing challenge data...")

      const challengeData = {
        ...formData,
        tags: tags.join(","),
        status: "pending",
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
      }

      console.log("[v0] Submitting challenge data:", challengeData)

      const { error } = await supabase.from("challenges").insert([challengeData])

      if (error) {
        console.error("[v0] Database error:", error)
        throw error
      }

      console.log("[v0] Challenge submitted successfully!")

      setIsSubmitted(true)
      toast({
        title: "Challenge Submitted Successfully!",
        description: "Your challenge has been submitted for review. It will be added to the app once approved.",
      })

      setTimeout(() => {
        setFormData(initialFormData)
        setTags(["algorithms", "data-structures", "beginner-friendly"])
        setIsSubmitted(false)
        router.push("/codearena/challenges")
      }, 3000)
    } catch (error) {
      console.error("[v0] Error submitting challenge:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit challenge. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Challenge Submitted!</h2>
              <p className="text-slate-300">
                Your challenge has been submitted for review. It will be added to the app once approved.
              </p>
              <p className="text-sm text-slate-400">Redirecting you back to challenges...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Submit a Challenge</CardTitle>
            <CardDescription className="text-slate-300">
              Share your coding challenge with the community. All submissions will be reviewed before being added to the
              app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Challenge Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Two Sum Problem"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concept" className="text-white">
                    Concept
                  </Label>
                  <Input
                    id="concept"
                    value={formData.concept}
                    onChange={(e) => handleInputChange("concept", e.target.value)}
                    placeholder="e.g., Arrays, Loops, Functions"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-white">
                    Programming Language
                  </Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-white">
                    Difficulty
                  </Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very easy">Very Easy</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the challenge, what the user needs to accomplish..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starter_code" className="text-white">
                  Starter Code
                </Label>
                <Textarea
                  id="starter_code"
                  value={formData.starter_code}
                  onChange={(e) => handleInputChange("starter_code", e.target.value)}
                  placeholder="Provide the initial code template..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[120px] font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution" className="text-white">
                  Solution
                </Label>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) => handleInputChange("solution", e.target.value)}
                  placeholder="Provide the complete solution..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[120px] font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test_cases" className="text-white">
                  Test Cases
                </Label>
                <Textarea
                  id="test_cases"
                  value={formData.test_cases}
                  onChange={(e) => handleInputChange("test_cases", e.target.value)}
                  placeholder="Provide test cases (input/output examples)..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-purple-600 text-white">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-300">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    className="bg-slate-700 border-slate-600 text-white"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hints" className="text-white">
                    Hints (Optional)
                  </Label>
                  <Textarea
                    id="hints"
                    value={formData.hints}
                    onChange={(e) => handleInputChange("hints", e.target.value)}
                    placeholder="Provide helpful hints..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resources" className="text-white">
                    Resources (Optional)
                  </Label>
                  <Textarea
                    id="resources"
                    value={formData.resources}
                    onChange={(e) => handleInputChange("resources", e.target.value)}
                    placeholder="Links to helpful resources..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {isSubmitting ? "Submitting..." : "Submit Challenge"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
