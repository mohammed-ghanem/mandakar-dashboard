"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import logo from "@/public/assets/images/logo.svg";
import loginIcon from "@/public/assets/images/loginIcon.svg";

export function AuthBar({ className }: { className?: string }) {
  return (
    <div className={cn("authSkeleton animate-pulse rounded-md", className)} />
  );
}

export function AuthButtonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "authSkeletonBtn mx-auto mt-8 h-12 w-[50%] animate-pulse rounded-lg",
        className,
      )}
    />
  );
}

export default function AuthSkeletonShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen font-cairo" dir="rtl">
      <div className="grid min-h-screen items-center gap-4 bgForm lg:grid-cols-2">
        <div className="my-10 h-screen md:h-auto" dir="ltr">
          <div className="mb-4 flex justify-center">
            <Image
              src={logo}
              alt="logo"
              width={220}
              height={86}
              className="h-auto w-full max-w-[220px] object-contain"
              priority
            />
          </div>
          {children}
        </div>

        <div className="relative hidden h-screen items-center justify-center lg:flex">
          <div className="h-[90%]">
            <Image src={loginIcon} alt="bg" width={300} height={300} />
          </div>
        </div>
      </div>
    </div>
  );
}
