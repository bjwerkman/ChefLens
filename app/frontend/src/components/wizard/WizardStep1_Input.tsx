import { useState } from 'react';
import { useWizardStore } from '../../store/wizardStore';
import { api } from '../../utils/axios';
import { ArrowRight, Link, Type } from 'lucide-react';

export function WizardStep1_Input() {
    const { rawText, url, setRawText, setUrl, setRecipeJson, setStep } = useWizardStore();
    const [mode, setMode] = useState<'text' | 'url'>('url');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleParse = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = mode === 'text' ? { text: rawText } : { url: url };
            const response = await api.post('/recipes/parse', payload);
            setRecipeJson(response.data);
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to parse recipe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex space-x-4 border-b pb-4">
                <button
                    onClick={() => setMode('url')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${mode === 'url' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <Link size={18} className="mr-2" />
                    Import from URL
                </button>
                <button
                    onClick={() => setMode('text')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${mode === 'text' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <Type size={18} className="mr-2" />
                    Paste Text
                </button>
            </div>

            <div className="space-y-4">
                {mode === 'url' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipe URL</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://cookidoo.de/..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Text</label>
                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Paste recipe ingredients and steps here..."
                            className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleParse}
                        disabled={loading || (mode === 'url' ? !url : !rawText)}
                        className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Analyzing...' : 'Analyze Recipe'}
                        <ArrowRight size={18} className="ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
}
