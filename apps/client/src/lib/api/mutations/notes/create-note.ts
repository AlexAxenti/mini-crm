import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateNoteDto, NoteResponseDto } from "@/app/api/notes/dto";
import { throwApiError } from "../../util/throw-api-error";

interface CreateNoteParams {
  contactId: string;
  data: CreateNoteDto;
}

const createNote = async ({
  contactId,
  data,
}: CreateNoteParams): Promise<NoteResponseDto> => {
  const res = await fetch(`/api/contacts/${contactId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throwApiError("Failed to create note", res);
  }

  return res.json();
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.contactId],
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
