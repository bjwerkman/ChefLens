import { useState } from 'react';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { Badge } from './Badge';

interface RecipeDetailProps {
    recipe: any;
    onBack: () => void;
}

export function RecipeDetail({ recipe, onBack }: RecipeDetailProps) {
    const [viewMode, setViewMode] = useState<'normal' | 'thermomix' | 'json'>('normal');

    // Safe accessors
    const parsed = recipe.parsed_data || {};
    const thermo = recipe.thermomix_data || {};

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header / Nav */}
            <div className="sticky top-0 z-20 bg-gray-50 py-4 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Library
                </button>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('normal')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'normal' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Normal
                    </button>
                    <button
                        onClick={() => setViewMode('thermomix')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'thermomix' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Thermomix
                    </button>
                    <button
                        onClick={() => setViewMode('json')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'json' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        JSON
                    </button>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden min-h-[600px]">
                {/* Banner / Title Area */}
                <div className="bg-gray-50 border-b p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{parsed.title || recipe.title || "Untitled Recipe"}</h1>
                    <p className="text-gray-600 italic">{parsed.description || recipe.description}</p>
                </div>

                <div className="p-8">
                    {viewMode === 'normal' && (
                        <div className="space-y-8">
                            {/* Ingredients */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Ingredients</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {parsed.ingredients?.map((ing: any, i: number) => (
                                        <li key={i} className="flex items-start text-gray-700">
                                            <span className="w-2 h-2 mt-2 mr-3 bg-indigo-400 rounded-full flex-shrink-0" />
                                            <span>
                                                <span className="font-semibold">{ing.amount} {ing.unit}</span> {ing.name}
                                                {ing.note && <span className="text-gray-500 text-sm ml-1">({ing.note})</span>}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Instructions</h3>
                                <div className="space-y-6">
                                    {parsed.steps?.map((step: any, i: number) => (
                                        <div key={i} className="flex">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold mr-4">
                                                {i + 1}
                                            </div>
                                            <p className="text-gray-700 mt-1 leading-relaxed">{step.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'thermomix' && (
                        <div>
                            {/* Thermomix View */}
                            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Thermomix Steps</h3>

                            {!thermo.steps || thermo.steps.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                                    <p>No Thermomix conversion data available for this recipe.</p>
                                    <p className="text-sm mt-2">Try converting it again via the Wizard.</p>
                                </div>
                            ) : (
                                <div className="space-y-0 divide-y">
                                    {thermo.steps.map((step: any, i: number) => (
                                        <div key={i} className="py-6 flex items-start group hover:bg-gray-50 -mx-8 px-8 transition-colors">
                                            <div className="flex-shrink-0 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg mr-5 shadow-sm">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <p className="text-gray-800 text-lg leading-relaxed">{step.description}</p>

                                                {/* Badges Container */}
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {step.time && <Badge type="time" value={step.time} />}
                                                    {step.temperature && <Badge type="temp" value={step.temperature} />}
                                                    {step.speed && <Badge type="speed" value={step.speed} />}
                                                    {step.mode && <Badge type="mode" value={step.mode} />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === 'json' && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Thermomix JSON Source</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border overflow-auto font-mono text-sm max-h-[600px]">
                                <pre className="whitespace-pre-wrap">
                                    {JSON.stringify(thermo, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
