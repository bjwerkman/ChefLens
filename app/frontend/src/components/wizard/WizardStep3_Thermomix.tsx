import { useEffect, useState } from 'react';
import { useWizardStore } from '../../store/wizardStore';
import { api } from '../../utils/axios';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export function WizardStep3_Thermomix() {
    const { recipeJson, thermomixData, setThermomixData, setRecipeId, setStep, recipeId } = useWizardStore();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-convert on mount if not already done
    useEffect(() => {
        const convert = async () => {
            if (thermomixData) return; // Already converted
            if (!user) {
                setError("User not authenticated");
                return;
            }

            setLoading(true);
            setError(null);
            try {
                let currentRecipeId = recipeId;

                // 1. Create Recipe if not exists
                if (!currentRecipeId) {
                    const createResp = await api.post('/recipes/', recipeJson, {
                        params: { user_id: user.id }
                    });
                    currentRecipeId = createResp.data.id;
                    setRecipeId(currentRecipeId!);
                }

                // 2. Convert to Thermomix
                const convertResp = await api.post(`/recipes/${currentRecipeId}/convert`, {}, {
                    params: { user_id: user.id }
                });

                setThermomixData(convertResp.data.thermomix_data);

            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.detail || 'Conversion failed');
            } finally {
                setLoading(false);
            }
        };

        convert();
    }, [user, recipeJson]); // Run when user or recipeJson changes

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Thermomix Conversion</h2>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                    <p className="text-gray-500">Converting recipe structure for Thermomix...</p>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                    <button onClick={() => setStep(2)} className="mt-4 text-sm underline">Go Back</button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-3 text-green-800 border border-green-200">
                        <CheckCircle size={24} />
                        <span>Successfully converted to structured format!</span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border h-80 overflow-y-auto">
                        <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(thermomixData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-4">
                <button
                    onClick={() => setStep(2)}
                    className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back
                </button>
                <button
                    onClick={() => setStep(4)}
                    disabled={loading || !thermomixData}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                    Proceed to Upload
                    <ArrowRight size={18} className="ml-2" />
                </button>
            </div>
        </div>
    );
}
