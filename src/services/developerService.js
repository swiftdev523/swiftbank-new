import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";
import { AppError, ErrorTypes } from "../utils/errorUtils";
import authService from "./authService";
import firestoreService from "./firestoreService";

class DeveloperService {
  constructor() {
    this.collectionNames = {
      developers: "developers",
      adminAssignments: "adminAssignments",
      developerSessions: "developerSessions",
    };
  }

  // Helper: fetch user docs by UIDs (small batches, safe for < ~50 ids)
  async _getUsersByIds(uids = []) {
    const results = [];
    for (const uid of Array.from(new Set(uids))) {
      try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          results.push({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.warn("Failed to fetch user by id", uid, e?.message || e);
      }
    }
    return results;
  }

  // Helper: find single user by email (returns first match or null)
  async _findUserByEmail(email) {
    if (!email) return null;
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", email.toLowerCase()),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      return { id: d.id, ...d.data() };
    } catch (err) {
      console.warn("_findUserByEmail failed", err?.message || err);
      return null;
    }
  }

  // Developer Authentication
  async authenticateDeveloper(email, password) {
    try {
      if (!isFirebaseConfigured) {
        throw new AppError("Firebase not configured", ErrorTypes.CONFIG_ERROR);
      }

      // First authenticate with Firebase Auth
      // Use the standardized signIn method from authService
      const userCredential = await authService.signIn(email, password);
      const user = userCredential.user;
      console.log("🔐 Developer sign-in success", {
        uid: user?.uid,
        email: user?.email,
      });

      // Check if user is a developer in Firestore
      let developerDoc = await this.getDeveloperProfile(user.uid);
      if (!developerDoc && user?.email) {
        try {
          const devsRef = collection(db, this.collectionNames.developers);
          const q1 = query(devsRef, where("email", "==", user.email), limit(1));
          const snap = await getDocs(q1);
          if (!snap.empty) {
            const found = snap.docs[0];
            const data = found.data();
            developerDoc = { id: found.id, ...data };
            console.warn("⚠️ Found developer profile by email not UID.", {
              uid: user.uid,
              email: user.email,
              foundId: found.id,
            });

            // One-time migration to UID-based document for stability
            try {
              const targetRef = doc(
                db,
                this.collectionNames.developers,
                user.uid
              );
              await setDoc(targetRef, { ...data, uid: user.uid });
              console.log(
                "✅ Migrated developer profile to UID doc:",
                user.uid
              );
              developerDoc = { id: user.uid, ...data, uid: user.uid };
            } catch (migrateErr) {
              console.warn(
                "Migration to UID doc failed:",
                migrateErr?.message || migrateErr
              );
            }
          }
        } catch (lookupErr) {
          console.warn(
            "Developer email lookup failed:",
            lookupErr?.message || lookupErr
          );
        }
      }
      if (!developerDoc) {
        console.warn(
          "⚠️ No developer profile found – attempting automatic provisioning"
        );
        try {
          developerDoc = await this.ensureDeveloperProfile(user);
          if (developerDoc) {
            console.log(
              "✅ Auto-provisioned developer profile for UID:",
              user.uid
            );
          }
        } catch (provisionErr) {
          console.error(
            "❌ Auto-provisioning developer profile failed:",
            provisionErr?.message || provisionErr
          );
          // As last resort sign out & throw
          await authService.logout();
          throw new AppError(
            `Access denied: Developer profile missing and auto-provision failed for UID ${user.uid}`,
            ErrorTypes.AUTH_ERROR
          );
        }
      }

      // Check if developer account is active
      if (developerDoc.isActive === false) {
        await authService.logout();
        throw new AppError(
          "Your developer account has been deactivated.",
          ErrorTypes.AUTH_ERROR
        );
      }

      // Create developer session
      await this.createDeveloperSession(user.uid);

      return {
        uid: user.uid,
        email: user.email,
        ...developerDoc,
        role: "developer",
      };
    } catch (error) {
      console.error("Developer authentication error:", error);
      throw error;
    }
  }

  /**
   * Ensure a developer profile (developers & users collection docs) exists for the authenticated user.
   * If missing, create minimal documents so the freshly authenticated Firebase user can proceed.
   * NOTE: This runs client-side so we only create non-sensitive baseline docs; in production prefer
   * secured callable Cloud Function or Admin SDK server.
   */
  async ensureDeveloperProfile(firebaseUser) {
    if (!firebaseUser?.uid) return null;

    const devRef = doc(db, this.collectionNames.developers, firebaseUser.uid);
    const devSnap = await getDoc(devRef);
    if (devSnap.exists()) {
      return { id: firebaseUser.uid, ...devSnap.data() };
    }

    // Prepare baseline developer doc
    const developerData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "unknown@unknown",
      firstName: firebaseUser.displayName?.split(" ")[0] || "System",
      lastName:
        firebaseUser.displayName?.split(" ").slice(1).join(" ") || "Developer",
      role: "developer",
      permissions: ["*"],
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      autoProvisioned: true,
    };

    await setDoc(devRef, developerData);

    // Ensure user doc for unified role lookups
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const userData = {
        uid: firebaseUser.uid,
        email: developerData.email,
        firstName: developerData.firstName,
        lastName: developerData.lastName,
        role: "developer",
        permissions: developerData.permissions,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        autoProvisioned: true,
      };
      await setDoc(userRef, userData);
    }

    return { id: firebaseUser.uid, ...developerData };
  }

  // Get developer profile
  async getDeveloperProfile(uid) {
    try {
      const docRef = doc(db, this.collectionNames.developers, uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching developer profile:", error);
      throw new AppError(
        "Failed to fetch developer profile",
        ErrorTypes.FIRESTORE_ERROR
      );
    }
  }

  // Create developer session
  async createDeveloperSession(uid) {
    try {
      const sessionData = {
        developerId: uid,
        loginTime: serverTimestamp(),
        lastActivity: serverTimestamp(),
        isActive: true,
      };

      await setDoc(
        doc(db, this.collectionNames.developerSessions, uid),
        sessionData
      );
    } catch (error) {
      console.error("Error creating developer session:", error);
    }
  }

  // Create a new admin and assign them to a customer
  async createAdminWithCustomer(adminData, customerData, developerId) {
    console.log("🏗️ createAdminWithCustomer called with:", {
      adminEmail: adminData.email,
      customerEmail: customerData.email,
      developerId,
      developerIdType: typeof developerId,
      developerIdLength: developerId?.length,
    });

    const batch = writeBatch(db);

    try {
      // Validate required fields
      if (!adminData.email || !adminData.password || !customerData.email) {
        throw new AppError(
          "Missing required fields",
          ErrorTypes.VALIDATION_ERROR
        );
      }
      const adminEmail = adminData.email.toLowerCase();
      const customerEmail = customerData.email.toLowerCase();

      // Look for existing Firestore user docs first (legacy seeded data support)
      const existingAdmin = await this._findUserByEmail(adminEmail);
      const existingCustomer = await this._findUserByEmail(customerEmail);

      let adminUid = existingAdmin?.uid || existingAdmin?.id || null;
      let customerUid = existingCustomer?.uid || existingCustomer?.id || null;

      let createdNewAdmin = false;
      let createdNewCustomer = false;

      // ADMIN HANDLING
      if (existingAdmin) {
        // Validate role compatibility
        if (existingAdmin.role && existingAdmin.role !== "admin") {
          throw new AppError(
            `Existing user with email ${adminEmail} has role '${existingAdmin.role}' (expected admin)`,
            ErrorTypes.VALIDATION_ERROR
          );
        }
        if (existingAdmin.assignedCustomer) {
          throw new AppError(
            `Existing admin ${adminEmail} is already assigned to a customer`,
            ErrorTypes.VALIDATION_ERROR
          );
        }
        console.log("♻️ Reusing existing admin user doc:", adminUid);
      } else {
        // Create admin user in Firebase Auth
        try {
          console.log("🔐 Creating Firebase Auth account for admin...");
          const adminCredential = await authService.signUp(
            adminEmail,
            adminData.password,
            {
              firstName: adminData.firstName,
              lastName: adminData.lastName,
              role: "admin",
              skipValidation: true,
            }
          );
          adminUid = adminCredential.user.uid;
          createdNewAdmin = true;
          console.log("✅ Admin Firebase Auth account created:", adminUid);
        } catch (err) {
          if (err?.code === "auth/email-already-in-use") {
            // Race: user exists in Auth but no Firestore doc yet
            const retryAdmin = await this._findUserByEmail(adminEmail);
            if (!retryAdmin) {
              throw new AppError(
                `Admin email ${adminEmail} exists in Auth but no Firestore user doc found. Create user doc manually or contact support.`,
                ErrorTypes.FIRESTORE_ERROR
              );
            }
            if (retryAdmin.role && retryAdmin.role !== "admin") {
              throw new AppError(
                `Existing user with email ${adminEmail} has role '${retryAdmin.role}' (expected admin)`,
                ErrorTypes.VALIDATION_ERROR
              );
            }
            adminUid = retryAdmin.uid || retryAdmin.id;
            console.log(
              "♻️ Reusing (delayed) existing admin after auth conflict:",
              adminUid
            );
          } else {
            throw err;
          }
        }
      }

      // CUSTOMER HANDLING
      if (existingCustomer) {
        if (existingCustomer.role && existingCustomer.role !== "customer") {
          throw new AppError(
            `Existing user with email ${customerEmail} has role '${existingCustomer.role}' (expected customer)`,
            ErrorTypes.VALIDATION_ERROR
          );
        }
        if (existingCustomer.assignedAdmin) {
          throw new AppError(
            `Existing customer ${customerEmail} is already assigned to an admin`,
            ErrorTypes.VALIDATION_ERROR
          );
        }
        console.log("♻️ Reusing existing customer user doc:", customerUid);
      } else {
        try {
          console.log("🔐 Creating Firebase Auth account for customer...");
          const customerCredential = await authService.signUp(
            customerEmail,
            customerData.password,
            {
              firstName: customerData.firstName,
              lastName: customerData.lastName,
              role: "customer",
              skipValidation: true,
            }
          );
          customerUid = customerCredential.user.uid;
          createdNewCustomer = true;
          console.log(
            "✅ Customer Firebase Auth account created:",
            customerUid
          );
        } catch (err) {
          if (err?.code === "auth/email-already-in-use") {
            const retryCustomer = await this._findUserByEmail(customerEmail);
            if (!retryCustomer) {
              throw new AppError(
                `Customer email ${customerEmail} exists in Auth but no Firestore user doc found. Create user doc manually or contact support.`,
                ErrorTypes.FIRESTORE_ERROR
              );
            }
            if (retryCustomer.role && retryCustomer.role !== "customer") {
              throw new AppError(
                `Existing user with email ${customerEmail} has role '${retryCustomer.role}' (expected customer)`,
                ErrorTypes.VALIDATION_ERROR
              );
            }
            customerUid = retryCustomer.uid || retryCustomer.id;
            console.log(
              "♻️ Reusing (delayed) existing customer after auth conflict:",
              customerUid
            );
          } else {
            throw err;
          }
        }
      }

      if (!adminUid || !customerUid) {
        throw new AppError(
          "Failed to resolve admin or customer UID",
          ErrorTypes.FIRESTORE_ERROR
        );
      }

      // Build/merge admin user doc
      const nowTs = serverTimestamp();
      const adminRef = doc(db, "users", adminUid);
      const customerRef = doc(db, "users", customerUid);

      if (createdNewAdmin) {
        batch.set(adminRef, {
          uid: adminUid,
          email: adminEmail,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          role: "admin",
          createdBy: developerId,
          assignedCustomer: customerUid,
          createdAt: nowTs,
          updatedAt: nowTs,
          isActive: true,
        });
      } else {
        // update existing admin
        batch.update(adminRef, {
          assignedCustomer: customerUid,
          createdBy: existingAdmin?.createdBy || developerId,
          updatedAt: nowTs,
          isActive: existingAdmin?.isActive !== false,
        });
      }

      if (createdNewCustomer) {
        batch.set(customerRef, {
          uid: customerUid,
          email: customerEmail,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone || "",
          role: "customer",
          assignedAdmin: adminUid,
          createdBy: developerId,
          createdAt: nowTs,
          updatedAt: nowTs,
          isActive: true,
          accounts: [],
        });
      } else {
        batch.update(customerRef, {
          assignedAdmin: adminUid,
          createdBy: existingCustomer?.createdBy || developerId,
          updatedAt: nowTs,
          isActive: existingCustomer?.isActive !== false,
        });
      }

      // Assignment doc
      const assignmentDoc = {
        developerId,
        adminId: adminUid,
        customerId: customerUid,
        adminEmail: adminEmail,
        customerEmail: customerEmail,
        createdAt: nowTs,
        isActive: true,
        reusedAdmin: !createdNewAdmin,
        reusedCustomer: !createdNewCustomer,
      };

      batch.set(
        doc(
          db,
          this.collectionNames.adminAssignments,
          `${adminUid}_${customerUid}`
        ),
        assignmentDoc
      );

      await batch.commit();

      const adminUserDoc = {
        uid: adminUid,
        email: adminEmail,
        firstName: adminData.firstName || existingAdmin?.firstName,
        lastName: adminData.lastName || existingAdmin?.lastName,
        role: "admin",
        createdBy: existingAdmin?.createdBy || developerId,
        assignedCustomer: customerUid,
        isActive: true,
        reused: !createdNewAdmin,
      };
      const customerUserDoc = {
        uid: customerUid,
        email: customerEmail,
        firstName: customerData.firstName || existingCustomer?.firstName,
        lastName: customerData.lastName || existingCustomer?.lastName,
        phone: customerData.phone || existingCustomer?.phone || "",
        role: "customer",
        assignedAdmin: adminUid,
        createdBy: existingCustomer?.createdBy || developerId,
        isActive: true,
        accounts: existingCustomer?.accounts || [],
        reused: !createdNewCustomer,
      };

      return {
        admin: adminUserDoc,
        customer: customerUserDoc,
        assignment: assignmentDoc,
      };
    } catch (error) {
      console.error("Error creating admin with customer:", error);
      throw new AppError(
        "Failed to create admin and customer",
        ErrorTypes.FIRESTORE_ERROR
      );
    }
  }

  // Get all admins created by a developer
  async getAdminsByDeveloper(developerId) {
    console.log(
      "🔍 getAdminsByDeveloper called with developerId:",
      developerId
    );
    console.log("📋 Full developer ID (for debugging):", {
      developerId,
      type: typeof developerId,
      length: developerId?.length,
    });
    try {
      let querySnapshot;
      try {
        console.log("📋 Attempting indexed query for admins...");
        const q = query(
          collection(db, "users"),
          where("createdBy", "==", developerId),
          where("role", "==", "admin")
          // Removed isActive filter - show all admins (active and inactive)
          // removed orderBy to remove composite index requirement – we'll sort client-side
        );
        querySnapshot = await getDocs(q);
        console.log(
          "✅ Indexed query succeeded, docs:",
          querySnapshot.docs.length
        );
      } catch (err) {
        const msg = err?.message || "";
        if (
          msg.includes("requires an index") ||
          msg.includes("currently building")
        ) {
          console.warn(
            "⚠️ Admins query needs index or is building. Using fallback (client-side filter/sort)."
          );
          const qFallback = query(
            collection(db, "users"),
            where("role", "==", "admin")
          );
          querySnapshot = await getDocs(qFallback);
          console.log(
            "📋 Fallback query result, docs:",
            querySnapshot.docs.length
          );
        } else {
          throw err;
        }
      }
      const admins = [];

      console.log(
        "📄 Raw query results - Total docs:",
        querySnapshot.docs.length
      );

      for (const snap of querySnapshot.docs) {
        const adminData = { id: snap.id, ...snap.data() };
        console.log("👤 Found user document:", {
          id: snap.id,
          role: adminData.role,
          email: adminData.email,
          createdBy: adminData.createdBy,
          isActive: adminData.isActive,
        });

        // Get assigned customer data
        if (adminData.assignedCustomer) {
          const customerDoc = await getDoc(
            doc(db, "users", adminData.assignedCustomer)
          );
          if (customerDoc.exists()) {
            adminData.customerData = {
              id: customerDoc.id,
              ...customerDoc.data(),
            };
          }
        }

        admins.push(adminData);
      }

      // Client-side filter/sort if we used fallback
      let filtered = admins
        .filter((a) => a.role === "admin")
        .sort((a, b) => {
          const ta =
            (a.createdAt && a.createdAt.toMillis?.()) ||
            new Date(a.createdAt || 0).getTime();
          const tb =
            (b.createdAt && b.createdAt.toMillis?.()) ||
            new Date(b.createdAt || 0).getTime();
          return tb - ta;
        });

      // Assignment-based fallback: if no admins found via createdBy, derive from adminAssignments
      console.log("📊 Initial filtered admins count:", filtered.length);
      if (filtered.length === 0) {
        console.log(
          "🔄 No admins found via createdBy, trying assignment-based fallback..."
        );
        try {
          const assignments = await this.getAdminAssignments(developerId);
          console.log("📋 Found assignments:", assignments.length);
          const adminIds = assignments.map((a) => a.adminId).filter(Boolean);
          console.log("👤 Admin IDs from assignments:", adminIds);
          if (adminIds.length) {
            const users = await this._getUsersByIds(adminIds);
            // Map customer by assignment for quick lookup
            const adminToCustomer = new Map(
              assignments.map((a) => [a.adminId, a.customerId])
            );
            // Enrich with customer data
            for (const u of users) {
              if (u.role !== "admin") continue; // Only check role, not isActive
              const adminData = { ...u };
              const custId = adminToCustomer.get(u.uid) || u.assignedCustomer;
              if (custId) {
                const customerDoc = await getDoc(doc(db, "users", custId));
                if (customerDoc.exists()) {
                  adminData.customerData = {
                    id: customerDoc.id,
                    ...customerDoc.data(),
                  };
                }
              }
              admins.push(adminData);
            }
            filtered = admins
              .filter((a) => a.role === "admin")
              .sort((a, b) => {
                const ta =
                  (a.createdAt && a.createdAt.toMillis?.()) ||
                  new Date(a.createdAt || 0).getTime();
                const tb =
                  (b.createdAt && b.createdAt.toMillis?.()) ||
                  new Date(b.createdAt || 0).getTime();
                return tb - ta;
              });
          }
        } catch (fallbackErr) {
          console.warn(
            "Admins assignment-based fallback failed:",
            fallbackErr?.message || fallbackErr
          );
        }
      }
      return filtered;
    } catch (error) {
      console.error("Error fetching admins by developer:", error);
      throw new AppError("Failed to fetch admins", ErrorTypes.FIRESTORE_ERROR);
    }
  }

  // Get all customers created by a developer
  async getCustomersByDeveloper(developerId) {
    console.log(
      "🔍 getCustomersByDeveloper called with developerId:",
      developerId
    );
    console.log("📋 Full developer ID (for debugging):", {
      developerId,
      type: typeof developerId,
      length: developerId?.length,
    });
    try {
      let querySnapshot;
      try {
        console.log("📋 Attempting indexed query for customers...");
        const q = query(
          collection(db, "users"),
          where("createdBy", "==", developerId),
          where("role", "==", "customer")
          // Removed isActive filter - show all customers (active and inactive)
          // removed orderBy – client-side sort
        );
        querySnapshot = await getDocs(q);
        console.log(
          "✅ Indexed query succeeded, docs:",
          querySnapshot.docs.length
        );
      } catch (err) {
        const msg = err?.message || "";
        if (
          msg.includes("requires an index") ||
          msg.includes("currently building")
        ) {
          console.warn(
            "⚠️ Customers query needs index or is building. Using fallback (client-side filter/sort)."
          );
          const qFallback = query(
            collection(db, "users"),
            where("role", "==", "customer")
          );
          querySnapshot = await getDocs(qFallback);
        } else {
          throw err;
        }
      }
      const customers = [];

      for (const snap of querySnapshot.docs) {
        const customerData = { id: snap.id, ...snap.data() };

        // Get assigned admin data
        if (customerData.assignedAdmin) {
          const adminDoc = await getDoc(
            doc(db, "users", customerData.assignedAdmin)
          );
          if (adminDoc.exists()) {
            customerData.adminData = { id: adminDoc.id, ...adminDoc.data() };
          }
        }

        customers.push(customerData);
      }

      let filtered = customers
        .filter((c) => c.role === "customer")
        .sort((a, b) => {
          const ta =
            (a.createdAt && a.createdAt.toMillis?.()) ||
            new Date(a.createdAt || 0).getTime();
          const tb =
            (b.createdAt && b.createdAt.toMillis?.()) ||
            new Date(b.createdAt || 0).getTime();
          return tb - ta;
        });

      // Assignment-based fallback: if no customers found via createdBy, derive from adminAssignments
      if (filtered.length === 0) {
        try {
          const assignments = await this.getAdminAssignments(developerId);
          const customerIds = assignments
            .map((a) => a.customerId)
            .filter(Boolean);
          if (customerIds.length) {
            const users = await this._getUsersByIds(customerIds);
            const customerToAdmin = new Map(
              assignments.map((a) => [a.customerId, a.adminId])
            );
            for (const u of users) {
              if (u.role !== "customer") continue; // Only check role, not isActive
              const customerData = { ...u };
              const admId = customerToAdmin.get(u.uid) || u.assignedAdmin;
              if (admId) {
                const adminDoc = await getDoc(doc(db, "users", admId));
                if (adminDoc.exists()) {
                  customerData.adminData = {
                    id: adminDoc.id,
                    ...adminDoc.data(),
                  };
                }
              }
              customers.push(customerData);
            }
            filtered = customers
              .filter((c) => c.role === "customer")
              .sort((a, b) => {
                const ta =
                  (a.createdAt && a.createdAt.toMillis?.()) ||
                  new Date(a.createdAt || 0).getTime();
                const tb =
                  (b.createdAt && b.createdAt.toMillis?.()) ||
                  new Date(b.createdAt || 0).getTime();
                return tb - ta;
              });
          }
        } catch (fallbackErr) {
          console.warn(
            "Customers assignment-based fallback failed:",
            fallbackErr?.message || fallbackErr
          );
        }
      }
      return filtered;
    } catch (error) {
      console.error("Error fetching customers by developer:", error);
      throw new AppError(
        "Failed to fetch customers",
        ErrorTypes.FIRESTORE_ERROR
      );
    }
  }

  // Get admin assignments for a developer
  async getAdminAssignments(developerId) {
    console.log("🔍 getAdminAssignments called with developerId:", developerId);
    try {
      let querySnapshot;
      try {
        console.log("📋 Attempting assignments query...");
        const q = query(
          collection(db, this.collectionNames.adminAssignments),
          where("developerId", "==", developerId),
          where("isActive", "==", true),
          orderBy("createdAt", "desc")
        );
        querySnapshot = await getDocs(q);
        console.log(
          "✅ Assignments query succeeded, docs:",
          querySnapshot.docs.length
        );
      } catch (err) {
        const msg = err?.message || "";
        if (
          msg.includes("requires an index") ||
          msg.includes("currently building")
        ) {
          console.warn(
            "⚠️ Admin assignments query needs index or is building. Using fallback (client-side filter/sort)."
          );
          const qFallback = query(
            collection(db, this.collectionNames.adminAssignments),
            where("developerId", "==", developerId)
          );
          querySnapshot = await getDocs(qFallback);
        } else {
          throw err;
        }
      }
      const items = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      return items
        .filter((it) => it.isActive !== false)
        .sort((a, b) => {
          const ta =
            (a.createdAt && a.createdAt.toMillis?.()) ||
            new Date(a.createdAt || 0).getTime();
          const tb =
            (b.createdAt && b.createdAt.toMillis?.()) ||
            new Date(b.createdAt || 0).getTime();
          return tb - ta;
        });
    } catch (error) {
      console.error("Error fetching admin assignments:", error);
      throw new AppError(
        "Failed to fetch admin assignments",
        ErrorTypes.FIRESTORE_ERROR
      );
    }
  }

  // Deactivate admin-customer relationship
  async deactivateAdminCustomerPair(adminId, customerId, developerId) {
    const batch = writeBatch(db);

    try {
      // Update admin user
      const adminRef = doc(db, "users", adminId);
      batch.update(adminRef, {
        isActive: false,
        deactivatedAt: serverTimestamp(),
        deactivatedBy: developerId,
      });

      // Update customer user
      const customerRef = doc(db, "users", customerId);
      batch.update(customerRef, {
        isActive: false,
        deactivatedAt: serverTimestamp(),
        deactivatedBy: developerId,
      });

      // Update assignment
      const assignmentRef = doc(
        db,
        this.collectionNames.adminAssignments,
        `${adminId}_${customerId}`
      );
      batch.update(assignmentRef, {
        isActive: false,
        deactivatedAt: serverTimestamp(),
        deactivatedBy: developerId,
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error deactivating admin-customer pair:", error);
      throw new AppError(
        "Failed to deactivate admin-customer pair",
        ErrorTypes.FIRESTORE_ERROR
      );
    }
  }

  // Toggle user active status (admin or customer) - SIMPLIFIED VERSION
  async toggleUserActiveStatus(userId, currentStatus, developerId) {
    console.log("🔧 toggleUserActiveStatus START", {
      userId,
      currentStatus,
      developerId,
    });

    try {
      // Simple validation
      if (!userId) throw new Error("User ID is required");
      if (!developerId) throw new Error("Developer ID is required");
      if (typeof currentStatus !== "boolean")
        throw new Error("Current status must be boolean");

      const userRef = doc(db, "users", userId);
      const newStatus = !currentStatus;

      const updateData = {
        isActive: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: developerId,
      };

      if (newStatus) {
        // Reactivating
        updateData.deactivatedAt = null;
        updateData.deactivatedBy = null;
      } else {
        // Deactivating
        updateData.deactivatedAt = serverTimestamp();
        updateData.deactivatedBy = developerId;
      }

      console.log(
        "🔥 Updating Firestore document:",
        userId,
        "with data:",
        updateData
      );
      await updateDoc(userRef, updateData);

      console.log(
        `✅ SUCCESS: User ${userId} toggled to ${newStatus ? "Active" : "Inactive"}`
      );
      return { success: true, newStatus };
    } catch (error) {
      console.error("❌ TOGGLE ERROR:", error);
      throw error;
    }
  }

  // Get customer assigned to an admin
  async getCustomerByAdmin(adminId) {
    try {
      const q = query(
        collection(db, "users"),
        where("assignedAdmin", "==", adminId),
        where("role", "==", "customer"),
        where("isActive", "==", true),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching customer by admin:", error);
      throw new AppError(
        "Failed to fetch assigned customer",
        ErrorTypes.FIRESTORE_ERROR
      );
    }
  }

  // Update developer activity
  async updateDeveloperActivity(uid) {
    try {
      const sessionRef = doc(db, this.collectionNames.developerSessions, uid);
      await updateDoc(sessionRef, {
        lastActivity: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating developer activity:", error);
    }
  }

  // Get developer statistics
  async getDeveloperStats(developerId) {
    try {
      const [admins, customers, assignments] = await Promise.all([
        this.getAdminsByDeveloper(developerId),
        this.getCustomersByDeveloper(developerId),
        this.getAdminAssignments(developerId),
      ]);

      return {
        totalAdmins: admins.length,
        totalCustomers: customers.length,
        totalAssignments: assignments.length,
        activeAdmins: admins.filter((admin) => admin.isActive).length,
        activeCustomers: customers.filter((customer) => customer.isActive)
          .length,
        recentActivity: assignments.slice(0, 5), // Last 5 assignments
      };
    } catch (error) {
      console.error("Error fetching developer stats:", error);
      throw new AppError(
        "Failed to fetch developer statistics",
        ErrorTypes.FIRESTORE_ERROR
      );
    }
  }
}

const developerService = new DeveloperService();

export default developerService;
