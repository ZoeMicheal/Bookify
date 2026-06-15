'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon } from 'lucide-react';

const Search = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('query') || '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            if (query) {
                params.set('query', query);
            } else {
                params.delete('query');
            }
            router.push(`/?${params.toString()}`);
        }, 500);

        return () => clearTimeout(timeout);
    }, [query, router]);

    return (
        <div className="library-search-wrapper">
            <SearchIcon className="ml-3 text-gray-400" size={18} />
            <input
                type="text"
                placeholder="Search by title or author..."
                className="library-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
};

export default Search;
