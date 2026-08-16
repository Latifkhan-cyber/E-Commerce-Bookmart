// ==========================================================================
// BookMart - Notifications Handler (js/notifications.js)
// ==========================================================================

import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { formatDate } from "./utils.js";

export async function fetchUserNotifications() {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
    const qSnap = await getDocs(q);
    const notifications = [];
    qSnap.forEach(docSnap => {
      notifications.push({ id: docSnap.id, ...docSnap.data() });
    });
    return notifications.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (err) {
    console.warn("Fetch notifications error:", err);
    return [];
  }
}

export async function markNotificationAsRead(notifId) {
  try {
    await updateDoc(doc(db, "notifications", notifId), { isRead: true });
  } catch (err) {
    console.warn("Mark notification read error:", err);
  }
}
