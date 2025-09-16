import { auth } from "@/auth";
import Navigation from "@/components/navigation";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const stats = await prisma.buyer.groupBy({
    by: ["status"],
    _count: true,
  });

  const totalLeads = await prisma.buyer.count();
  const recentLeads = await prisma.buyer.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { owner: true },
  });

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Leads</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{totalLeads}</p>
          </div>
          
          {stats.slice(0, 2).map((stat) => (
            <div key={stat.status} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">{stat.status}</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stat._count}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{lead.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{lead.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{lead.owner.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}