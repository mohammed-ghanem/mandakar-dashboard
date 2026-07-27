"use client";

import TranslateHook from "@/translate/TranslateHook";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const translate = TranslateHook();
  return (
    <footer className="shrink-0 w-full border-t bg-white py-3 px-4 text-sm text-gray-500">
      <div
        className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2
             text-center"
      >
        <span>
          <Link href="https://wecandevmode.online/" target="_blank">
            {translate?.footer?.copyright}
          </Link>
           <span> © 2020 - {currentYear}</span>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
