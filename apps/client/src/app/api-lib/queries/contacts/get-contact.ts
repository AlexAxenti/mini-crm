import { useQuery } from "@tanstack/react-query";
import { ContactResponseDto } from "@/app/api/contacts/dto";

const fetchContact = async (id: string): Promise<ContactResponseDto> => {
  const res = await fetch(`/api/contacts/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch contact");
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
