import { VoyageFilters } from "@/components/voyages/VoyageFilters";
import { VoyageTable } from "@/components/voyages/VoyageTable";
import { Pagination } from "@/components/shared/Pagination";
import { T } from "@/components/shared/T";
import { getVoyages } from "@/lib/data/voyages";
import { voyageListQuerySchema } from "@/lib/validation/voyage";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function VoyagesPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const query = voyageListQuerySchema.parse({
    ...rawParams,
    pageSize: rawParams.pageSize ?? String(DEFAULT_PAGE_SIZE),
  });

  const { data, total } = await getVoyages(query);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold"><T>Voyages</T></h1>
        <p className="text-sm text-muted-foreground">
          {total} <T>total</T>
        </p>
      </div>

      <VoyageFilters />
      <VoyageTable voyages={data} />
      <Pagination
        page={query.page}
        pageSize={query.pageSize}
        total={total}
        basePath="/voyages"
        searchParams={rawParams}
      />
    </div>
  );
}
