import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce function to limit API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Fetch suggestions from backend
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        throw new Error(data.message || 'Failed to fetch suggestions');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 300),
    [fetchSuggestions]
  );

  // Effect to trigger search when query changes
  useEffect(() => {
    debouncedFetchSuggestions(query);
  }, [query, debouncedFetchSuggestions]);

  // Handle input change
  const handleInputChange = (value) => {
    setQuery(value);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    // You can add additional logic here, like navigating to recipe page
    console.log('Selected recipe:', suggestion);
  };

  // Hide suggestions
  const hideSuggestions = () => {
    setShowSuggestions(false);
  };

  // Show suggestions
  const showSuggestionsDropdown = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
  };

  return {
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
  };
};

// Hook for fetching popular searches
export const usePopularSearches = () => {
  const [popularSearches, setPopularSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularSearches = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/search/popular`);
        const data = await response.json();
        
        if (data.success) {
          setPopularSearches(data.popular);
        }
      } catch (err) {
        console.error('Error fetching popular searches:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularSearches();
  }, []);

  return { popularSearches, loading, error };
};

// Hook for fetching categories
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/search/categories`);
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
