"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerFormSchema, type BuyerFormData } from "@/lib/validations/buyer";
import { toast } from "sonner";
import { City, PropertyType, BHK, Purpose, Timeline, Source, Status, Buyer, User } from "@prisma/client";

interface BuyerEditFormProps {
  buyer: Buyer & { owner: User };
  canEdit: boolean;
}

export default function BuyerEditForm({ buyer, canEdit }: BuyerEditFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset,
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerFormSchema) as any,
    defaultValues: {
      fullName: buyer.fullName,
      email: buyer.email || "",
      phone: buyer.phone,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || undefined,
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin || undefined,
      budgetMax: buyer.budgetMax || undefined,
      timeline: buyer.timeline,
      source: buyer.source,
      status: buyer.status,
      notes: buyer.notes || "",
      tags: buyer.tags ? buyer.tags.split(",").filter(Boolean) : [],
    },
  });

  const propertyType = watch("propertyType");
  const showBHK = propertyType === "APARTMENT" || propertyType === "VILLA";

  useEffect(() => {
    if (!showBHK) {
      setValue("bhk", undefined);
    }
  }, [showBHK, setValue]);

  const onSubmit = async (data: BuyerFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/buyers/${buyer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          updatedAt: buyer.updatedAt.toISOString()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update lead");
      }

      toast.success("Lead updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message.includes("modified by someone else")) {
        toast.error(error.message);
        router.refresh();
      } else {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Lead Information</h2>
          {canEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Edit
            </button>
          )}
        </div>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{buyer.fullName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{buyer.phone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{buyer.email || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">City</dt>
            <dd className="mt-1 text-sm text-gray-900">{buyer.city}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Property Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {buyer.propertyType}
              {buyer.bhk && ` - ${buyer.bhk}`}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Purpose</dt>
            <dd className="mt-1 text-sm text-gray-900">{buyer.purpose}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Budget</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {buyer.budgetMin || buyer.budgetMax
                ? `${buyer.budgetMin || "0"} - ${buyer.budgetMax || "No limit"}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Timeline</dt>
            <dd className="mt-1 text-sm text-gray-900">{buyer.timeline}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Source</dt>
            <dd className="mt-1 text-sm text-gray-900">{buyer.source}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
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
            </dd>
          </div>
          {buyer.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900">{buyer.notes}</dd>
            </div>
          )}
          {buyer.tags && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Tags</dt>
              <dd className="mt-1">
                {buyer.tags.split(",").filter(Boolean).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2"
                  >
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Edit Lead Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            {...register("fullName")}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone *
          </label>
          <input
            {...register("phone")}
            type="tel"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <select
            {...register("city")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.values(City).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
            Property Type *
          </label>
          <select
            {...register("propertyType")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.values(PropertyType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {showBHK && (
          <div>
            <label htmlFor="bhk" className="block text-sm font-medium text-gray-700">
              BHK *
            </label>
            <select
              {...register("bhk")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select BHK</option>
              {Object.values(BHK).map((bhk) => (
                <option key={bhk} value={bhk}>
                  {bhk}
                </option>
              ))}
            </select>
            {errors.bhk && (
              <p className="mt-1 text-sm text-red-600">{errors.bhk.message}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
            Purpose *
          </label>
          <select
            {...register("purpose")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.values(Purpose).map((purpose) => (
              <option key={purpose} value={purpose}>
                {purpose}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700">
            Minimum Budget
          </label>
          <input
            {...register("budgetMin", { valueAsNumber: true })}
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700">
            Maximum Budget
          </label>
          <input
            {...register("budgetMax", { valueAsNumber: true })}
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.budgetMax && (
            <p className="mt-1 text-sm text-red-600">{errors.budgetMax.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">
            Timeline *
          </label>
          <select
            {...register("timeline")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.values(Timeline).map((timeline) => (
              <option key={timeline} value={timeline}>
                {timeline}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">
            Source *
          </label>
          <select
            {...register("source")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.values(Source).map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <select
            {...register("status")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.values(Status).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          {...register("notes")}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      <div className="mt-6">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          defaultValue={buyer.tags}
          onChange={(e) => {
            const tags = e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean);
            setValue("tags", tags);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}