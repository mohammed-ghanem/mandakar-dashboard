"use client";

import LangUseParams from "@/translate/LangUseParams";
import GlobeBtn from "./GlobeBtn";
import UserDropdown from "./UserDropdown";
import NavbarSkeleton from "@/components/skeleton/NavbarSkeleton";

const Navbar = () => {
  const lang = LangUseParams();

  return (
    <nav className="top-0 z-20" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="ms-10 flex h-16 items-center justify-between md:ms-0">
          <div className="hidden md:block" />

          <div className="relative flex items-center gap-4 rtl:space-x-reverse">
            {!lang ? (
              <NavbarSkeleton />
            ) : (
              <>
                <GlobeBtn />
                <UserDropdown />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
