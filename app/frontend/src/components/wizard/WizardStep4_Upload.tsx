import { useState } from 'react';
import { useWizardStore } from '../../store/wizardStore';
import { api } from '../../utils/axios';
import { useAuth } from '../../hooks/useAuth';
import { Check, CloudUpload, Loader2, RotateCcw } from 'lucide-react';

export function WizardStep4_Upload() {
    const { recipeId, reset } = useWizardStore();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async () => {
        if (!user || !recipeId) return;

        setLoading(true);
        setError(null);
        try {
            await api.post('/recipes/upload', {
                recipe_id: recipeId,
                user_id: user.id
            });
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Check size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Recipe Uploaded!</h2>
                    <p className="text-gray-600 mt-2">Your recipe is now available on Cookidoo.</p>
                </div>
                <button
                    onClick={reset}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                    <RotateCcw size={18} className="mr-2" />
                    Start New Recipe
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Upload to Cookidoo</h2>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <CloudUpload size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ready to Upload</h3>
                    <p className="text-gray-600 max-w-md mt-2">
                        This will create a new recipe or update an existing one on your Cookidoo account.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-center pt-8">
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="flex items-center px-8 py-4 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <CloudUpload className="mr-2" />
                            Upload to Cookidoo
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
