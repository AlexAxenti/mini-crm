app/
├── layout.tsx # Root layout (providers, theme)
├── page.tsx # Landing page (/)
│
├── (auth)/
│ ├── layout.tsx # Auth layout (minimal header with "Sign Up"/"Login" links)
│ ├── login/
│ │ └── page.tsx # /login
│ ├── logout/
│ │ └── page.tsx # /logout
│ ├── forgot-password/
│ │ └── page.tsx # /forgot-password
│ └── reset-password/
│ └── page.tsx # /reset-password
│
└── (dashboard)/
├── layout.tsx # Dashboard layout (nav header, settings, etc.)
├── contacts/
│ ├── page.tsx # /contacts (list view)
│ └── [id]/
│ └── page.tsx # /contacts/[id] (details + notes)
