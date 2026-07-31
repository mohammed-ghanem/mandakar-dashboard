/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import {
  Settings,
  ChevronDown,
  ShieldCheck,
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
} from "./sidebarLinks";
import Image from "next/image";
import logo from "@/public/assets/images/logo.svg";

const SideBar = () => {
  const lang = LangUseParams() as string;
  const translate = TranslateHook();
  const pathname = usePathname();

  const [openSettings, setOpenSettings] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

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
    for (const item of mainLinks(lang)) {
      if (item.kind === "group" && isGroupActive(pathname, item, lang)) {
        next[item.key] = true;
      }
    }
    if (Object.keys(next).length) {
      setOpenGroups((prev) => ({ ...prev, ...next }));
    }
  }, [pathname, lang]);

  const linkClass = (active: boolean) =>
    `group flex items-center justify-center md:justify-start
     gap-0 md:gap-2 p-2 rounded font-semibold transition
     ${
       active
         ? "activeLink text-white hover-mainColor rounded-e-4xl "
         : "scoundColor hover-mainColor rounded-l-4xl "
     }`;

  const groupButtonClass = (active: boolean) =>
    `w-full flex items-center justify-center md:justify-between
     p-2 rounded-md text-sm transition font-bold
     ${
       active
         ? "activeLink hover-mainColor"
         : "text-gray-600 hover:bg-gray-100"
     }`;

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
            <group.icon size={18} />
            <span className="hidden md:inline">
              {translate.sidebar[group.key]}
            </span>
          </span>

          <ChevronDown
            size={16}
            className={`hidden md:inline transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`md:ms-6 mt-1 ms-3 space-y-1 overflow-hidden transition-all duration-300 
          ${open ? "opacity-100" : "max-h-0 opacity-0"}`}
        >
          {group.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`${linkClass(isActive(child.href))} text-[16px]`}
            >
              <child.icon size={16} />
              <span className="hidden md:inline">
                {translate.sidebar[child.key]}
              </span>
            </Link>
          ))}
        </div>
      </li>
    );
  };

  if (!lang || !translate) return <SidebarSkeleton />;

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
        <ul className="space-y-1 p-2">
          {mainLinks(lang).map((item) => {
            if (item.kind === "group") {
              return renderGroup(item);
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={linkClass(isActive(item.href))}
                >
                  <item.icon size={18} />
                  <span className="hidden md:inline">
                    {translate.sidebar[item.key]}
                  </span>
                </Link>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              onClick={() => setOpenSettings(!openSettings)}
              className={groupButtonClass(isSettingsActive())}
            >
              <span className="flex items-center gap-2">
                <Settings size={18} />
                <span className="hidden md:inline">
                  {translate.sidebar.settings}
                </span>
              </span>

              <ChevronDown
                size={16}
                className={`hidden md:inline transition-transform ${
                  openSettings ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`md:ms-6 mt-1 ms-3 space-y-1 overflow-hidden transition-all duration-300 
              ${openSettings ? " opacity-100" : "max-h-0 opacity-0"}`}
            >
              {settingsLinks(lang).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${linkClass(isActive(link.href))} text-[16px]`}
                >
                  <ShieldCheck size={16} />
                  <span className="hidden md:inline">
                    {translate.sidebar[link.key]}
                  </span>
                </Link>
              ))}
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;
