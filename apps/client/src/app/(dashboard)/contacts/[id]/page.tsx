"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ContactResponseDto, UpdateContactDto } from "@/app/api/contacts/dto";
import { ContactModal } from "@/components/ContactModal";

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;

  const [contact, setContact] = useState<ContactResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${contactId}`);
      if (!res.ok) throw new Error("Failed to fetch contact");
      const data: ContactResponseDto = await res.json();
      setContact(data);
    } catch (error) {
      console.error("Failed to fetch contact:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, [contactId]);

  const handleUpdate = async (data: UpdateContactDto) => {
    const res = await fetch(`/api/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update contact");
    }

    // Refresh the contact
    await fetchContact();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete contact");

      router.push("/contacts");
    } catch (error) {
      console.error("Failed to delete contact:", error);
      alert("Failed to delete contact");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
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
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting..." : "Delete"}
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
