// ==========================================================================
// BookMart - Sample Dataset Seeder (js/seed-data.js)
// ==========================================================================

export const sampleCategories = [
  {
    id: "cat-prog",
    name: "Programming",
    slug: "programming",
    description: "Master languages, software craftsmanship, and design patterns.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    bookCount: 5
  },
  {
    id: "cat-cs",
    name: "Computer Science",
    slug: "computer-science",
    description: "Algorithms, system architecture, data structures, and computer theory.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80",
    bookCount: 4
  },
  {
    id: "cat-bus",
    name: "Business",
    slug: "business",
    description: "Leadership, economics, startup strategies, and financial freedom.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
    bookCount: 3
  },
  {
    id: "cat-fic",
    name: "Fiction",
    slug: "fiction",
    description: "Bestselling novels, timeless classics, and captivating storytelling.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
    bookCount: 3
  },
  {
    id: "cat-med",
    name: "Medical",
    slug: "medical",
    description: "Anatomy, clinical science, pharmacology, and medical handbooks.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80",
    bookCount: 2
  },
  {
    id: "cat-math",
    name: "Mathematics",
    slug: "mathematics",
    description: "Calculus, statistics, linear algebra, and mathematical logic.",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80",
    bookCount: 2
  },
  {
    id: "cat-sci",
    name: "Science",
    slug: "science",
    description: "Physics, quantum mechanics, astronomy, and nature.",
    image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&q=80",
    bookCount: 2
  },
  {
    id: "cat-hist",
    name: "History",
    slug: "history",
    description: "World civilizations, historic chronicles, and military history.",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80",
    bookCount: 2
  }
];

export const sampleAuthors = [
  {
    id: "auth-martin",
    name: "Robert C. Martin",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
    bio: "Renowned software engineer known as 'Uncle Bob', co-author of the Agile Manifesto.",
    bookCount: 3
  },
  {
    id: "auth-fowler",
    name: "Martin Fowler",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    bio: "British software developer, author, and speaker on software architecture.",
    bookCount: 2
  },
  {
    id: "auth-cormen",
    name: "Thomas H. Cormen",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
    bio: "Professor of Computer Science at Dartmouth College and algorithms authority.",
    bookCount: 1
  },
  {
    id: "auth-clear",
    name: "James Clear",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80",
    bio: "Author and speaker focused on habits, decision-making, and continuous improvement.",
    bookCount: 1
  },
  {
    id: "auth-orwell",
    name: "George Orwell",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
    bio: "English novelist, essayist, journalist, and critic noted for 1984 and Animal Farm.",
    bookCount: 2
  }
];

export const samplePublishers = [
  {
    id: "pub-prentice",
    name: "Prentice Hall",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80",
    description: "Major educational publisher specializing in computer science and engineering.",
    bookCount: 6
  },
  {
    id: "pub-oreilly",
    name: "O'Reilly Media",
    logo: "https://images.unsplash.com/photo-1542744094-3a31b272c490?w=200&q=80",
    description: "Leading technology books publisher famed for animal covers.",
    bookCount: 7
  },
  {
    id: "pub-mit",
    name: "MIT Press",
    logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&q=80",
    description: "University press affiliated with Massachusetts Institute of Technology.",
    bookCount: 4
  },
  {
    id: "pub-penguin",
    name: "Penguin Random House",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80",
    description: "The world's largest trade book publisher.",
    bookCount: 5
  }
];

export const sampleBooks = [
  {
    id: "book-001",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn't have to be that way.",
    authorId: "auth-martin",
    authorName: "Robert C. Martin",
    publisherId: "pub-prentice",
    publisherName: "Prentice Hall",
    categoryId: "cat-prog",
    categoryName: "Programming",
    isbn: "9780132350884",
    price: 49.99,
    discountPrice: 39.99,
    stock: 25,
    soldCount: 142,
    rating: 4.8,
    reviewCount: 38,
    pages: 464,
    language: "English",
    publicationYear: 2008,
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80"
    ]
  },
  {
    id: "book-002",
    title: "Introduction to Algorithms (4th Edition)",
    description: "A comprehensive update of the leading algorithms text, with new material on matchings in bipartite graphs, online algorithms, machine learning, and more.",
    authorId: "auth-cormen",
    authorName: "Thomas H. Cormen",
    publisherId: "pub-mit",
    publisherName: "MIT Press",
    categoryId: "cat-cs",
    categoryName: "Computer Science",
    isbn: "9780262046305",
    price: 95.00,
    discountPrice: 82.50,
    stock: 12,
    soldCount: 89,
    rating: 4.9,
    reviewCount: 52,
    pages: 1312,
    language: "English",
    publicationYear: 2022,
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80",
    additionalImages: []
  },
  {
    id: "book-003",
    title: "Refactoring: Improving the Design of Existing Code",
    description: "For more than twenty years, experienced programmers worldwide have relied on Martin Fowler's Refactoring to improve the design of existing code and to enhance software maintainability.",
    authorId: "auth-fowler",
    authorName: "Martin Fowler",
    publisherId: "pub-prentice",
    publisherName: "Prentice Hall",
    categoryId: "cat-prog",
    categoryName: "Programming",
    isbn: "9780134757599",
    price: 54.99,
    discountPrice: 44.99,
    stock: 18,
    soldCount: 96,
    rating: 4.7,
    reviewCount: 29,
    pages: 448,
    language: "English",
    publicationYear: 2018,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80",
    additionalImages: []
  },
  {
    id: "book-004",
    title: "Atomic Habits: An Easy & Proven Way to Build Good Habits",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies.",
    authorId: "auth-clear",
    authorName: "James Clear",
    publisherId: "pub-penguin",
    publisherName: "Penguin Random House",
    categoryId: "cat-bus",
    categoryName: "Business",
    isbn: "9780735211292",
    price: 27.00,
    discountPrice: 18.99,
    stock: 50,
    soldCount: 310,
    rating: 4.9,
    reviewCount: 114,
    pages: 320,
    language: "English",
    publicationYear: 2018,
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80",
    additionalImages: []
  },
  {
    id: "book-005",
    title: "1984 (Nineteen Eighty-Four)",
    description: "Winston Smith rewrites history for the Ministry of Truth, but secretly rebels against the totalitarian Big Brother in a world of omnipresent surveillance.",
    authorId: "auth-orwell",
    authorName: "George Orwell",
    publisherId: "pub-penguin",
    publisherName: "Penguin Random House",
    categoryId: "cat-fic",
    categoryName: "Fiction",
    isbn: "9780451524935",
    price: 19.99,
    discountPrice: 12.99,
    stock: 35,
    soldCount: 220,
    rating: 4.8,
    reviewCount: 95,
    pages: 328,
    language: "English",
    publicationYear: 1949,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80",
    additionalImages: []
  },
  {
    id: "book-006",
    title: "Clean Architecture: A Craftsman's Guide to Software Structure",
    description: "By applying universal rules of software architecture, Uncle Bob shows you how to dramatic improve developer productivity and software longevity.",
    authorId: "auth-martin",
    authorName: "Robert C. Martin",
    publisherId: "pub-prentice",
    publisherName: "Prentice Hall",
    categoryId: "cat-prog",
    categoryName: "Programming",
    isbn: "9780134494166",
    price: 44.99,
    discountPrice: 36.00,
    stock: 15,
    soldCount: 105,
    rating: 4.6,
    reviewCount: 31,
    pages: 432,
    language: "English",
    publicationYear: 2017,
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&q=80",
    additionalImages: []
  },
  {
    id: "book-007",
    title: "Designing Data-Intensive Applications",
    description: "Data is at the center of many challenges in system design today. Difficult issues such as scalability, consistency, reliability, efficiency, and maintainability must be figured out.",
    authorId: "auth-fowler",
    authorName: "Martin Fowler",
    publisherId: "pub-oreilly",
    publisherName: "O'Reilly Media",
    categoryId: "cat-cs",
    categoryName: "Computer Science",
    isbn: "9781449373320",
    price: 59.99,
    discountPrice: 49.99,
    stock: 30,
    soldCount: 180,
    rating: 4.9,
    reviewCount: 78,
    pages: 616,
    language: "English",
    publicationYear: 2017,
    coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80",
    additionalImages: []
  },
  {
    id: "book-008",
    title: "Gray's Anatomy for Students (4th Edition)",
    description: "Easy to read, superbly illustrated, and clinically relevant, Gray's Anatomy for Students is your go-to text for essential information in human anatomy.",
    authorId: "auth-cormen",
    authorName: "Thomas H. Cormen",
    publisherId: "pub-prentice",
    publisherName: "Prentice Hall",
    categoryId: "cat-med",
    categoryName: "Medical",
    isbn: "9780323393041",
    price: 89.99,
    discountPrice: 74.99,
    stock: 8,
    soldCount: 45,
    rating: 4.8,
    reviewCount: 19,
    pages: 1160,
    language: "English",
    publicationYear: 2019,
    coverImage: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500&q=80",
    additionalImages: []
  },
  {
    id: "book-009",
    title: "Calculus: Early Transcendentals",
    description: "Success in your calculus course starts here! James Stewart's CALCULUS texts are world-wide best-sellers for a reason: they are clear, accurate, and filled with relevant real-world examples.",
    authorId: "auth-cormen",
    authorName: "Thomas H. Cormen",
    publisherId: "pub-mit",
    publisherName: "MIT Press",
    categoryId: "cat-math",
    categoryName: "Mathematics",
    isbn: "9781285741550",
    price: 110.00,
    discountPrice: 92.00,
    stock: 10,
    soldCount: 60,
    rating: 4.5,
    reviewCount: 22,
    pages: 1368,
    language: "English",
    publicationYear: 2015,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80",
    additionalImages: []
  },
  {
    id: "book-010",
    title: "A Brief History of Time",
    description: "Stephen Hawking's landmark volume explores the cosmos, black holes, general relativity, and the origin of the universe in accessible prose.",
    authorId: "auth-orwell",
    authorName: "George Orwell",
    publisherId: "pub-penguin",
    publisherName: "Penguin Random House",
    categoryId: "cat-sci",
    categoryName: "Science",
    isbn: "9780553380163",
    price: 18.00,
    discountPrice: 14.50,
    stock: 22,
    soldCount: 135,
    rating: 4.7,
    reviewCount: 64,
    pages: 212,
    language: "English",
    publicationYear: 1988,
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80",
    additionalImages: []
  },
  {
    id: "book-011",
    title: "Sapiens: A Brief History of Humankind",
    description: "Yuval Noah Harari explores how Homo sapiens conquered Earth, covering cognitive, agricultural, and scientific revolutions.",
    authorId: "auth-clear",
    authorName: "James Clear",
    publisherId: "pub-penguin",
    publisherName: "Penguin Random House",
    categoryId: "cat-hist",
    categoryName: "History",
    isbn: "9780062316097",
    price: 24.99,
    discountPrice: 17.99,
    stock: 40,
    soldCount: 290,
    rating: 4.9,
    reviewCount: 108,
    pages: 464,
    language: "English",
    publicationYear: 2015,
    coverImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&q=80",
    additionalImages: []
  },
  {
    id: "book-012",
    title: "You Don't Know JS Yet: Scope & Closures",
    description: "Deep dive into JavaScript mechanism: scopes, lexical scope, block scoping, hoisting, and closures.",
    authorId: "auth-martin",
    authorName: "Robert C. Martin",
    publisherId: "pub-oreilly",
    publisherName: "O'Reilly Media",
    categoryId: "cat-prog",
    categoryName: "Programming",
    isbn: "9781838832049",
    price: 29.99,
    discountPrice: 22.99,
    stock: 14,
    soldCount: 75,
    rating: 4.8,
    reviewCount: 27,
    pages: 280,
    language: "English",
    publicationYear: 2020,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80",
    additionalImages: []
  }
];

export const sampleCoupons = [
  {
    id: "coup-100",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrder: 20,
    maxDiscount: 15,
    expirationDate: "2030-12-31",
    usageLimit: 1000,
    usageCount: 42,
    active: true
  },
  {
    id: "coup-200",
    code: "SALE20",
    discountType: "percentage",
    discountValue: 20,
    minOrder: 50,
    maxDiscount: 30,
    expirationDate: "2030-12-31",
    usageLimit: 500,
    usageCount: 18,
    active: true
  },
  {
    id: "coup-300",
    code: "READ50",
    discountType: "fixed",
    discountValue: 5,
    minOrder: 30,
    maxDiscount: 5,
    expirationDate: "2030-12-31",
    usageLimit: 200,
    usageCount: 9,
    active: true
  }
];

/**
 * Seed Firestore Database with Sample Data
 * @param {import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js").Firestore} db 
 */
export async function seedFirestoreDatabase(db) {
  const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  
  console.log("Seeding categories...");
  for (const cat of sampleCategories) {
    await setDoc(doc(db, "categories", cat.id), cat);
  }

  console.log("Seeding authors...");
  for (const auth of sampleAuthors) {
    await setDoc(doc(db, "authors", auth.id), auth);
  }

  console.log("Seeding publishers...");
  for (const pub of samplePublishers) {
    await setDoc(doc(db, "publishers", pub.id), pub);
  }

  console.log("Seeding books...");
  for (const bk of sampleBooks) {
    await setDoc(doc(db, "books", bk.id), bk);
  }

  console.log("Seeding coupons...");
  for (const cp of sampleCoupons) {
    await setDoc(doc(db, "coupons", cp.id), cp);
  }

  console.log("Firestore database seeded successfully!");
}
