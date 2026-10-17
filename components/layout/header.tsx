"use client";

import { ChevronDown, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMobileNav } from "@/components/layout/mobile-nav-context";
import { NotificationBell } from "@/components/notification-bell";
import { SearchDialog } from "@/components/owner/search-dialog";
import { userApi } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { useDashboardI18n } from "@/lib/dashboard-i18n";

type HeaderProps = { title: string; subtitle?: string; action?: React.ReactNode };
export function Header({ title, subtitle, action }: HeaderProps) {
  const { data: session } = useSession();
  const { setIsOpen } = useMobileNav();
  const { t } = useDashboardI18n();
  const profile = useQuery({ queryKey: ["user-profile"], queryFn: () => userApi.getProfile().then(r => r.data.data), staleTime: 300_000 });
  const name = profile.data?.name || session?.user?.name || "Business Owner";
  const image = profile.data?.profileImage?.url || session?.user?.profileImage?.url;
  return <header className="nv-header">
    <button type="button" onClick={() => setIsOpen(true)} className="nv-menu-trigger nv-icon-button" aria-label="Open menu"><Menu size={20} /></button>
    <div className="nv-header-title"><h2>{t(title)}</h2>{subtitle && <p>{t(subtitle)}</p>}</div>
    {action && <div className="nv-header-action">{action}</div>}
    <div className="nv-header-controls"><SearchDialog /><NotificationBell /><DropdownMenu><DropdownMenuTrigger asChild><button className="nv-account-trigger" aria-label="Open account menu"><Avatar className="h-7 w-7">{image && <AvatarImage src={image} alt={name} />}<AvatarFallback className="text-[10px] bg-[#e7e8eb] text-[#16181c]">{getInitials(name)}</AvatarFallback></Avatar><span>{name.split(" ")[0]}</span><ChevronDown size={12} /></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="nv-account-menu"><DropdownMenuLabel><span>{name}</span><small>Business Owner</small></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/settings?scope=global&section=profile">{t("Profile")}</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/subscription">{t("Subscription")}</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/settings?scope=global&section=billing">{t("Billing")}</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/help-center">{t("Help Center")}</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/support">Support</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/onboarding">Business setup</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuLabel>Business tools</DropdownMenuLabel><DropdownMenuItem asChild><Link href="/accounting">{t("Accounting")}</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/services">{t("Services")}</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/kora-go">Kora Go</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-red-400" onClick={() => signOut({ callbackUrl: "/login" })}>{t("Logout")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
  </header>;
}
