import { useQuery } from "@tanstack/react-query";

export interface NoteResponseDto {
  id: string;
  title: string;
  body: string;
  contactId: string;
  createdAt: Date;
  updatedAt: Date;
}

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
    throw new Error("Failed to fetch notes");
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
