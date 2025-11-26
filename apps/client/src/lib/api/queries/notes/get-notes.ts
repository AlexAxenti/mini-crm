import { useQuery } from "@tanstack/react-query";
import { throwApiError } from "../../util/throw-api-error";
import { NoteResponseDto } from "@/app/api/notes/dto";

export type SortOrder = "newest" | "oldest";

interface UseGetNotesParams {
  contactId: string;
  sortOrder: SortOrder;
}

const fetchNotes = async ({
  contactId,
  sortOrder,
}: UseGetNotesParams): Promise<NoteResponseDto[]> => {
  const params = new URLSearchParams();
  params.append("contactId", contactId);
  params.append("sortBy", "updatedAt");
  params.append("order", sortOrder === "newest" ? "desc" : "asc");

  const queryString = params.toString();
  const url = `/api/notes?${queryString}`;

  const res = await fetch(url);

  if (!res.ok) {
    throwApiError("Failed to fetch notes", res);
  }

  return res.json();
};

export const useGetNotes = ({ contactId, sortOrder }: UseGetNotesParams) => {
  return useQuery({
    queryKey: ["notes", contactId, { sortOrder }],
    queryFn: () => fetchNotes({ contactId, sortOrder }),
    enabled: !!contactId,
  });
};
