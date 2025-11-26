import { useQuery } from "@tanstack/react-query";
import { EventResponseDto } from "@/app/api/events/dto";
import { throwApiError } from "../../util/throw-api-error";

export type EventType = "created" | "updated" | "deleted";
export type EventEntityType = "contact" | "note" | "";
export type EventSortOrder = "asc" | "desc";

interface UseGetEventsParams {
  type?: EventType;
  entityType?: EventEntityType;
  entityId?: string;
  order?: EventSortOrder;
}

const fetchEvents = async ({
  type,
  entityType,
  entityId,
  order = "desc",
}: UseGetEventsParams): Promise<EventResponseDto[]> => {
  const params = new URLSearchParams();

  if (type) params.append("type", type);
  if (entityType) params.append("entityType", entityType);
  if (entityId) params.append("entityId", entityId);
  if (order) params.append("order", order);

  const queryString = params.toString();
  const url = queryString ? `/api/events?${queryString}` : "/api/events";

  const res = await fetch(url);

  if (!res.ok) {
    throwApiError("Failed to fetch events", res);
  }

  return res.json();
};

export const useGetEvents = (params: UseGetEventsParams = {}) => {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => fetchEvents(params),
  });
};
