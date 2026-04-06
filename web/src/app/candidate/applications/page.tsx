"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { applicationsAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Briefcase, Building2, ChevronRight, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await applicationsAPI.getCandidateApplications()
        setApplications(response.data?.applications || [])
      } catch (error) {
        console.error('Failed to load applications', error)
        setApplications([])
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [])

  return (
    <div className="min-h-screen bg-[#F0FDF4] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
            <p className="mt-1 text-sm text-slate-500">Track every job you have applied for in one place.</p>
          </div>
          <Link href="/candidate/jobs">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">Browse Jobs</Button>
          </Link>
        </div>

        <Card className="overflow-hidden border border-white/60 bg-white/85 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-20 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
                <Briefcase className="h-7 w-7 text-teal-500" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">No applications yet</h2>
              <p className="mt-2 text-sm text-slate-500">Once you apply for a job, it will show up here.</p>
            </div>
          ) : (
            <div className="divide-y divide-teal-50">
              {applications.map((app) => (
                <Link key={app.id} href={`/candidate/applications/${app.id}`} className="block p-6 transition hover:bg-teal-50/40">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">{app.jobs?.job_title || 'Unknown Role'}</h2>
                        <p className="text-sm text-slate-500">{app.jobs?.recruiter_profiles?.company_name || 'Unknown Company'}</p>
                        <p className="mt-1 text-xs text-slate-400">Applied {formatDate(app.applied_at || app.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {app.status || 'Applied'}
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
