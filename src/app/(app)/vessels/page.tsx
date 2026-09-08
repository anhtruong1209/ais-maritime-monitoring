import { VesselFilters } from "@/components/vessels/VesselFilters";
import { VesselTable } from "@/components/vessels/VesselTable";
import { Pagination } from "@/components/shared/Pagination";
import { getVessels } from "@/lib/data/vessels";
import { vesselListQuerySchema } from "@/lib/validation/vessel";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function VesselsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const query = vesselListQuerySchema.parse({
    ...rawParams,
    pageSize: rawParams.pageSize ?? String(DEFAULT_PAGE_SIZE),
  });

  const { data, page, pageSize, total } = await getVessels(query);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Vessels</h1>
        <p className="text-sm text-muted-foreground">{total} total</p>
      </div>

      <VesselFilters />
      <VesselTable vessels={data} />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/vessels"
        searchParams={rawParams}
      />
    </div>
  );
}
