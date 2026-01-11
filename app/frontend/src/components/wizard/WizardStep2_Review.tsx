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

    const handleNext = () => {
        try {
            const parsed = JSON.parse(jsonString);
            setRecipeJson(parsed);
            setStep(3);
        } catch (e) {
            setError('Invalid JSON format');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Review Parsed Data</h2>
                <span className="text-sm text-gray-500">Edit raw JSON if needed</span>
            </div>

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
