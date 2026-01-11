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

    const [viewMode, setViewMode] = useState<'preview' | 'json'>('preview');

    const Badge = ({ type, value }: { type: 'time' | 'temp' | 'speed' | 'mode', value: string }) => {
        const colors = {
            time: 'bg-blue-500 text-white',
            temp: 'bg-amber-400 text-black',
            speed: 'bg-green-500 text-white',
            mode: 'bg-purple-500 text-white'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[type]}`}>
                {value}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Thermomix Conversion</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'preview' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Formatted
                    </button>
                    <button
                        onClick={() => setViewMode('json')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'json' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        JSON Source
                    </button>
                </div>
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
                    {!thermomixData && <p className="text-gray-500">No data generated yet.</p>}

                    {viewMode === 'json' ? (
                        <div className="bg-gray-50 p-4 rounded-lg border h-96 overflow-y-auto font-mono text-sm">
                            <pre className="whitespace-pre-wrap">
                                {JSON.stringify(thermomixData, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div className="bg-white border rounded-lg divide-y h-96 overflow-y-auto">
                            {thermomixData?.steps ? (
                                thermomixData.steps.map((step: any, i: number) => (
                                    <div key={i} className="p-4 flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-gray-800">{step.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {step.time && <Badge type="time" value={step.time} />}
                                                {step.temperature && <Badge type="temp" value={step.temperature} />}
                                                {step.speed && <Badge type="speed" value={step.speed} />}
                                                {step.mode && <Badge type="mode" value={step.mode} />}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No steps available.
                                </div>
                            )}
                        </div>
                    )}
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
