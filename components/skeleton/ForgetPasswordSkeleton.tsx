"use client";

import AuthSkeletonShell, {
  AuthBar,
  AuthButtonBar,
} from "@/components/skeleton/AuthSkeletonShell";
import LangUseParams from "@/translate/LangUseParams";

const ForgetPasswordSkeleton = () => {
  const lang = LangUseParams();

  return (
    <AuthSkeletonShell>
      <AuthBar className="mx-auto mb-6 h-7 w-48 md:h-8" />

      <div className="relative mx-auto w-[95%] p-4 md:w-[80%]">
        <div className="mb-4">
          <AuthBar
            className={`mb-2 h-4 w-24 ${lang === "ar" ? "ml-auto" : ""}`}
          />
          <div className="relative">
            <AuthBar className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full" />
            <AuthBar className="h-10 w-full rounded-md" />
          </div>
        </div>

        <AuthButtonBar />
      </div>
    </AuthSkeletonShell>
  );
};

export default ForgetPasswordSkeleton;
