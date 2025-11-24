"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { UpdateContactDto } from "@/app/api/contacts/dto";
import { ContactModal } from "@/components/ContactModal";
import { useGetContact } from "@/lib/api/queries/contacts/get-contact";
import { useUpdateContact } from "@/lib/api/mutations/contacts/update-contact";
import { useDeleteContact } from "@/lib/api/mutations/contacts/delete-contact";
import Notes from "./notes";

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Queries and Mutations
  const { data: contact, isLoading } = useGetContact(contactId);
  const updateContactMutation = useUpdateContact();
  const deleteContactMutation = useDeleteContact();

  const handleUpdate = async (data: UpdateContactDto) => {
    await updateContactMutation.mutateAsync({ id: contactId, data });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      await deleteContactMutation.mutateAsync(contactId);
      router.push("/contacts");
    } catch (error) {
      console.error("Failed to delete contact:", error);
      alert("Failed to delete contact");
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!contact) {
    return <div className="text-center py-12">Contact not found</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/contacts")}
            className="text-blue-600 hover:underline"
          >
            ← Back to Contacts
          </button>
          <h2 className="text-2xl font-bold">{contact.name}</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteContactMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteContactMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="bg-bg border border-gray-300 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Email
          </label>
          <p className="text-lg">{contact.email || "—"}</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Phone
          </label>
          <p className="text-lg">{contact.phone || "—"}</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Company
          </label>
          <p className="text-lg">{contact.company || "—"}</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Title
          </label>
          <p className="text-lg">{contact.title || "—"}</p>
        </div>

        <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Created: {new Date(contact.createdAt).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Updated: {new Date(contact.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <Notes contactId={contactId} />

      <ContactModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={{
          name: contact.name,
          email: contact.email || "",
          phone: contact.phone || "",
          company: contact.company || "",
          title: contact.title || "",
        }}
        title="Edit Contact"
        submitText="Update"
      />
    </div>
  );
}
