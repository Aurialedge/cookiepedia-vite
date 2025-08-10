import React, { useRef, useEffect } from 'react';
import { useSearch } from '../hooks/useSearch.js';
import './feature/css/SearchBar.css';

const SearchBar = ({ placeholder = "Search for recipes...🔍︎" }) => {
  const {
    query,
    suggestions,
    loading,
    error,
    showSuggestions,
    handleInputChange,
    handleSuggestionSelect,
    hideSuggestions,
    showSuggestionsDropdown,
    clearSearch
  } = useSearch();

  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        hideSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hideSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      hideSuggestions();
    }
    // Add more keyboard navigation logic here if needed
  };

  const highlightMatch = (text, matches) => {
    if (!matches || matches.length === 0) return text;
    
    // Simple highlighting - you can make this more sophisticated
    const match = matches[0];
    if (match.key === 'name' && match.indices) {
      const indices = match.indices[0];
      const before = text.substring(0, indices[0]);
      const highlighted = text.substring(indices[0], indices[1] + 1);
      const after = text.substring(indices[1] + 1);
      
      return (
        <>
          {before}
          <span className="search-highlight">{highlighted}</span>
          {after}
        </>
      );
    }
    
    return text;
  };

  return (
    <div className="search-container-wrapper" ref={searchRef}>
      <div className="search-input-container">
        <input
          id="search"
          className="search-input cursor-target"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={showSuggestionsDropdown}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        
        {/* Loading indicator */}
        {loading && (
          <div className="search-loading">
            <div className="search-spinner"></div>
          </div>
        )}
        
        {/* Clear button */}
        {query && (
          <button
            className="search-clear-btn"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="search-suggestions" ref={suggestionsRef}>
          {error ? (
            <div className="search-error">
              <span className="error-icon">⚠️</span>
              <span>Unable to load suggestions</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="suggestions-header">
                <span className="suggestions-title">Recipe Suggestions</span>
                <span className="suggestions-count">{suggestions.length} found</span>
              </div>
              <ul className="suggestions-list">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="suggestion-image">
                      <img 
                        src={suggestion.image} 
                        alt={suggestion.name}
                        onError={(e) => {
                          e.target.src = '/images/Recipe1.avif'; // Fallback image
                        }}
                      />
                    </div>
                    <div className="suggestion-content">
                      <div className="suggestion-name">
                        {highlightMatch(suggestion.name, suggestion.matches)}
                      </div>
                      <div className="suggestion-meta">
                        <span className="suggestion-type">{suggestion.type}</span>
                        <span className="suggestion-time">⏱️ {suggestion.cookTime}</span>
                        <span className="suggestion-difficulty">
                          {suggestion.difficulty === 'easy' ? '🟢' : 
                           suggestion.difficulty === 'medium' ? '🟡' : '🔴'} 
                          {suggestion.difficulty}
                        </span>
                        <span className="suggestion-rating">⭐ {suggestion.rating}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : query.length >= 2 ? (
            <div className="no-suggestions">
              <span className="no-results-icon">🔍</span>
              <span>No recipes found for "{query}"</span>
              <small>Try searching for cookies, brownies, or macarons</small>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
