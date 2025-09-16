"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerFormSchema, type BuyerFormData } from "@/lib/validations/buyer";
import Navigation from "@/components/navigation";
import { toast } from "sonner";
import { City, PropertyType, BHK, Purpose, Timeline, Source } from "@prisma/client";

export default function NewBuyerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<any>({
    resolver: zodResolver(buyerFormSchema) as any,
    defaultValues: {
      status: "NEW",
      tags: [],
      email: "",
      notes: "",
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
      const response = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create lead");
      }

      toast.success("Lead created successfully!");
      router.push("/buyers");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Lead</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
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
                <p className="mt-1 text-sm text-red-600">{String(errors.fullName.message || 'Invalid input')}</p>
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
                <p className="mt-1 text-sm text-red-600">{String(errors.phone.message || 'Invalid input')}</p>
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
                <p className="mt-1 text-sm text-red-600">{String(errors.email.message || 'Invalid input')}</p>
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
                <option value="">Select city</option>
                {Object.values(City).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{String(errors.city.message || 'Invalid input')}</p>
              )}
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                Property Type *
              </label>
              <select
                {...register("propertyType")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select property type</option>
                {Object.values(PropertyType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.propertyType && (
                <p className="mt-1 text-sm text-red-600">{String(errors.propertyType.message || 'Invalid input')}</p>
              )}
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
                  <p className="mt-1 text-sm text-red-600">{String(errors.bhk.message || 'Invalid input')}</p>
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
                <option value="">Select purpose</option>
                {Object.values(Purpose).map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">{String(errors.purpose.message || 'Invalid input')}</p>
              )}
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
              {errors.budgetMin && (
                <p className="mt-1 text-sm text-red-600">{String(errors.budgetMin.message || 'Invalid input')}</p>
              )}
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
                <p className="mt-1 text-sm text-red-600">{String(errors.budgetMax.message || 'Invalid input')}</p>
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
                <option value="">Select timeline</option>
                {Object.values(Timeline).map((timeline) => (
                  <option key={timeline} value={timeline}>
                    {timeline}
                  </option>
                ))}
              </select>
              {errors.timeline && (
                <p className="mt-1 text-sm text-red-600">{String(errors.timeline.message || 'Invalid input')}</p>
              )}
            </div>

            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                Source *
              </label>
              <select
                {...register("source")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select source</option>
                {Object.values(Source).map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              {errors.source && (
                <p className="mt-1 text-sm text-red-600">{String(errors.source.message || 'Invalid input')}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{String(errors.notes.message || 'Invalid input')}</p>
            )}
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              onChange={(e) => {
                const tags = e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean);
                setValue("tags", tags);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push("/buyers")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}