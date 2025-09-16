import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Navigation from "@/components/navigation";
import BuyerEditForm from "@/components/buyer-edit-form";
import BuyerHistory from "@/components/buyer-history";

export default async function BuyerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const resolvedParams = await params;
  const buyer = await prisma.buyer.findUnique({
    where: { id: resolvedParams.id },
    include: {
      owner: true,
      histories: {
        include: { user: true },
        orderBy: { changedAt: "desc" },
        take: 5,
      },
    },
  });

  if (!buyer) {
    notFound();
  }

  const canEdit = buyer.ownerId === session.user?.id;

  return (
    <>
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Lead Details</h1>
          <p className="text-sm text-gray-500 mt-1">
            Owner: {buyer.owner.name || buyer.owner.email}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BuyerEditForm buyer={buyer} canEdit={canEdit} />
          </div>
          
          <div className="lg:col-span-1">
            <BuyerHistory histories={buyer.histories} />
          </div>
        </div>
      </div>
    </>
  );
}