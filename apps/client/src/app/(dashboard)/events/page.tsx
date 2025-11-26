"use client";

import { useGetEvents } from "@/lib/api/queries/events/get-events";
import { useState } from "react";

export default function EventsPage() {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const { data: events, isLoading, isError } = useGetEvents({ order });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load events</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort:</label>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {!events || events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No events found</div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded">
                      {event.type}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {event.entityType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Entity ID: {event.entityId}
                  </p>
                  {event.meta && (
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                      {JSON.stringify(event.meta, null, 2)}
                    </pre>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  {new Date(event.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
