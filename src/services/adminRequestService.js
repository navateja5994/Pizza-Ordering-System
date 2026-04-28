import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import emailjs from "@emailjs/browser";
import { demoUser } from "./demoStorage";

const ADMIN_EMAIL = "navatejar80@gmail.com";
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Initialize EmailJS once at module load if key is available
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

function isFirebaseReady() {
  try {
    return !!db;
  } catch {
    return false;
  }
}

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function sendApprovalEmail(requestData) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  if (!serviceId || !templateId || !EMAILJS_PUBLIC_KEY) {
    console.warn("EmailJS not configured. Approval links:");
    console.log("Accept:", `${APP_URL}/admin-approval?uid=${requestData.uid}&token=${requestData.approvalToken}&action=accept`);
    console.log("Reject:", `${APP_URL}/admin-approval?uid=${requestData.uid}&token=${requestData.approvalToken}&action=reject`);
    return { success: false, message: "EmailJS not configured - links logged to console" };
  }

  const acceptLink = `${APP_URL}/admin-approval?uid=${requestData.uid}&token=${requestData.approvalToken}&action=accept`;
  const rejectLink = `${APP_URL}/admin-approval?uid=${requestData.uid}&token=${requestData.approvalToken}&action=reject`;

  const templateParams = {
    to_email: ADMIN_EMAIL,
    admin_name: requestData.name,
    admin_email: requestData.email,
    signup_time: new Date(requestData.createdAt).toLocaleString(),
    accept_link: acceptLink,
    reject_link: rejectLink,
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, { publicKey: EMAILJS_PUBLIC_KEY });
    return { success: true, acceptLink, rejectLink };
  } catch (error) {
    console.error("EmailJS send failed:", error);
    return { success: false, message: error.text || error.message || "Failed to send email", acceptLink, rejectLink };
  }
}

export const adminRequestService = {
  async createRequest(uid, name, email) {
    const token = generateToken();
    const requestData = {
      uid,
      name,
      email,
      status: "pending",
      approvalToken: token,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseReady()) {
      await setDoc(doc(db, "adminRequests", uid), requestData);
    }

    // Also store in demo storage for fallback
    const demoRequests = JSON.parse(localStorage.getItem("pizza_demo_admin_requests") || "{}");
    demoRequests[uid] = requestData;
    localStorage.setItem("pizza_demo_admin_requests", JSON.stringify(demoRequests));

    const emailResult = await sendApprovalEmail(requestData);
    return { requestData, emailResult };
  },

  async getRequest(uid) {
    if (isFirebaseReady()) {
      const snap = await getDoc(doc(db, "adminRequests", uid));
      if (snap.exists()) return snap.data();
    }
    const demoRequests = JSON.parse(localStorage.getItem("pizza_demo_admin_requests") || "{}");
    return demoRequests[uid] || null;
  },

  async getAllPending() {
    if (isFirebaseReady()) {
      const q = query(collection(db, "adminRequests"), where("status", "==", "pending"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    }
    const demoRequests = JSON.parse(localStorage.getItem("pizza_demo_admin_requests") || "{}");
    return Object.values(demoRequests).filter((r) => r.status === "pending");
  },

  async approve(uid, token) {
    const request = await this.getRequest(uid);
    if (!request || request.approvalToken !== token) {
      throw new Error("Invalid approval token");
    }
    if (request.status !== "pending") {
      throw new Error("Request already processed");
    }

    if (isFirebaseReady()) {
      await updateDoc(doc(db, "adminRequests", uid), { status: "approved" });
      await updateDoc(doc(db, "users", uid), { role: "admin" });
    }

    const demoRequests = JSON.parse(localStorage.getItem("pizza_demo_admin_requests") || "{}");
    if (demoRequests[uid]) {
      demoRequests[uid].status = "approved";
      localStorage.setItem("pizza_demo_admin_requests", JSON.stringify(demoRequests));
    }

    const demoUserData = demoUser.getUsers()[request.email?.toLowerCase()];
    if (demoUserData) {
      demoUserData.role = "admin";
      demoUser.saveUser(request.email, demoUserData);
    }

    return { success: true, message: "Admin request approved" };
  },

  async reject(uid, token) {
    const request = await this.getRequest(uid);
    if (!request || request.approvalToken !== token) {
      throw new Error("Invalid approval token");
    }
    if (request.status !== "pending") {
      throw new Error("Request already processed");
    }

    if (isFirebaseReady()) {
      await updateDoc(doc(db, "adminRequests", uid), { status: "rejected" });
      await updateDoc(doc(db, "users", uid), { role: "rejected" });
    }

    const demoRequests = JSON.parse(localStorage.getItem("pizza_demo_admin_requests") || "{}");
    if (demoRequests[uid]) {
      demoRequests[uid].status = "rejected";
      localStorage.setItem("pizza_demo_admin_requests", JSON.stringify(demoRequests));
    }

    const demoUserData = demoUser.getUsers()[request.email?.toLowerCase()];
    if (demoUserData) {
      demoUserData.role = "rejected";
      demoUser.saveUser(request.email, demoUserData);
    }

    return { success: true, message: "Admin request rejected" };
  },

  async processAction(uid, token, action) {
    if (action === "accept") {
      return await this.approve(uid, token);
    } else if (action === "reject") {
      return await this.reject(uid, token);
    }
    throw new Error("Invalid action");
  },
};

