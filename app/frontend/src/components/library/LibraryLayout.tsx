import { useState, useEffect, useMemo } from 'react';
import { api } from '../../utils/axios';
import { useAuth } from '../../hooks/useAuth';
import { RecipeCard } from './RecipeCard';
import { RecipeDetail } from './RecipeDetail';
import { FilterBar } from './FilterBar';
import { Loader2, BookOpen } from 'lucide-react';

export function LibraryLayout() {
    const { user } = useAuth();
    const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState<'date' | 'title'>('date');
    const [ingredientFilter, setIngredientFilter] = useState<string | null>(null);

    // Fetch Recipes
    useEffect(() => {
        if (!user) return;

        const fetchRecipes = async () => {
            try {
                const response = await api.get('/recipes/', {
                    params: { user_id: user.id }
                });
                setRecipes(response.data);
            } catch (err) {
                console.error("Failed to load recipes", err);
                setError("Could not load your recipes.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [user]);

    // Derived State: Available Ingredients (for filter dropdown)
    // Flatten all ingredient names, dedup, and sort
    const availableIngredients = useMemo(() => {
        const allIngs = new Set<string>();
        recipes.forEach(r => {
            r.parsed_data.ingredients?.forEach((i: any) => {
                if (i.name) allIngs.add(i.name.toLowerCase());
            });
        });
        return Array.from(allIngs).sort();
    }, [recipes]);

    // Derived State: Filtered & Sorted Recipes
    const filteredRecipes = useMemo(() => {
        let result = [...recipes];

        // 1. Search (Title or Description)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.title?.toLowerCase().includes(q) ||
                r.parsed_data.description?.toLowerCase().includes(q)
            );
        }

        // 2. Ingredient Filter
        if (ingredientFilter) {
            const filter = ingredientFilter.toLowerCase();
            result = result.filter(r =>
                r.parsed_data.ingredients?.some((i: any) => i.name?.toLowerCase().includes(filter))
            );
        }

        // 3. Sort
        result.sort((a, b) => {
            if (sortMode === 'date') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else {
                return (a.title || '').localeCompare(b.title || '');
            }
        });

        return result;
    }, [recipes, searchQuery, sortMode, ingredientFilter]);

    // Delete Handler
    const handleDelete = async (recipeId: string) => {
        // Prevent event propagation if triggered from card (though Card handles it separately mostly)
        try {
            await api.delete(`/recipes/${recipeId}`, {
                params: { user_id: user?.id }
            });
            // Update local state
            setRecipes(prev => prev.filter(r => r.id !== recipeId));
            // Close detail view if deleted recipe was open
            if (selectedRecipe?.id === recipeId) {
                setSelectedRecipe(null);
            }
        } catch (err) {
            console.error("Failed to delete recipe", err);
            alert("Failed to delete recipe. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl">
                <p>{error}</p>
            </div>
        );
    }

    // Detail View Logic
    if (selectedRecipe) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Sticky Header Container */}
            <div className="sticky top-0 z-10 bg-gray-50 pt-4 pb-4 -mt-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <BookOpen className="mr-3 text-indigo-600" />
                        My Recipe Library
                    </h1>
                    <p className="mt-2 text-gray-600">Access and manage your converted Thermomix recipes.</p>
                </div>

                {/* Filter Bar */}
                <FilterBar
                    onSearch={setSearchQuery}
                    onSort={setSortMode}
                    onFilterIngredient={setIngredientFilter}
                    availableIngredients={availableIngredients}
                />
            </div>

            {/* Grid */}
            {filteredRecipes.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No recipes found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map((recipe) => (
                        <div key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="cursor-pointer">
                            <RecipeCard recipe={recipe} onDelete={handleDelete} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
