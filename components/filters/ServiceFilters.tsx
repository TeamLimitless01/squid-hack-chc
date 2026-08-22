"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ServiceFilters({
  initialDistance,
  initialSort,
  categoryId
}: {
  initialDistance: number,
  initialSort: string,
  categoryId?: string
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const distance = formData.get("distance") as string;
    const sort = formData.get("sort") as string;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("distance", distance);
    params.set("sort", sort);
    
    // Perform a soft navigation to preserve state and avoid hard refresh
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearCategory = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-5 w-full items-end">
      {categoryId && <input type="hidden" name="category" value={categoryId} />}
      
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Max Distance</label>
        <select name="distance" defaultValue={initialDistance.toString()} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors">
          <option value="2">2 km Radius</option>
          <option value="5">5 km Radius</option>
          <option value="10">10 km Radius</option>
          <option value="25">25 km Radius</option>
        </select>
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Sort By</label>
        <select name="sort" defaultValue={initialSort} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors">
          <option value="distance">Closest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div className="flex items-end gap-3">
        <button type="submit" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform">
          Apply Filters
        </button>
        
        {categoryId && (
          <button type="button" onClick={clearCategory} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors active:scale-95 transition-transform">
            Clear Category
          </button>
        )}
      </div>
    </form>
  );
}
