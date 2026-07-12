import { Skeleton } from "@/components/ui/skeleton";

/** Matches GlobeBtn size in the navbar */
export function NavbarGlobeSkeleton() {
  return <Skeleton className="me-2 h-[30px] w-[30px] shrink-0 rounded-full" />;
}

/** Matches UserDropdown trigger (avatar + name/email on md+) */
export function NavbarUserSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-lg p-1">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="hidden md:flex flex-col items-start gap-1.5">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-4 w-4 shrink-0 rounded" />
    </div>
  );
}

/** Full navbar actions row (globe + user) while lang/session hydrate */
export default function NavbarSkeleton() {
  return (
    <div
      className="flex items-center gap-4"
      aria-hidden="true"
      aria-busy="true"
    >
      <NavbarGlobeSkeleton />
      <NavbarUserSkeleton />
    </div>
  );
}
