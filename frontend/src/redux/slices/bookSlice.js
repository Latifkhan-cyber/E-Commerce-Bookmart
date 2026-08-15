import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchBooks = createAsyncThunk('books/fetchBooks', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get('/books', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchBookDetails = createAsyncThunk('books/fetchBookDetails', async (idOrSlug, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get(`/books/${idOrSlug}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchCategories = createAsyncThunk('books/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get('/categories');
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchAuthors = createAsyncThunk('books/fetchAuthors', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get('/authors');
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchPublishers = createAsyncThunk('books/fetchPublishers', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get('/publishers');
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const bookSlice = createSlice({
  name: 'books',
  initialState: {
    books: [],
    page: 1,
    pages: 1,
    totalBooks: 0,
    currentBook: null,
    categories: [],
    authors: [],
    publishers: [],
    loading: false,
    detailsLoading: false,
    error: null,
  },
  reducers: {
    clearBookDetails: (state) => {
      state.currentBook = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBooks
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.books;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.totalBooks = action.payload.totalBooks;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchBookDetails
      .addCase(fetchBookDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchBookDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchBookDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })
      // categories, authors, publishers
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.authors = action.payload;
      })
      .addCase(fetchPublishers.fulfilled, (state, action) => {
        state.publishers = action.payload;
      });
  },
});

export const { clearBookDetails } = bookSlice.actions;
export default bookSlice.reducer;
