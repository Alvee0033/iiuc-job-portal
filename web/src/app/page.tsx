import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Video,
} from "lucide-react";

const trustStats = [
  { label: "Hiring Teams", value: "4,200+" },
  { label: "Verified Candidates", value: "190K+" },
  { label: "Interview Sessions / Month", value: "52K" },
];

const platformPillars = [
  {
    title: "AI Skill Matching",
    description:
      "Rank candidates with transparent match scores across role requirements, portfolio, and interview quality.",
    icon: Sparkles,
  },
  {
    title: "Structured Interviews",
    description:
      "Run live and async interviews with guided scorecards so decisions are fast, fair, and repeatable.",
    icon: Video,
  },
  {
    title: "Talent CRM",
    description:
      "Track every candidate touchpoint, move pipelines cleanly, and keep recruiters aligned in one workspace.",
    icon: Users,
  },
  {
    title: "Enterprise Security",
    description:
      "Ship with role-based access, protected documents, and audit-ready workflows for modern hiring teams.",
    icon: ShieldCheck,
  },
];

const workflowSteps = [
  {
    title: "Define the role",
    detail:
      "Start from a reusable role template with required skills, interview stages, and success criteria.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Source and qualify",
    detail:
      "Collect applicants, auto-score profiles, and surface the strongest candidates with clear rationale.",
    icon: UserCheck,
  },
  {
    title: "Collaborate and decide",
    detail:
      "Interview panels share structured feedback in one place so hiring decisions are consistent and quick.",
    icon: MessageSquare,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f4f8f7] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-44 left-[-8rem] h-[32rem] w-[32rem] rounded-full bg-teal-300/25 blur-3xl" />
          <div className="absolute right-[-10rem] top-12 h-[28rem] w-[28rem] rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute bottom-[-10rem] left-1/3 h-[20rem] w-[20rem] rounded-full bg-cyan-300/15 blur-3xl" />
        </div>

        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 shadow-lg shadow-teal-600/25">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                SkillSync
              </span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
              <Link href="#features" className="transition-colors hover:text-teal-700">
                Features
              </Link>
              <Link href="#workflow" className="transition-colors hover:text-teal-700">
                Workflow
              </Link>
              <Link href="#proof" className="transition-colors hover:text-teal-700">
                Results
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup?role=recruiter"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Start Hiring
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
          <section>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-700 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Hiring Platform for Modern Teams
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Build Better Teams With Precision, Not Guesswork
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              SkillSync unifies sourcing, evaluation, interviews, and candidate
              communication so recruiters and hiring managers move from opening a
              role to signed offer with less noise.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/signup?role=recruiter"
                className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-teal-600/30 transition-all hover:-translate-y-0.5 hover:bg-teal-500"
              >
                Create Recruiter Workspace
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/auth/signup?role=candidate"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                Join as Candidate
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {trustStats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
                >
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="relative">
            <div className="absolute -left-7 top-8 hidden h-16 w-16 rounded-2xl bg-emerald-400/25 blur-xl md:block" />
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)] sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Talent Command Center
                  </p>
                  <p className="text-xl font-black text-slate-900">Hiring Snapshot</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Live
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>Senior Frontend Engineer</span>
                    <span className="text-teal-600">34 Qualified</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-[82%] rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <article className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Time to shortlist
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900">2.3 days</p>
                  </article>
                  <article className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Interview pass rate
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900">68%</p>
                  </article>
                </div>

                <article className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
                    Candidate update
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-teal-900">
                    Maya Rahman moved to final round after two panel interviews and
                    technical challenge review.
                  </p>
                </article>
              </div>
            </div>
          </section>
        </main>
      </div>

      <section id="features" className="border-y border-slate-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Everything Your Hiring Team Needs in One Place
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Replace fragmented tools with one integrated product that keeps data
              consistent and decisions accountable.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {platformPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className="group rounded-3xl border border-slate-200 bg-[#fcfdfd] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white transition-colors group-hover:bg-teal-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {pillar.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-[#0e1726] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
              Workflow
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              A Clear Path From Job Opening to Offer
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-teal-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-300">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-black">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {step.detail}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="proof" className="bg-[#f4f8f7] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                Recruiter Feedback
              </p>
              <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-800">
                “Our hiring squad reduced screening time by 47% in one quarter.
                SkillSync gave us confidence in every shortlist and every interview.”
              </p>
              <p className="mt-5 text-sm font-bold text-slate-900">
                Nabila Karim, Head of Talent
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
                Candidate Feedback
              </p>
              <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-800">
                “The process was fast and transparent. I knew exactly where I stood
                after each stage, and communication was excellent.”
              </p>
              <p className="mt-5 text-sm font-bold text-slate-900">
                Farhan Islam, Software Engineer
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-6 py-12 text-center shadow-sm sm:px-10">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Ready to Upgrade Your Hiring Stack?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              Bring recruiters, interviewers, and candidates into one workflow that
              is faster, cleaner, and built for scale.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/signup?role=recruiter"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-slate-800"
              >
                Start Free Trial
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
