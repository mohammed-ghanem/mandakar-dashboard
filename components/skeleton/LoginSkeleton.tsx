"use client";

import AuthSkeletonShell, {
  AuthBar,
  AuthButtonBar,
} from "@/components/skeleton/AuthSkeletonShell";

const LoginSkeleton = () => {
  return (
    <AuthSkeletonShell>
      <AuthBar className="mx-auto mb-8 h-8 w-52" />

      <div className="mx-auto w-[95%] p-4 md:w-[80%]">
        <div className="mb-4">
          <AuthBar className="mb-2 h-4 w-24" />
          <div className="relative">
            <AuthBar className="absolute inset-e-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full" />
            <AuthBar className="h-10 w-full rounded-md" />
          </div>
        </div>

        <div className="mb-4">
          <AuthBar className="mb-2 h-4 w-24" />
          <div className="relative">
            <AuthBar className="h-10 w-full rounded-md" />
            <AuthBar className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full" />
          </div>
        </div>

        <div className="mt-2 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AuthBar className="h-4 w-4 rounded-sm" />
            <AuthBar className="h-4 w-16" />
          </div>
          <AuthBar className="h-4 w-24" />
        </div>

        <AuthButtonBar />
      </div>
    </AuthSkeletonShell>
  );
};

export default LoginSkeleton;
