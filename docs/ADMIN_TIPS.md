# Admin Tips

## Transaction pop-ups (admin-editable)

- Open the Admin area and go to Messages.
- Each tab (Transfer, Deposit, Withdrawal, Payment) shows recommended IDs, for example:
  - transferUnavailable, transferError, transferSuccess
  - depositUnavailable, depositError, depositSuccess
  - withdrawalUnavailable, withdrawalError, withdrawalSuccess
- Use the Quick add defaults button to seed any missing messages, then edit title/body/type as needed. The transaction modals read these IDs and will show your updated text.

## Enforce single user dataset

The scripts keep only the target customer (and optional admin) in both Firebase Auth and Firestore.

Prerequisites:

- A Firebase service account JSON file.
- Set environment variable GOOGLE_APPLICATION_CREDENTIALS to the full path of that JSON.

PowerShell examples:

- Dry run (no deletions):
  - npm run cleanup:dry
- Live mode (deletes extra Auth users, Firestore users, and non-customer accounts):
  - npm run cleanup:force

Defaults used by the npm scripts:

- Customer: customer@swiftbank.com
- Admin: admin@swiftbank.com

Override defaults by running the script directly with flags, e.g.:

node scripts/cleanup-single-user.cjs --customerEmail your@bank.com --adminEmail admin@bank.com --dry
