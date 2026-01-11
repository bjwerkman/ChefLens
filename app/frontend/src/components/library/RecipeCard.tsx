import { Share2, ExternalLink, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface RecipeCardProps {
    recipe: any; // Type 'any' for now, ideally interface from models
    onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
    const { user } = useAuth();

    // Formatting helper
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Unknown Date';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleShare = async () => {
        const shareData = {
            title: recipe.title,
            text: `Check out this recipe: ${recipe.title}\n${recipe.description || ''}`,
            url: recipe.source_url || window.location.href // Fallback to current app link if no source
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for desktop browsers that don't support share
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this recipe? This cannot be undone.')) {
            onDelete(recipe.id);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group relative">
            {/* Delete Button (Visible on Hover) */}
            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Recipe"
            >
                <Trash2 size={16} />
            </button>

            {/* Image Placeholder */}
            <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                {/* We could use a random food pattern or gradient here */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-100" />
                <span className="relative text-4xl text-gray-300">🍲</span>

                {/* Quick stats badges over image */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                    {recipe.source_url && (
                        <a href={recipe.source_url} target="_blank" rel="noopener noreferrer" className="bg-white/90 backdrop-blur p-1.5 rounded-full text-blue-600 hover:text-blue-700 shadow-sm" title="View Source">
                            <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={recipe.title}>
                        {recipe.title}
                    </h3>
                </div>

                <p className="text-gray-500 text-xs line-clamp-3 mb-4 flex-1">
                    {recipe.parsed_data?.description || recipe.description || "No description available."}
                </p>

                {/* Footer Metadata */}
                <div className="border-t pt-4 mt-auto flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        <span>{formatDate(recipe.created_at)}</span>
                    </div>

                    <button
                        onClick={handleShare}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors p-2 -mr-2 rounded-lg hover:bg-indigo-50"
                    >
                        <Share2 size={16} className="mr-1" />
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
}
