"use client";

import AuthSkeletonShell, {
  AuthBar,
  AuthButtonBar,
} from "@/components/skeleton/AuthSkeletonShell";
import LangUseParams from "@/translate/LangUseParams";

const ResetPasswordSkeleton = () => {
  const lang = LangUseParams();

  return (
    <AuthSkeletonShell>
      <AuthBar className="mx-auto mb-6 h-7 w-56 md:h-8" />

      <div className="mx-auto w-[95%] p-4 md:w-[80%]">
        {[1, 2].map((index) => (
          <div key={index} className="mb-4">
            <AuthBar
              className={`mb-2 h-4 w-36 ${lang === "ar" ? "ml-auto" : ""}`}
            />
            <div className="relative">
              <AuthBar className="h-10 w-full rounded-md" />
              <AuthBar className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full" />
            </div>
          </div>
        ))}

        <AuthButtonBar />
      </div>
    </AuthSkeletonShell>
  );
};

export default ResetPasswordSkeleton;
