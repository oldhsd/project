import { AuthForm } from '@/components/auth-form'; import Link from 'next/link';


export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md apple-panel p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#0071e3] text-white font-bold text-xs">
              BN
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
            Create Student Account
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Stream-agnostic learning, project proofs, and partner pathways.
          </p>
        </div>

        <AuthForm signup />
      </div>
    </main>
  );
}
