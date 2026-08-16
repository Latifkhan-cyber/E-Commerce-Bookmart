// ==========================================================================
// BookMart - Authentication Controller (js/auth.js)
// ==========================================================================

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  confirmPasswordReset,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";
import { showToast } from "./utils.js";

/**
 * Register a new user with Email/Password & initialize Firestore profile
 * @param {string} name 
 * @param {string} email 
 * @param {string} phone 
 * @param {string} password 
 * @returns {Promise<Object>} User profile object
 */
export async function registerUser(name, email, phone, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfile = {
      uid: user.uid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      role: "CUSTOMER", // Default role
      profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E293B&color=fff`,
      isBlocked: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save profile to Firestore users collection
    await setDoc(doc(db, "users", user.uid), userProfile);
    showToast("Account registered successfully!", "success");
    return userProfile;
  } catch (error) {
    console.error("Error registering user:", error);
    let errorMsg = "Registration failed. Please try again.";
    if (error.code === "auth/email-already-in-use") {
      errorMsg = "An account with this email already exists.";
    } else if (error.code === "auth/weak-password") {
      errorMsg = "Password should be at least 6 characters.";
    } else if (error.code === "auth/invalid-email") {
      errorMsg = "Please enter a valid email address.";
    }
    showToast(errorMsg, "error");
    throw new Error(errorMsg);
  }
}

/**
 * Log in an existing user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} User profile
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user profile from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Fallback profile if Firestore doc missing
      const fallbackProfile = {
        uid: user.uid,
        name: user.displayName || "User",
        email: user.email,
        phone: "",
        role: "CUSTOMER",
        profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=1E293B&color=fff`,
        isBlocked: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(userDocRef, fallbackProfile);
      return fallbackProfile;
    }

    const profileData = userDocSnap.data();

    if (profileData.isBlocked) {
      await signOut(auth);
      showToast("Your account has been suspended. Please contact support.", "error");
      throw new Error("ACCOUNT_BLOCKED");
    }

    showToast(`Welcome back, ${profileData.name}!`, "success");
    return profileData;
  } catch (error) {
    console.error("Login error:", error);
    let errorMsg = "Login failed. Please check your credentials.";
    if (error.message === "ACCOUNT_BLOCKED") {
      errorMsg = "Your account is blocked.";
    } else if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      errorMsg = "Invalid email or password.";
    } else if (error.code === "auth/too-many-requests") {
      errorMsg = "Too many failed attempts. Please try again later.";
    }
    showToast(errorMsg, "error");
    throw new Error(errorMsg);
  }
}

/**
 * Log out current authenticated user
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    showToast("Logged out successfully", "info");
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 500);
  } catch (error) {
    console.error("Logout error:", error);
    showToast("Error signing out", "error");
  }
}

/**
 * Send Password Reset Email
 * @param {string} email 
 */
export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    showToast("Password reset email sent! Check your inbox.", "success");
  } catch (error) {
    console.error("Password reset error:", error);
    let errorMsg = "Failed to send password reset email.";
    if (error.code === "auth/user-not-found") {
      errorMsg = "No account found with this email address.";
    } else if (error.code === "auth/invalid-email") {
      errorMsg = "Please enter a valid email address.";
    }
    showToast(errorMsg, "error");
    throw new Error(errorMsg);
  }
}

/**
 * Reset password using OOB Action Code
 * @param {string} oobCode 
 * @param {string} newPassword 
 */
export async function resetPasswordWithCode(oobCode, newPassword) {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    showToast("Password reset successful! You can now log in.", "success");
  } catch (error) {
    console.error("Reset password with code error:", error);
    showToast("Invalid or expired password reset link.", "error");
    throw error;
  }
}

/**
 * Get current user profile from Firestore
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUserProfile() {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  try {
    const userDocSnap = await getDoc(doc(db, "users", currentUser.uid));
    if (userDocSnap.exists()) {
      return userDocSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Listen to Authentication State Changes
 * @param {Function} callback 
 */
export function onAuthChange(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await getCurrentUserProfile();
      callback(user, profile);
    } else {
      callback(null, null);
    }
  });
}
