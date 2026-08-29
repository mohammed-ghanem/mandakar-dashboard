"use client";

import AuthSkeletonShell, {
  AuthBar,
  AuthButtonBar,
} from "@/components/skeleton/AuthSkeletonShell";
import LangUseParams from "@/translate/LangUseParams";

const CODE_LENGTH = 4;

const VerifyCodeSkeleton = () => {
  const lang = LangUseParams();

  return (
    <AuthSkeletonShell>
      <AuthBar className="mx-auto mb-6 h-7 w-56 md:h-8" />

      <div className="mx-auto w-[95%] p-4 md:w-[80%]">
        <div className="mb-6">
          <AuthBar
            className={`mb-3 h-4 w-28 ${lang === "ar" ? "ml-auto" : ""}`}
          />
          <AuthBar className="h-12 w-full rounded-md" />
        </div>

        <div className="mb-6">
          <AuthBar
            className={`mb-3 h-4 w-24 ${lang === "ar" ? "ml-auto" : ""}`}
          />
          <div className="flex justify-center gap-3">
            {Array.from({ length: CODE_LENGTH }).map((_, index) => (
              <AuthBar key={index} className="h-14 w-14 rounded-md" />
            ))}
          </div>
        </div>

        <AuthButtonBar />
        <AuthBar className="mx-auto mt-5 h-4 w-32" />
      </div>
    </AuthSkeletonShell>
  );
};

export default VerifyCodeSkeleton;
