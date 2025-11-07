import { execSync } from "child_process";

// Simple cleanup script using fetch to Firebase REST API
// Since we're authenticated with Firebase CLI

const projectId = "swiftbank-2811b";

// Get Firebase ID token for authenticated requests
async function getIdToken() {
  try {
    const result = execSync("firebase login:ci", {
      encoding: "utf8",
    });
    const data = JSON.parse(result);
    const token = data.tokens.access_token;
    return token;
  } catch (error) {
    console.error("Failed to get Firebase access token:", error);
    throw error;
  }
}

async function listFirestoreUsers() {
  try {
    const token = await getIdToken();
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("Firestore users found:");
    if (data.documents) {
      data.documents.forEach((doc, index) => {
        const docId = doc.name.split("/").pop();
        const userData = doc.fields;
        const email = userData.email?.stringValue || "no email";
        const firstName = userData.firstName?.stringValue || "";
        const lastName = userData.lastName?.stringValue || "";
        const name = userData.name?.stringValue || "";

        console.log(`${index + 1}. ID: ${docId}`);
        console.log(`   Email: ${email}`);
        console.log(
          `   Name: ${firstName} ${lastName} ${name}`.trim() || "no name"
        );
        console.log("");
      });
    } else {
      console.log("No users found in Firestore");
    }
  } catch (error) {
    console.error("Error listing users:", error);
  }
}

listFirestoreUsers();
