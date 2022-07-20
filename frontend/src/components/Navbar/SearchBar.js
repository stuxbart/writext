import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom'

function SearchBar(){
    let [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');

    const onChange = (event) => {
        let filter = event.target.value;
        if (filter) {
            setSearchParams({ q:filter });
        } else {
            setSearchParams({});
        }
    }

    return (
    <form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search">
        <input 
            type="search" 
            className="form-control form-control-dark text-white bg-dark"
            placeholder="Search..." 
            aria-label="Search"
            value={searchParams.get("q") || ""}
            onChange={onChange}
        />
    </form>
    )
}

export default SearchBar