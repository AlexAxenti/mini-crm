// Mock data matching your Prisma schema
const mockContacts = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Corp",
    title: "CEO",
    updatedAt: new Date("2025-11-10"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 (555) 234-5678",
    company: "Tech Solutions",
    title: "CTO",
    updatedAt: new Date("2025-11-11"),
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+1 (555) 345-6789",
    company: "Marketing Inc",
    title: "Marketing Director",
    updatedAt: new Date("2025-11-09"),
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice@example.com",
    phone: "+1 (555) 456-7890",
    company: "Design Studio",
    title: "Lead Designer",
    updatedAt: new Date("2025-11-12"),
  },
];

export default function ContactsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contacts</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Add Contact
        </button>
      </div>

      <div className="bg-bg border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Company
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Title
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {mockContacts.map((contact) => (
              <tr
                key={contact.id}
                className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
              >
                <td className="px-4 py-3 font-medium">{contact.name}</td>
                <td className="px-4 py-3 text-sm">{contact.email}</td>
                <td className="px-4 py-3 text-sm">{contact.phone}</td>
                <td className="px-4 py-3 text-sm">{contact.company}</td>
                <td className="px-4 py-3 text-sm">{contact.title}</td>
                <td className="px-4 py-3 text-sm">
                  {contact.updatedAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mockContacts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No contacts yet. Click &quot;Add Contact&quot; to get started.
        </div>
      )}
    </div>
  );
}
