"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import GridLayout, { Layout, useContainerWidth } from "react-grid-layout";
import { formatCurrency } from "@/lib/format";
import AddCategoryModal from "@/app/app/atelier/AddCategoryModal";

const categoryTones = [
  {
    icon: "DI",
    badge: "bg-emerald-50 text-emerald-800",
    meter: "bg-emerald-700",
  },
  {
    icon: "HO",
    badge: "bg-sky-50 text-sky-800",
    meter: "bg-sky-700",
  },
  {
    icon: "GR",
    badge: "bg-amber-50 text-amber-800",
    meter: "bg-amber-700",
  },
];

const customOrderStorageKey = "atelier_category_custom_order";
const addCategoryLayoutId = "__add_category__";

type CategoryStat = {
  id: string;
  name: string;
  limit: number;
  spent: number;
  usage: number;
};

type Props = {
  categories: CategoryStat[];
  currency: string;
};

const getColumnCount = (width: number) => {
  if (width >= 1280) {
    return 3;
  }

  if (width >= 768) {
    return 2;
  }

  return 1;
};

const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((item, index) => item === b[index]);
};

const buildLayout = (categoryIds: string[], columns: number): Layout =>
  categoryIds.map((id, index) => ({
    i: id,
    x: index % columns,
    y: Math.floor(index / columns),
    w: 1,
    h: 1,
    static: false,
  }));

const reorderFromLayout = (layout: Layout) =>
  [...layout]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((item) => item.i);

const resolveOrder = (categoryIds: string[], savedOrder: string[]) => {
  const uniqueSavedIds = [...new Set(savedOrder)];
  const validSavedIds = uniqueSavedIds.filter((id) => categoryIds.includes(id));
  const missingIds = categoryIds.filter((id) => !validSavedIds.includes(id));
  return [...validSavedIds, ...missingIds];
};

function CategoryCard({
  category,
  tone,
  currency,
  draggable,
}: {
  category: CategoryStat;
  tone: (typeof categoryTones)[number];
  currency: string;
  draggable: boolean;
}) {
  const usedPercent = Math.round(category.usage * 100);
  const atLimit = category.limit > 0 && category.spent >= category.limit;
  const usedBadgeClass = atLimit ? "bg-[#ffe9e4] text-[#a73b21]" : "bg-[#eef7ff] text-[#49636f]";
  const meterClass = atLimit ? "bg-[#a73b21]" : tone.meter;

  return (
    <article className="flex h-full flex-col justify-between rounded-3xl bg-white p-6 shadow-[0_16px_38px_-14px_rgba(27,54,65,0.16)]">
      <div>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`grid h-12 w-12 place-items-center rounded-2xl text-sm font-bold ${tone.badge}`}>
              {tone.icon}
            </div>
            <div>
              <h3 className="font-[var(--font-manrope)] text-lg font-bold text-[#1b3641]">{category.name}</h3>
              <p className="text-xs text-[#6f8793]">Monthly Limit</p>
            </div>
          </div>

          {draggable ? (
            <button
              type="button"
              className="category-drag-handle cursor-grab rounded-lg bg-[#eef7ff] px-2 py-1 text-[#49636f] active:cursor-grabbing"
              aria-label={`Drag ${category.name}`}
              title="Drag to reorder"
            >
              <span className="material-symbols-outlined text-base">drag_indicator</span>
            </button>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <p className="font-[var(--font-manrope)] text-2xl font-extrabold text-[#1b3641]">
              {formatCurrency(category.limit, currency)}
            </p>
            <span className={`rounded-md px-2 py-1 text-xs font-bold ${usedBadgeClass}`}>{usedPercent}% Used</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#e4f1fa]">
            <div className={`h-full rounded-full ${meterClass}`} style={{ width: `${usedPercent}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-[#8aa2b0]">
            <span>Spent: {formatCurrency(category.spent, currency)}</span>
            <span className={atLimit ? "text-[#a73b21]" : "text-[#49636f]"}>
              {atLimit ? "Fully Allocated" : "Healthy"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CategoryAtelierGrid({ categories, currency }: Props) {
  const { width, mounted, containerRef } = useContainerWidth({ initialWidth: 1200 });
  const [orderedCategoryIds, setOrderedCategoryIds] = useState<string[]>(
    categories.map((category) => category.id),
  );

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const categoryIds = categories.map((category) => category.id);
      const savedRaw = window.localStorage.getItem(customOrderStorageKey);

      let nextOrder = categoryIds;

      if (savedRaw) {
        try {
          const savedIds = JSON.parse(savedRaw);
          if (Array.isArray(savedIds)) {
            nextOrder = resolveOrder(categoryIds, savedIds.map((value) => String(value)));
          }
        } catch {
          nextOrder = categoryIds;
        }
      }

      setOrderedCategoryIds((prev) => (arraysEqual(prev, nextOrder) ? prev : nextOrder));
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [categories]);

  const columns = getColumnCount(width);

  const normalizedCategoryIds = useMemo(() => {
    const categoryIds = categories.map((category) => category.id);
    return resolveOrder(categoryIds, orderedCategoryIds);
  }, [categories, orderedCategoryIds]);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const customOrderCategories = useMemo(
    () => normalizedCategoryIds.map((id) => categoryById.get(id)).filter((category): category is CategoryStat => Boolean(category)),
    [categoryById, normalizedCategoryIds],
  );

  const displayIds = useMemo(
    () => [...normalizedCategoryIds, addCategoryLayoutId],
    [normalizedCategoryIds],
  );

  const layout = useMemo(() => buildLayout(displayIds, columns), [displayIds, columns]);
  const currentOrderSignature = useMemo(() => normalizedCategoryIds.join("|"), [normalizedCategoryIds]);

  const onLayoutChange = useCallback((nextLayout: Layout) => {
    const categoryIds = categories.map((category) => category.id);
    const nextOrderRaw = reorderFromLayout(nextLayout).filter((id) => id !== addCategoryLayoutId);
    const nextOrder = resolveOrder(categoryIds, nextOrderRaw);
    const signature = nextOrder.join("|");

    if (signature === currentOrderSignature || arraysEqual(nextOrder, orderedCategoryIds)) {
      return;
    }

    window.localStorage.setItem(customOrderStorageKey, JSON.stringify(nextOrder));
    setOrderedCategoryIds(nextOrder);
  }, [categories, currentOrderSignature, orderedCategoryIds]);

  return (
    <div ref={containerRef} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">Category Atelier</h2>
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f8793]">
        Drag cards by the handle to save your custom order.
      </p>

      {mounted ? (
        <GridLayout
          className="relative"
          width={width}
          layout={layout}
          gridConfig={{
            cols: columns,
            rowHeight: 212,
            margin: [20, 20],
            containerPadding: [0, 0],
            maxRows: Infinity,
          }}
          dragConfig={{
            enabled: true,
            bounded: true,
            handle: ".category-drag-handle",
          }}
          resizeConfig={{ enabled: false, handles: ["se"] }}
          onLayoutChange={onLayoutChange}
        >
          {displayIds.map((id, index) => {
            if (id === addCategoryLayoutId) {
              return (
                <div key={addCategoryLayoutId} className="h-full">
                  <AddCategoryModal currency={currency} />
                </div>
              );
            }

            const category = categoryById.get(id);
            if (!category) {
              return null;
            }

            const tone = categoryTones[index % categoryTones.length];

            return (
              <div key={category.id} className="h-full">
                <CategoryCard category={category} tone={tone} currency={currency} draggable />
              </div>
            );
          })}
        </GridLayout>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {customOrderCategories.map((category, index) => {
            const tone = categoryTones[index % categoryTones.length];

            return (
              <CategoryCard
                key={category.id}
                category={category}
                tone={tone}
                currency={currency}
                draggable={false}
              />
            );
          })}
          <AddCategoryModal currency={currency} />
        </div>
      )}
    </div>
  );
}
