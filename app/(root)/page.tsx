import React from 'react'
import Hero from '@/components/Hero'
import BookCard from "@/components/BookCard";
import {getAllBooks} from "@/lib/actions/book.actions";
import Search from "@/components/Search";

interface PageProps {
    searchParams: Promise<{ query?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
    const { query } = await searchParams;
    const bookResults = await getAllBooks(query)
    const books = bookResults.success ? bookResults.data ?? [] : []
    return (
        <main className="wrapper container">
            <Hero />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                    {query ? `Search results for "${query}"` : "Recent Books"}
                </h2>
                <Search />
            </div>

            {books.length > 0 ? (
                <div className="library-books-grid">
                    {books.map((book) => (
                        <BookCard key={book._id} id={book._id} title={book.title} author={book.author} coverURL={book.coverURL || "/placeholder.png"}
                                  slug={book.slug}/>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-xl text-gray-500 mb-4">No books found matching your search.</p>
                </div>
            )}
        </main>
    )
}
export default Page
