import { useQuery } from "@tanstack/react-query";
import { ContactResponseDto } from "@/app/api/contacts/dto";
import { throwApiError } from "../../util/throw-api-error";

const fetchContact = async (id: string): Promise<ContactResponseDto> => {
  const res = await fetch(`/api/contacts/${id}`);

  if (!res.ok) {
    throwApiError("Failed to fetch contact", res);
  }

  return res.json();
};

export const useGetContact = (id: string) => {
  return useQuery({
    queryKey: ["contact", id],
    queryFn: () => fetchContact(id),
    enabled: !!id,
  });
};
