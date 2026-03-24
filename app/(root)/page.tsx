import React from 'react'
import Hero from '@/components/Hero'
import {sampleBooks} from "@/lib/constants";
import BookCard from "@/components/BookCard";

const Page = () => {
    return (
        <main className="wrapper container">
            <Hero />

            <div className="library-books-grid">
                {sampleBooks.map((book) => (
                    <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL}
                    slug={book.slug}/>
                ))}
            </div>
        </main>
    )
}
export default Page
