import { Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FilterBarProps {
    onSearch: (query: string) => void;
    onSort: (sort: 'date' | 'title') => void;
    onFilterIngredient: (ingredient: string | null) => void;
    availableIngredients: string[];
}

export function FilterBar({ onSearch, onSort, onFilterIngredient, availableIngredients }: FilterBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, onSearch]);

    const handleIngredientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value === 'all' ? null : e.target.value;
        setSelectedIngredient(val);
        onFilterIngredient(val);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedIngredient(null);
        onFilterIngredient(null);
        onSearch('');
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search recipes..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Filters Group */}
            <div className="flex space-x-2">
                {/* Ingredient Filter */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter size={16} className="text-gray-400" />
                    </div>
                    <select
                        value={selectedIngredient || 'all'}
                        onChange={handleIngredientChange}
                        className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none hover:bg-white transition-colors cursor-pointer"
                        style={{ maxWidth: '160px' }}
                    >
                        <option value="all">All Ingredients</option>
                        {availableIngredients.map(ing => (
                            <option key={ing} value={ing}>{ing}</option>
                        ))}
                    </select>
                </div>

                {/* Sort */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ArrowUpDown size={16} className="text-gray-400" />
                    </div>
                    <select
                        onChange={(e) => onSort(e.target.value as 'date' | 'title')}
                        className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none hover:bg-white transition-colors cursor-pointer"
                    >
                        <option value="date">Newest First</option>
                        <option value="title">Name (A-Z)</option>
                    </select>
                </div>

                {(searchQuery || selectedIngredient) && (
                    <button
                        onClick={clearFilters}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
