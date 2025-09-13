"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, Check, X, Clock } from "lucide-react"
import type { Challenge } from "@/lib/supabase/database.types"

export default function AdminPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [pendingChallenges, setPendingChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "very easy" as Challenge["difficulty"],
    language: "javascript" as Challenge["language"],
    tags: "",
    concept: "",
    starter_code: "",
    solution: "",
  })

  useEffect(() => {
    fetchChallenges()
    fetchPendingChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/challenges")
      const data = await response.json()
      setChallenges(data)
    } catch (error) {
      console.error("Error fetching challenges:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingChallenges = async () => {
    try {
      const response = await fetch("/api/challenges?status=pending")
      const data = await response.json()
      setPendingChallenges(data)
    } catch (error) {
      console.error("Error fetching pending challenges:", error)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/challenges/${id}/approve`, {
        method: "PATCH",
      })

      if (response.ok) {
        await fetchChallenges()
        await fetchPendingChallenges()
      }
    } catch (error) {
      console.error("Error approving challenge:", error)
    }
  }

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this challenge?")) return

    try {
      const response = await fetch(`/api/challenges/${id}/reject`, {
        method: "PATCH",
      })

      if (response.ok) {
        await fetchPendingChallenges()
      }
    } catch (error) {
      console.error("Error rejecting challenge:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const challengeData = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(challengeData),
      })

      if (response.ok) {
        await fetchChallenges()
        setShowForm(false)
        setFormData({
          title: "",
          description: "",
          difficulty: "very easy",
          language: "javascript",
          tags: "",
          concept: "",
          starter_code: "",
          solution: "",
        })
      }
    } catch (error) {
      console.error("Error creating challenge:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return

    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchChallenges()
      }
    } catch (error) {
      console.error("Error deleting challenge:", error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Challenge Admin</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Challenge
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Challenge</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Concept</label>
                    <Input
                      value={formData.concept}
                      onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                      placeholder="e.g., Variables, Functions, Arrays"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value: Challenge["difficulty"]) =>
                        setFormData({ ...formData, difficulty: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very easy">Very Easy</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <Select
                      value={formData.language}
                      onValueChange={(value: Challenge["language"]) => setFormData({ ...formData, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="c++">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="arrays, maths, logic"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Starter Code (optional)</label>
                  <Textarea
                    value={formData.starter_code}
                    onChange={(e) => setFormData({ ...formData, starter_code: e.target.value })}
                    placeholder="function solution() { ... }"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Solution (optional)</label>
                  <Textarea
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    placeholder="Complete solution code"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Create Challenge</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="approved" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="approved">Approved Challenges ({challenges.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval ({pendingChallenges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="approved">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(challenge.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary">{challenge.difficulty}</Badge>
                      <Badge variant="outline">{challenge.language}</Badge>
                      {challenge.concept && <Badge variant="default">{challenge.concept}</Badge>}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {challenge.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingChallenges.map((challenge) => (
                <Card key={challenge.id} className="border-yellow-200 bg-yellow-50/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        {challenge.title}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(challenge.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(challenge.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary">{challenge.difficulty}</Badge>
                      <Badge variant="outline">{challenge.language}</Badge>
                      {challenge.concept && <Badge variant="default">{challenge.concept}</Badge>}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {challenge.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {challenge.submitted_at && (
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(challenge.submitted_at).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
