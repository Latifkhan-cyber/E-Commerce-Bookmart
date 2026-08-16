// ==========================================================================
// BookMart - Customer Address Management Handler (js/addresses.js)
// ==========================================================================

import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { showToast } from "./utils.js";

/**
 * Fetch addresses for logged-in user
 * @returns {Promise<Array>}
 */
export async function fetchUserAddresses() {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(collection(db, "addresses"), where("userId", "==", user.uid));
    const qSnap = await getDocs(q);
    const addresses = [];
    qSnap.forEach(docSnap => {
      addresses.push({ id: docSnap.id, ...docSnap.data() });
    });
    return addresses;
  } catch (err) {
    console.warn("Fetch addresses error:", err);
    return [];
  }
}

/**
 * Add new address
 * @param {Object} data 
 */
export async function saveAddress(data) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const addressData = {
      userId: user.uid,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      province: data.province.trim(),
      postalCode: data.postalCode.trim(),
      country: "United States",
      isDefault: data.isDefault || false,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "addresses"), addressData);
    showToast("Address saved successfully!", "success");
    return true;
  } catch (err) {
    console.error("Save address error:", err);
    showToast("Failed to save address.", "error");
    return false;
  }
}

/**
 * Delete address by ID
 * @param {string} addressId 
 */
export async function deleteAddress(addressId) {
  try {
    await deleteDoc(doc(db, "addresses", addressId));
    showToast("Address deleted.", "info");
    return true;
  } catch (err) {
    console.error("Delete address error:", err);
    showToast("Failed to delete address.", "error");
    return false;
  }
}
