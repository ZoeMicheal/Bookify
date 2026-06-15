'use server';
import {CreateBook, TextSegment} from "@/types";
import {connectToDatabase} from "@/database/mongoose";
import {generateSlug, serializeData} from "@/lib/utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book.segment.model";
import { del } from "@vercel/blob";
import mongoose from "mongoose";
import {revalidatePath} from "next/cache";


export const getAllBooks = async () => {
    try {
        await connectToDatabase();

        const books = await Book.find({}).sort({createdAt: -1}).lean();

        return {
            success: true,
            data: serializeData(books)
        }
    } catch (e) {
        console.error('Error connecting to database.', e);
        return {
            success: false, error: e
        }
    }
}

export const checkBookExists = async (title: string) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(title);
        const existingBook = await Book.findOne({slug}).lean();
        if(existingBook) {
            return{
                exists: true,
                book: serializeData(existingBook),
            }
        }
        return {
            exists: false,
        }
    } catch (e) {
        console.error('Error checking book exists.', e);
        return {
            exists: false,
            error: e,
        }
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(data.title);

        const existingBook = await Book.findOne({slug}).lean();

        if(existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true,
            }
        }

        // Todo: Check subscription limits before creating a book

        const book = await Book.create({...data, slug, totalSegments: 0});

        revalidatePath('/')

        return {
            success: true,
            data: serializeData(book),
        }
    } catch (e) {
        console.error('Error creating book', e);
        return {
            success: false,
            error: e,
        }
    }

}

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
    try {
        await connectToDatabase();

        console.log('Saving book segments...');

        const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount}) => ({
            clerkId, bookId, content: text, segmentIndex, pageNumber, wordCount,
        }));

        await BookSegment.insertMany(segmentsToInsert);

        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });

        console.log('Book segments saved successfully.');

        return{
            success: true,
            data: { segmentsCreated: segments.length }
        }
    } catch (e) {
        console.error('Error saving book segments', e);

        await BookSegment.deleteMany({bookId});
        await Book.findByIdAndDelete(bookId);
        console.log('Deleted book segments and book due to failure to save segments.');
        return {
            success: false,
            error: e,
        }

    }

}

export const getBookBySlug = async (slug: string) => {
    try {
        await connectToDatabase();

        const book = await Book.findOne({slug}).lean();

        if (!book) {
            return {
                success: false,
                error: 'Book not found'
            }
        }

        return {
            success: true,
            data: serializeData(book)
        }
    } catch (e) {
        console.error('Error fetching book by slug', e);
        return {
            success: false,
            error: e
        }
    }
}

export const deleteBookBlob = async (url: string) => {
    try {
        await del(url);
        return { success: true };
    } catch (error) {
        console.error('Error deleting blob', error);
        return { success: false, error };
    }
}

export const deleteBook = async (bookId: string) => {
    try {
        await connectToDatabase();

        const book = await Book.findById(bookId);

        if (!book) {
            return { success: false, error: 'Book not found' };
        }

        // 1. Delete blobs from Vercel storage
        const deleteBlobs = [];
        if (book.fileURL) deleteBlobs.push(del(book.fileURL));
        if (book.coverURL) deleteBlobs.push(del(book.coverURL));

        await Promise.all(deleteBlobs);

        // 2. Delete book segments from database
        await BookSegment.deleteMany({ bookId });

        // 3. Delete book from database
        await Book.findByIdAndDelete(bookId);

        revalidatePath('/');

        return { success: true };
    } catch (e) {
        console.error('Error deleting book', e);
        return { success: false, error: e };
    }
}

export const searchBookSegments = async (bookId: string, query: string, limit: number = 3) => {
    try {
        await connectToDatabase();

        console.log(`Searching for: "${query}" in book ${bookId}`);

        const bookObjectId = new mongoose.Types.ObjectId(bookId);

        const segments = await BookSegment.find(
            { bookId: bookObjectId, $text: { $search: query } },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .lean();

        return {
            success: true,
            data: serializeData(segments)
        }
    } catch (e) {
        console.error('Error searching book segments', e);
        return {
            success: false,
            error: e
        }
    }
}