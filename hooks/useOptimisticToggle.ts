import { useState } from "react";

/**
 * Optimistic status toggle (Sorooj Academy pattern).
 * - Instant UI flip
 * - Reverts on failure
 * - Silent (no toast) — caller should not show notifications
 */
export function useOptimisticToggle<T>({
  getId,
  getStatus,
  onToggle,
}: {
  getId: (item: T) => number;
  getStatus: (item: T) => boolean;
  onToggle: (item: T, next: boolean) => Promise<void>;
}) {
  const [optimisticMap, setOptimisticMap] = useState<Record<number, boolean>>(
    {},
  );
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const getOptimisticStatus = (item: T) =>
    optimisticMap[getId(item)] ?? getStatus(item);

  const clearOptimistic = (id: number) => {
    setOptimisticMap((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const toggle = async (item: T, next: boolean) => {
    const id = getId(item);

    if (pendingIds.has(id)) return;

    // Ignore duplicate Switch events
    if (getOptimisticStatus(item) === next) return;

    setOptimisticMap((p) => ({ ...p, [id]: next }));
    setPendingIds((p) => new Set(p).add(id));

    try {
      await onToggle(item, next);
      // Success: drop override — RTK cache is source of truth
      clearOptimistic(id);
    } catch {
      // Failure: drop override — cache undo restores real value
      clearOptimistic(id);
    } finally {
      setPendingIds((p) => {
        const s = new Set(p);
        s.delete(id);
        return s;
      });
    }
  };

  return {
    getOptimisticStatus,
    toggle,
    isPending: (item: T) => pendingIds.has(getId(item)),
  };
}
