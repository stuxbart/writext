import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchInput.scss";
import { useSearchQuery } from "../../hooks";

type SearchInputProps = {
  label?: string;
  placeholder?: string;
};

function SearchInput({
  label = "",
  placeholder = "",
}: SearchInputProps): JSX.Element {
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useSearchQuery();

  useEffect(() => {
    setSearchText(searchQuery);
  }, [searchQuery]);

  const onSearchChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchText(e.target.value);
    setSearchQuery(query);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      onSubmit(e);
    }
  };

  const canSubmit = () => searchText.length !== 0;

  return (
    <form
      className="search__form"
      onSubmit={(e) => canSubmit() && onSubmit(e)}
      onKeyDown={onKeyDown}
    >
      <div className="form__field form__field--action ">
        <label className="form__field-label" htmlFor="#search-input">
          {label}
        </label>

        <div className="form__field-input-action-wrapper">
          <input
            id="search-input"
            className="form__field-input"
            type="text"
            placeholder={placeholder}
            value={searchText}
            onChange={onSearchChanged}
          />

          <button
            type="submit"
            className="form__field-action"
            onClick={(e) => canSubmit() && onSubmit(e)}
          >
            <FaSearch />
          </button>
        </div>
      </div>
    </form>
  );
}

export default SearchInput;
