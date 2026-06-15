'use client';

import React, { useTransition } from 'react'
import Link from "next/link";
import {BookCardProps} from "@/types";
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { deleteBook } from '@/lib/actions/book.actions';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

const BookCard = ({ id, title, author, coverURL, slug } : BookCardProps) => {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            startTransition(async () => {
                const result = await deleteBook(id);
                if (result.success) {
                    toast.success("Book deleted successfully");
                } else {
                    toast.error("Failed to delete book");
                }
            });
        }
    };

    return (
        <div className="relative group">
            <Link href={`/books/${slug}`}>
                <article className="book-card">
                    <figure className="book-card-figure">
                        <div className="book-card-cover-wrapper">
                            <Image src={coverURL} alt={title} width={133} height={200} className="book-card-cover" />
                        </div>
                        <figcaption className="book-card-meta">
                            <h3 className="book-card-title">{title}</h3>
                            <p className="book-card-author">{author}</p>
                        </figcaption>
                    </figure>
                </article>
            </Link>
            
            <button 
                onClick={handleDelete}
                disabled={isPending}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                title="Delete book"
            >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
            </button>
        </div>
    )
}
export default BookCard
