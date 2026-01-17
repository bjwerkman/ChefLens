import { useState, useEffect } from 'react';
import { ArrowLeft, Minus, Plus, Pencil, Save, X, GripVertical, Trash2, Share2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '../../utils/axios';
import { Badge } from './Badge';

interface RecipeDetailProps {
    recipe: any;
    onBack: () => void;
}

// Helper Component for Sortable/Editable Step
function SortableStepItem({ step, index, isEditing, onChange, onDelete }: { step: any, index: number, isEditing: boolean, onChange: (field: string, val: string) => void, onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id, disabled: !isEditing });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className={`py-6 flex items-start group hover:bg-gray-50 -mx-8 px-8 transition-colors border-b last:border-b-0 ${isEditing ? 'bg-white' : ''}`}>
            {isEditing && (
                <div {...attributes} {...listeners} className="mr-4 mt-2 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing">
                    <GripVertical size={20} />
                </div>
            )}

            <div className="flex-shrink-0 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg mr-5 shadow-sm">
                {index + 1}
            </div>

            <div className="flex-1 space-y-3">
                {isEditing ? (
                    <div className="space-y-3">
                        <textarea
                            value={step.description}
                            onChange={(e) => onChange('description', e.target.value)}
                            className="w-full p-2 border rounded-md text-gray-800 text-lg leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={3}
                        />
                        <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center space-x-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Time</label>
                                <input
                                    type="text"
                                    value={step.time || ''}
                                    onChange={(e) => onChange('time', e.target.value)}
                                    placeholder="e.g. 5 min"
                                    className="w-24 p-1 border rounded text-sm"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Temp</label>
                                <input
                                    type="text"
                                    value={step.temperature || ''}
                                    onChange={(e) => onChange('temperature', e.target.value)}
                                    placeholder="100°C"
                                    className="w-24 p-1 border rounded text-sm"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Speed</label>
                                <input
                                    type="text"
                                    value={step.speed || ''}
                                    onChange={(e) => {
                                        onChange('speed', e.target.value)
                                    }}
                                    placeholder="Speed 3"
                                    className="w-24 p-1 border rounded text-sm"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Mode</label>
                                <input
                                    type="text"
                                    value={step.mode || ''}
                                    onChange={(e) => onChange('mode', e.target.value)}
                                    placeholder="Dough"
                                    className="w-24 p-1 border rounded text-sm"
                                />
                            </div>
                            <div className="flex-1 text-right">
                                <button onClick={onDelete} className="text-red-400 hover:text-red-600 p-1" title="Delete Step">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-800 text-lg leading-relaxed">{step.description}</p>
                        {/* Badges Container */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            {step.time && <Badge type="time" value={step.time} />}
                            {step.temperature && <Badge type="temp" value={step.temperature} />}
                            {step.speed && <Badge type="speed" value={step.speed} />}
                            {step.mode && <Badge type="mode" value={step.mode} />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export function RecipeDetail({ recipe, onBack }: RecipeDetailProps) {
    const [viewMode, setViewMode] = useState<'normal' | 'thermomix' | 'json'>('normal');

    // Scale Logic
    const parsed = recipe.parsed_data || {};
    const thermo = recipe.thermomix_data || {};
    const originalServings = parsed.servings ? parseInt(parsed.servings) : 4;
    const [servings, setServings] = useState(originalServings || 4);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [localSteps, setLocalSteps] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (thermo.steps) {
            // Ensure IDs
            const stepsWithIds = thermo.steps.map((s: any, i: number) => ({
                ...s,
                id: s.id || `step-${i}-${Date.now()}`
            }));
            setLocalSteps(stepsWithIds);
        }
    }, [recipe]);

    const scaleAmount = (amount: string | number) => {
        if (!amount) return "";
        // Simple heuristic: if it looks like a number, scale it. 
        // Handles "500", "0.5". Does NOT handle fractions "1/2" complexity yet (would need a library or complex regex)
        const num = parseFloat(amount.toString());
        if (isNaN(num)) return amount;

        const scaled = (num / (originalServings || 4)) * servings;

        // Format nicely: no decimals if integer, max 1 or 2 decimals otherwise
        return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1).replace(/\.0$/, '');
    };

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setLocalSteps((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleStepChange = (index: number, field: string, val: string) => {
        const newSteps = [...localSteps];
        newSteps[index] = { ...newSteps[index], [field]: val };
        setLocalSteps(newSteps);
    };

    const handleStepDelete = (index: number) => {
        if (confirm("Are you sure you want to delete this step?")) {
            const newSteps = [...localSteps];
            newSteps.splice(index, 1);
            setLocalSteps(newSteps);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: parsed.title || recipe.title,
            text: `Check out this recipe: ${parsed.title || recipe.title}`,
            url: window.location.href
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Check for speed validation (e.g. numeric > 10)
            for (const s of localSteps) {
                if (s.speed) {
                    const speedNum = parseFloat(s.speed.replace(/[^0-9.]/g, ''));
                    if (!isNaN(speedNum) && speedNum > 10) {
                        alert(`Speed cannot be higher than 10 (found: ${s.speed})`);
                        setSaving(false);
                        return;
                    }
                }
            }

            const updatedThermoData = {
                title: parsed.title || recipe.title || "Untitled",
                ...thermo,
                steps: localSteps
            };

            // Update parsed_data with new servings
            const updatedParsedData = {
                ...parsed,
                servings: servings.toString()
            };

            await api.put(`/recipes/${recipe.id}`, {
                thermomix_data: updatedThermoData,
                parsed_data: updatedParsedData
            });

            // Update local recipe object (hacky refresh, ideally refetch parent or update callback)
            recipe.parsed_data = updatedParsedData;

            // Update local recipe object (hacky refresh, ideally refetch parent or update callback)
            recipe.thermomix_data = updatedThermoData;
            setIsEditing(false);
            alert("Recipe updated!");
        } catch (err) {
            console.error(err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        const stepsWithIds = (thermo.steps || []).map((s: any, i: number) => ({
            ...s,
            id: s.id || `step-${i}-${Date.now()}`
        }));
        setLocalSteps(stepsWithIds);
        setIsEditing(false);
    };

    const handleAddStep = () => {
        const newStep = {
            id: `step-new-${Date.now()}`,
            description: '',
            time: '',
            temperature: '',
            speed: '',
            mode: ''
        };
        setLocalSteps([...localSteps, newStep]);
    };

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

                <div className="flex bg-gray-100 p-1 rounded-lg mr-4">
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
                <button
                    onClick={handleShare}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Share Recipe"
                >
                    <Share2 size={20} />
                </button>
            </div>

            {/* Content Card */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden min-h-[600px]">
                {/* Banner / Title Area */}
                <div className="bg-gray-50 border-b p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{parsed.title || recipe.title || "Untitled Recipe"}</h1>
                            <p className="text-gray-600 italic">{parsed.description || recipe.description}</p>
                        </div>

                        {/* Servings Stepper */}
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-gray-500 uppercase mb-1">Servings</span>
                            <div className="flex items-center bg-white border rounded-lg shadow-sm">
                                <button
                                    onClick={() => setServings(Math.max(1, servings - 1))}
                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-l-lg transition-colors"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-bold text-gray-800">{servings}</span>
                                <button
                                    onClick={() => setServings(servings + 1)}
                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-r-lg transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
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
                                                <span className="font-bold text-indigo-700">{scaleAmount(ing.amount)} {ing.unit}</span> <span className="font-medium">{ing.name}</span>
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
                            {/* Thermomix Header & Toolbar */}
                            <div className="flex justify-between items-end mb-6 border-b pb-2">
                                <h3 className="text-xl font-bold text-gray-800">Thermomix Steps</h3>
                                <div>
                                    {isEditing ? (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleCancel}
                                                disabled={saving}
                                                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                            >
                                                <X size={16} className="mr-1.5" />
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
                                            >
                                                <Save size={16} className="mr-1.5" />
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                                        >
                                            <Pencil size={16} className="mr-1.5" />
                                            Edit Steps
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!localSteps || localSteps.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                                    <p>No Thermomix conversion data available for this recipe.</p>
                                    <p className="text-sm mt-2">Try converting it again via the Wizard.</p>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={localSteps.map(s => s.id)}
                                        strategy={verticalListSortingStrategy}
                                        disabled={!isEditing}
                                    >
                                        <div className="space-y-0 divide-y">
                                            {localSteps.map((step: any, i: number) => (
                                                <SortableStepItem
                                                    key={step.id}
                                                    step={step}
                                                    index={i}
                                                    isEditing={isEditing}
                                                    onChange={(field, val) => handleStepChange(i, field, val)}
                                                    onDelete={() => handleStepDelete(i)}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}

                            {isEditing && (
                                <button
                                    onClick={handleAddStep}
                                    className="w-full py-3 mt-4 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium"
                                >
                                    <Plus size={20} className="mr-2" />
                                    Add Step
                                </button>
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
