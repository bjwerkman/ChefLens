import { useState, useEffect } from 'react';
import { useWizardStore } from '../../store/wizardStore';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function WizardStep2_Review() {
    const { recipeJson, setRecipeJson, setStep } = useWizardStore();
    const [jsonString, setJsonString] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (recipeJson) {
            setJsonString(JSON.stringify(recipeJson, null, 2));
        }
    }, [recipeJson]);

    const [viewMode, setViewMode] = useState<'json' | 'preview'>('preview');

    const handleNext = () => {
        try {
            // Ensure we parse the latest JSON string if we were editing
            if (viewMode === 'json') {
                const parsed = JSON.parse(jsonString);
                setRecipeJson(parsed);
            }
            setStep(3);
        } catch (e) {
            setError('Invalid JSON format');
        }
    };

    const toggleView = (mode: 'json' | 'preview') => {
        if (mode === 'preview') {
            try {
                const parsed = JSON.parse(jsonString);
                setRecipeJson(parsed);
                setError(null);
                setViewMode(mode);
            } catch (e) {
                setError("Fix JSON errors before switching to Preview");
            }
        } else {
            // Update jsonString from store before switching to edit mode
            if (recipeJson) {
                setJsonString(JSON.stringify(recipeJson, null, 2));
            }
            setViewMode(mode);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Review Parsed Data</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => toggleView('preview')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'preview' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Formatted
                    </button>
                    <button
                        onClick={() => toggleView('json')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'json' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        JSON Source
                    </button>
                </div>
            </div>

            {viewMode === 'json' ? (
                <div className="relative">
                    <textarea
                        value={jsonString}
                        onChange={(e) => {
                            setJsonString(e.target.value);
                            setError(null);
                        }}
                        className={`w-full h-96 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {error && (
                        <div className="absolute bottom-4 left-4 text-red-600 bg-white px-2 py-1 rounded shadow text-sm">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6 h-96 overflow-y-auto space-y-6">
                    {recipeJson ? (
                        <>
                            <div className="border-b pb-4">
                                <h3 className="text-2xl font-bold text-gray-900">{recipeJson.title || "Untitled Recipe"}</h3>
                                {recipeJson.description && <p className="text-gray-600 mt-2 italic">{recipeJson.description}</p>}
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">Ingredients</h4>
                                <ul className="space-y-2">
                                    {recipeJson.ingredients?.map((ing: any, i: number) => (
                                        <li key={i} className="text-gray-700">
                                            <span className="font-medium">• {ing.amount} {ing.unit}</span> {ing.name}
                                            {ing.note && <span className="text-gray-500 text-sm ml-1">({ing.note})</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">Instructions</h4>
                                <ol className="space-y-4">
                                    {recipeJson.steps?.map((step: any, i: number) => (
                                        <li key={i} className="flex">
                                            <span className="font-bold text-indigo-600 mr-3">{i + 1}.</span>
                                            <span className="text-gray-700">{step.description}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No data to preview
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between pt-4">
                <button
                    onClick={() => setStep(1)}
                    className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                    Confirm & Convert
                    <ArrowRight size={18} className="ml-2" />
                </button>
            </div>
        </div>
    );
}
