// ==========================================================================
// BookMart - Customer Reviews & Ratings Handler (js/reviews.js)
// ==========================================================================

import { collection, query, where, getDocs, addDoc, doc, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { renderStarRating, formatDate, showToast } from "./utils.js";

/**
 * Check if user has purchased the given book (Verified Purchase check)
 * @param {string} userId 
 * @param {string} bookId 
 * @returns {Promise<boolean>}
 */
export async function hasPurchasedBook(userId, bookId) {
  if (!userId || !bookId) return false;

  try {
    const q = query(
      collection(db, "orders"),
      where("customerId", "==", userId)
    );
    const qSnap = await getDocs(q);
    
    for (const docSnap of qSnap.docs) {
      const order = docSnap.data();
      if (order.orderStatus !== "Cancelled" && (order.items || []).some(item => item.bookId === bookId)) {
        return true;
      }
    }
  } catch (err) {
    console.warn("Verified purchase check error:", err);
  }
  return false;
}

/**
 * Fetch all reviews for a book
 * @param {string} bookId 
 * @returns {Promise<Array>}
 */
export async function fetchBookReviews(bookId) {
  if (!bookId) return [];

  try {
    const q = query(collection(db, "reviews"), where("bookId", "==", bookId));
    const qSnap = await getDocs(q);
    const reviews = [];
    qSnap.forEach(docSnap => {
      reviews.push({ id: docSnap.id, ...docSnap.data() });
    });
    return reviews.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (err) {
    console.warn("Fetch reviews error:", err);
    return [];
  }
}

/**
 * Submit new customer review
 * @param {string} bookId 
 * @param {number} rating (1-5)
 * @param {string} comment 
 */
export async function submitReview(bookId, rating, comment) {
  const user = auth.currentUser;
  if (!user) {
    showToast("Please log in to submit a review.", "warning");
    return;
  }

  if (!rating || rating < 1 || rating > 5) {
    showToast("Please select a star rating between 1 and 5.", "warning");
    return;
  }

  if (!comment || comment.trim().length < 5) {
    showToast("Please write a review comment (minimum 5 characters).", "warning");
    return;
  }

  const isVerified = await hasPurchasedBook(user.uid, bookId);

  try {
    const reviewData = {
      userId: user.uid,
      userName: user.displayName || user.email.split('@')[0],
      userImage: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`,
      bookId: bookId,
      rating: Number(rating),
      comment: comment.trim(),
      isVerifiedPurchase: isVerified,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "reviews"), reviewData);

    // Recalculate and update book average rating
    const allReviews = await fetchBookReviews(bookId);
    const newRatingCount = allReviews.length;
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / newRatingCount;

    await updateDoc(doc(db, "books", bookId), {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: newRatingCount
    });

    showToast("Thank you! Your review has been published.", "success");
    return true;
  } catch (err) {
    console.error("Submit review error:", err);
    showToast("Failed to post review. Please try again.", "error");
    return false;
  }
}
