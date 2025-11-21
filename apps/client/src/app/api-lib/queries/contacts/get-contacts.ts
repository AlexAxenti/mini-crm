import { useQuery } from "@tanstack/react-query";
import { ContactResponseDto } from "@/app/api/contacts/dto";

export type SearchField = "name" | "email" | "phone" | "company" | "title";
export type SortOption = "name-asc" | "name-desc" | "date-desc" | "date-asc";

interface UseGetContactsParams {
  searchField: SearchField;
  searchValue: string;
  sortOption: SortOption;
}

const fetchContacts = async ({
  searchField,
  searchValue,
  sortOption,
}: UseGetContactsParams): Promise<ContactResponseDto[]> => {
  const params = new URLSearchParams();

  // Add search params if there's a search value
  if (searchValue.trim()) {
    params.append(searchField, searchValue.trim());
  }

  // Add sort params
  const [sortBy, order] = sortOption.split("-");
  if (sortBy === "name") {
    params.append("sortBy", "name");
    params.append("order", order);
  } else {
    params.append("sortBy", "updatedAt");
    params.append("order", order);
  }

  const queryString = params.toString();
  const url = queryString ? `/api/contacts?${queryString}` : "/api/contacts";

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch contacts");
  }

  return res.json();
};

export const useGetContacts = ({
  searchField,
  searchValue,
  sortOption,
}: UseGetContactsParams) => {
  return useQuery({
    queryKey: ["contacts", { searchField, searchValue, sortOption }],
    queryFn: () => fetchContacts({ searchField, searchValue, sortOption }),
  });
};
