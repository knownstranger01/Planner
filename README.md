# 🏦 Banking Work Hub

A local-first personal work dashboard for banking workflows.

## What is included

- Dashboard with pending, completed, overdue, and indexed-file counts
- Local task memory with priorities, due dates, quick add, and `today`/`tomorrow` parsing
- Folder file finder using the browser File System access model (`webkitdirectory`)
- Local image resizing and JPEG compression
- PDF/document selection and local print helpers
- Email templates with customer and document variables
- `mailto:` handoff for Outlook or the default desktop mail client
- Reusable KYC, account-opening, and loan checklist builder
- EMI and percentage calculators
- Command palette with `Ctrl + K`
- Local browser storage for tasks, files, and checklists

## Privacy model

The app is static HTML/CSS/JavaScript. It has no backend, analytics, login, or upload endpoint. Selected files are represented in the current browser session and local metadata is stored in `localStorage`.

Do not store sensitive customer information in browser storage unless permitted by your bank's security policy. Always follow your organization's rules for handling customer data, PDFs, images, email, and removable files.

## Use it

Open the GitHub Pages site:

<https://knownstranger01.github.io/Planner/>

The application can also be opened as a local `index.html` file. Some browser file APIs work more reliably when served from localhost or GitHub Pages.

## Important browser limitations

- A browser cannot silently attach a local file to Outlook. The Email Center prepares the message; attach the file manually in Outlook.
- The browser cannot reliably open arbitrary local files from stored metadata after a page reload. Use the file manager for opening or printing files.
- Full PDF merge, split, annotation, and redaction require a dedicated client-side PDF library or a trusted desktop integration. They should be added without sending confidential files to a server.

## Roadmap

1. Export/import encrypted local workspace backup
2. Persistent task notes, recurring tasks, and task-to-file links
3. Client-side PDF merge, split, rotate, watermark, and page extraction
4. Spreadsheet cleanup and report generation
5. Optional File System Access API folder handles where supported
6. Configurable bank-approved email and checklist templates
