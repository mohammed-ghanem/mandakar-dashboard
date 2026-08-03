"use client";

import { useMemo } from "react";
import { ArrowUpDown } from "lucide-react";

import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import IndexListPage from "@/components/shared/IndexListPage";
import SwapOrderList from "@/components/swapOrder/SwapOrderList";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useGetBannersQuery } from "@/store/banners/bannersApi";
import type { SwapOrderItem } from "@/types/swapOrder";

export default function BannersReorder() {
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const t = translate?.pages?.swapOrder;
  const bannersT = translate?.pages?.banners;
  const sessionReady = useSessionReady();

  const { data: banners = [], isLoading } = useGetBannersQuery(undefined, {
    skip: !sessionReady,
  });

  const items: SwapOrderItem[] = useMemo(() => {
    const hasOrder = banners.some((item) => (item.sort_order ?? 0) > 0);
    const sorted = hasOrder
      ? [...banners].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id,
        )
      : [...banners];

    return sorted.map((item) => ({
      id: item.id,
      label:
        item._title ||
        item.title?.[lang] ||
        item.title?.ar ||
        item.title?.en ||
        `#${item.id}`,
    }));
  }, [banners, lang]);

  return (
    <IndexListPage
      icon={ArrowUpDown}
      title={t?.title ?? ""}
      description={t?.description}
      createHref=""
      createLabel=""
      showCreate={false}
      showSkeleton={!sessionReady}
    >
      <div className="space-y-5 px-2 md:px-4">
        <p className="text-sm text-slate-600">
          {bannersT?.reorderHint ?? t?.itemsHint}
        </p>

        <SwapOrderList
          type="banners"
          items={items}
          isLoading={isLoading}
          emptyLabel={bannersT?.reorderEmpty ?? t?.emptyItems ?? ""}
          positionLabel={t?.position ?? ""}
          titleLabel={t?.itemTitle ?? ""}
          actionsLabel={t?.actions ?? ""}
          moveUpLabel={t?.moveUp ?? ""}
          moveDownLabel={t?.moveDown ?? ""}
          goToLabel={t?.goTo ?? ""}
        />
      </div>
    </IndexListPage>
  );
}
