"use client";
import { useRouter, usePathname } from "next/navigation"; // For routing
import langIcon from "@/public/assets/images/lang.svg";
import Image from "next/image";
import LangUseParams from "@/translate/LangUseParams"; // Your hook

const GlobeBtn = () => {
  const lang = LangUseParams(); // e.g., "en" or "ar"
  const router = useRouter();
  const pathname = usePathname(); // e.g., "/en/products" or "/ar/about"

  // Toggle between "en" and "ar" in the URL
  const toggleLanguage = () => {
    const newLang = lang === "en" ? "ar" : "en";
    const segments = pathname.split("/").filter(Boolean);

    // Replace first segment if it's a language code
    if (segments[0] === "en" || segments[0] === "ar") {
      segments[0] = newLang;
    } else {
      segments.unshift(newLang);
    }

    router.push("/" + segments.join("/"));
  };
  return (
    <div>
      <Image
        src={langIcon}
        alt="lang"
        width={30}
        height={30}
        className="cursor-pointer iconBar me-2"
        onClick={toggleLanguage}
      />
    </div>
  );
};

export default GlobeBtn;
