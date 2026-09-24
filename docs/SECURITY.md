# Banking Work Hub – V1 scope

This folder is reserved for implementation notes and security review material for future local-only modules.

Before adding any third-party library:

- Confirm the bank permits it.
- Prefer vendored, pinned client-side code.
- Verify that files never leave the browser.
- Avoid external fonts, analytics, CDNs, and telemetry.
- Add an explicit user confirmation before destructive file operations.
- Test with synthetic documents before handling customer data.
