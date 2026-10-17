"use client";

import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ownerSetupApi } from "@/lib/owner-setup";
import { apiError } from "@/lib/owner-overview";

export function AuthSessionGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?error=session_required&callbackUrl=${callbackUrl}`);
    }
  }, [pathname, router, status]);

  if (status !== "authenticated") {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#050d1a] text-gray-300">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading session...
        </div>
      </div>
    );
  }

  return <BusinessOrganizationGate>{children}</BusinessOrganizationGate>;
}

function BusinessOrganizationGate({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const organization = useQuery({
    queryKey: ['owner-organization', session?.user?.email],
    queryFn: ownerSetupApi.initialize,
    enabled: session?.user?.role === 'business_owner',
    staleTime: Infinity,
    retry: 1,
  });
  // Onboarding must stay accessible so an owner without a registered business name can confirm one.
  if (session?.user?.role !== 'business_owner' || pathname === '/onboarding') return <>{children}</>;
  if (organization.isPending) return <div className="flex h-dvh items-center justify-center gap-3 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Preparing your business…</div>;
  if (organization.isError) return <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center"><h1 className="text-lg font-medium">Your business could not be loaded</h1><p className="text-sm text-gray-400">{apiError(organization.error)}</p><button className="nv-button" onClick={() => organization.refetch()}>Try again</button><Link href="/onboarding?step=3">Review business setup</Link></div>;
  if (organization.data.requiresIdentity) return <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center"><h1 className="text-xl font-medium">Set up your business</h1><p className="max-w-md text-sm text-gray-400">Confirm your business name to start managing your team, tasks and workflows.</p><Link className="nv-button" href="/onboarding?step=3">Confirm business details</Link></div>;
  return <>{children}</>;
}
