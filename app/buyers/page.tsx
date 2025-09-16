import { auth } from "@/auth";
import Navigation from "@/components/navigation";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { City, PropertyType, Status, Timeline } from "@prisma/client";
import BuyerFilters from "@/components/buyer-filters";
import Pagination from "@/components/pagination";
import ExportButton from "@/components/export-button";

interface SearchParams {
  page?: string;
  search?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  [key: string]: string | undefined;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function BuyersPage({
  searchParams,
}: Props) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const pageSize = 10;
  const search = resolvedSearchParams.search || "";
  const city = resolvedSearchParams.city || "";
  const propertyType = resolvedSearchParams.propertyType || "";
  const status = resolvedSearchParams.status || "";
  const timeline = resolvedSearchParams.timeline || "";

  const where: any = {};
  
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;

  const [buyers, total] = await Promise.all([
    prisma.buyer.findMany({
      where,
      include: { owner: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.buyer.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const formatBudget = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "-";
    if (!min) return `Up to ${max}`;
    if (!max) return `${min}+`;
    return `${min} - ${max}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Leads</h1>
          <div className="flex space-x-3">
            <ExportButton filters={{ search, city, propertyType, status, timeline }} />
            <Link
              href="/buyers/new"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add New Lead
            </Link>
          </div>
        </div>

        <BuyerFilters
          search={search}
          city={city}
          propertyType={propertyType}
          status={status}
          timeline={timeline}
        />

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {buyers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No leads found</p>
              <Link
                href="/buyers/new"
                className="mt-4 inline-block px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Your First Lead
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {buyers.map((buyer) => (
                    <tr key={buyer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {buyer.fullName}
                        </div>
                        {buyer.email && (
                          <div className="text-sm text-gray-500">{buyer.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {buyer.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {buyer.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {buyer.propertyType}
                        {buyer.bhk && ` - ${buyer.bhk}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {buyer.timeline}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${buyer.status === "NEW" ? "bg-blue-100 text-blue-800" : ""}
                          ${buyer.status === "QUALIFIED" ? "bg-green-100 text-green-800" : ""}
                          ${buyer.status === "CONTACTED" ? "bg-yellow-100 text-yellow-800" : ""}
                          ${buyer.status === "VISITED" ? "bg-purple-100 text-purple-800" : ""}
                          ${buyer.status === "NEGOTIATION" ? "bg-orange-100 text-orange-800" : ""}
                          ${buyer.status === "CONVERTED" ? "bg-green-100 text-green-800" : ""}
                          ${buyer.status === "DROPPED" ? "bg-red-100 text-red-800" : ""}
                        `}>
                          {buyer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(buyer.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/buyers/${buyer.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View / Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            searchParams={resolvedSearchParams}
          />
        )}
      </div>
    </>
  );
}