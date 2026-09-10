/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import {
  Settings,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import SidebarSkeleton from "@/components/skeleton/SidebarSkeleton";
import {
  mainLinks,
  settingsLinks,
  isNavHrefActive,
  isGroupActive,
  type SidebarGroupItem,
  type SidebarLinkItem,
  type SettingsLinkItem,
} from "./sidebarLinks";
import Image from "next/image";
import logo from "@/public/assets/images/logo.svg";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { cn } from "@/lib/utils";
import { getAccent, sidebarAccents } from "@/constants/navAccents";

const SideBar = () => {
  const lang = LangUseParams() as string;
  const translate = TranslateHook();
  const pathname = usePathname();

  const [openSettings, setOpenSettings] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const { hasModuleAccess, canAccessHref, isReady } = useUserPermissions();

  const canShowLink = (item: {
    always?: boolean;
    module?: string;
    href: string;
  }) => {
    if (item.always) return true;
    if (item.module) return hasModuleAccess(item.module);
    return canAccessHref(item.href, lang);
  };

  const visibleMainLinks = mainLinks(lang).filter((item) => {
    if (item.kind === "link") {
      return canShowLink(item);
    }
    return item.module ? hasModuleAccess(item.module) : true;
  });

  const visibleSettingsLinks = settingsLinks(lang).filter((link) =>
    canShowLink(link),
  );

  const isActive = (href: string) => isNavHrefActive(pathname, href, lang);

  const isSettingsActive = () => {
    return settingsLinks(lang).some((link) => isActive(link.href));
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (isSettingsActive()) {
      setOpenSettings(true);
    }

    const next: Record<string, boolean> = {};
    for (const item of visibleMainLinks) {
      if (item.kind === "group" && isGroupActive(pathname, item, lang)) {
        next[item.key] = true;
      }
    }
    if (Object.keys(next).length) {
      setOpenGroups((prev) => ({ ...prev, ...next }));
    }
  }, [pathname, lang]);

  const IconChip = ({
    icon: Icon,
    accentKey,
    size = 18,
    compact = false,
  }: {
    icon: LucideIcon;
    accentKey: string;
    size?: number;
    compact?: boolean;
    active?: boolean;
  }) => {
    const tone = getAccent(sidebarAccents[accentKey] ?? "gold");
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg ring-1 ring-black/5 transition",
          compact ? "h-7 w-7" : "h-8 w-8",
          tone.chip,
        )}
      >
        <Icon size={size} strokeWidth={2} />
      </span>
    );
  };

  const linkClass = (active: boolean) =>
    cn(
      "group flex items-center justify-center md:justify-start",
      "gap-0 md:gap-2.5 px-2.5 py-2 rounded-2xl font-semibold transition-all duration-300",
      active
        ? "sidebarActiveLink"
        : "scoundColor hover:bg-white/60 hover:shadow-sm hover:shadow-slate-400/10 rounded-2xl",
    );

  const groupButtonClass = (active: boolean) =>
    cn(
      "w-full flex items-center justify-center md:justify-between",
      "px-2.5 py-2 rounded-2xl text-sm transition-all duration-300 font-bold",
      active
        ? "sidebarActiveLink"
        : "text-gray-600 hover:bg-white/60 hover:shadow-sm hover:shadow-slate-400/10",
    );

  const renderGroup = (group: SidebarGroupItem) => {
    const groupActive = isGroupActive(pathname, group, lang);
    const open = Boolean(openGroups[group.key]);

    return (
      <li key={group.key}>
        <button
          type="button"
          onClick={() => toggleGroup(group.key)}
          className={groupButtonClass(groupActive)}
        >
          <span className="flex items-center gap-2">
            <IconChip icon={group.icon} accentKey={group.key} />
            <span className="hidden md:inline">
              {translate.sidebar[group.key]}
            </span>
          </span>

          <ChevronDown
            size={16}
            className={cn(
              "hidden md:inline transition-transform",
              groupActive ? "opacity-80" : "text-slate-500",
              open && "rotate-180",
            )}
          />
        </button>

        <div
          className={cn(
            "md:ms-6 mt-1 ms-3 space-y-1 overflow-hidden transition-all duration-300",
            open ? "opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {group.children.map((child) => {
            const childActive = isActive(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(linkClass(childActive), "text-[15px]")}
              >
                <IconChip
                  icon={child.icon}
                  accentKey={child.key}
                  size={14}
                  compact
                />
                <span className="hidden md:inline">
                  {translate.sidebar[child.key]}
                </span>
              </Link>
            );
          })}
        </div>
      </li>
    );
  };

  if (!lang || !translate) return <SidebarSkeleton />;
  if (!isReady) return <SidebarSkeleton />;

  return (
    <aside
      className="
        fixed inset-y-0 inset-s-0 z-40
        h-screen w-14 md:w-60
        asideBg border-e flex flex-col
        overflow-y-auto overflow-x-hidden
      "
    >
      <div className="p-4 font-bold text-lg mainColor flex justify-center md:justify-start">
        <div className="mb-4 flex w-full max-w-full justify-center md:justify-start">
          <Image
            src={logo}
            alt="logo"
            width={300}
            height={60}
            className="h-auto w-full max-w-75 object-contain"
            priority
          />
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1.5 p-2">
          {visibleMainLinks.map((item) => {
            if (item.kind === "group") {
              return renderGroup(item);
            }

            const linkItem = item as SidebarLinkItem;

            return (
              <li key={linkItem.href}>
                <Link
                  href={linkItem.href}
                  className={linkClass(isActive(linkItem.href))}
                >
                  <IconChip icon={linkItem.icon} accentKey={linkItem.key} />
                  <span className="hidden md:inline">
                    {translate.sidebar[linkItem.key]}
                  </span>
                </Link>
              </li>
            );
          })}

          {visibleSettingsLinks.length > 0 && (
            <li>
              <button
                type="button"
                onClick={() => setOpenSettings(!openSettings)}
                className={groupButtonClass(isSettingsActive())}
              >
                <span className="flex items-center gap-2">
                  <IconChip icon={Settings} accentKey="settings" />
                  <span className="hidden md:inline">
                    {translate.sidebar.settings}
                  </span>
                </span>

                <ChevronDown
                  size={16}
                  className={cn(
                    "hidden md:inline transition-transform",
                    isSettingsActive() ? "opacity-80" : "text-slate-500",
                    openSettings && "rotate-180",
                  )}
                />
              </button>

              <div
                className={cn(
                  "md:ms-6 mt-1 ms-3 space-y-1 overflow-hidden transition-all duration-300",
                  openSettings ? "opacity-100" : "max-h-0 opacity-0",
                )}
              >
                {visibleSettingsLinks.map((link: SettingsLinkItem) => {
                  const linkActive = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(linkClass(linkActive), "text-[15px]")}
                    >
                      <IconChip
                        icon={link.icon}
                        accentKey={link.key}
                        size={14}
                        compact
                      />
                      <span className="hidden md:inline">
                        {translate.sidebar[link.key]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;
