import { useEffect, useState } from 'react';
import { useWizardStore } from '../../store/wizardStore';
import { api } from '../../utils/axios';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, ArrowLeft, Loader2, GripVertical, Pencil, X, Trash2, Plus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

function SortableStepItem({ step, index, isEditing, onChange, onDelete }: { step: any, index: number, isEditing: boolean, onChange: (field: string, val: string) => void, onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id, disabled: !isEditing });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className={`p-4 flex items-start space-x-4 border-b last:border-b-0 group ${isEditing ? 'bg-white' : 'bg-white'}`}>
            {isEditing ? (
                <div {...attributes} {...listeners} className="mt-2 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing">
                    <GripVertical size={20} />
                </div>
            ) : (
                <div className="mt-1 text-gray-300">
                    {/* Placeholder for alignment */}
                </div>
            )}

            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                {index + 1}
            </div>

            <div className="flex-1 space-y-2">
                {isEditing ? (
                    <div className="space-y-3">
                        <textarea
                            value={step.description}
                            onChange={(e) => onChange('description', e.target.value)}
                            className="w-full p-2 border rounded-md text-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={3}
                        />
                        <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-2 rounded-md">
                            <input
                                type="text"
                                value={step.time || ''}
                                onChange={(e) => onChange('time', e.target.value)}
                                placeholder="Time"
                                className="w-20 p-1 border rounded text-xs"
                            />
                            <input
                                type="text"
                                value={step.temperature || ''}
                                onChange={(e) => onChange('temperature', e.target.value)}
                                placeholder="Temp"
                                className="w-20 p-1 border rounded text-xs"
                            />
                            <input
                                type="text"
                                value={step.speed || ''}
                                onChange={(e) => onChange('speed', e.target.value)}
                                placeholder="Speed"
                                className="w-20 p-1 border rounded text-xs"
                            />
                            <input
                                type="text"
                                value={step.mode || ''}
                                onChange={(e) => onChange('mode', e.target.value)}
                                placeholder="Mode"
                                className="w-20 p-1 border rounded text-xs"
                            />
                            <button onClick={onDelete} className="ml-auto text-red-400 hover:text-red-600 p-1" title="Delete Step">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-800">{step.description}</p>
                        <div className="flex flex-wrap gap-2">
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

export function WizardStep3_Thermomix() {
    const { recipeJson, thermomixData, setThermomixData, setRecipeId, setStep, recipeId } = useWizardStore();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'preview' | 'json'>('preview');
    const [isEditing, setIsEditing] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
                // Get language preference
                const language = localStorage.getItem('cheflens_language') || 'en';

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
                    params: { user_id: user.id, language }
                });

                const data = convertResp.data.thermomix_data;
                // Ensure steps have IDs for DnD
                if (data.steps) {
                    data.steps = data.steps.map((s: any, i: number) => ({ ...s, id: s.id || `step-${i}-${Date.now()}` }));
                }

                setThermomixData(data);

            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.detail || 'Conversion failed');
            } finally {
                setLoading(false);
            }
        };

        convert();
    }, [user, recipeJson]);

    // Ensure IDs exist even if data was loaded previously
    useEffect(() => {
        if (thermomixData?.steps && !thermomixData.steps[0]?.id) {
            const updatedSteps = thermomixData.steps.map((s: any, i: number) => ({ ...s, id: s.id || `step-${i}-${Date.now()}` }));
            setThermomixData({ ...thermomixData, steps: updatedSteps });
        }
    }, [thermomixData]);


    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            if (!thermomixData || !thermomixData.steps) return;

            const oldIndex = thermomixData.steps.findIndex((step: any) => step.id === active.id);
            const newIndex = thermomixData.steps.findIndex((step: any) => step.id === over?.id);

            const newSteps = arrayMove(thermomixData.steps, oldIndex, newIndex);

            setThermomixData({
                ...thermomixData,
                steps: newSteps
            });
        }
    }

    const handleStepChange = (index: number, field: string, val: string) => {
        if (!thermomixData || !thermomixData.steps) return;
        const newSteps = [...thermomixData.steps];
        newSteps[index] = { ...newSteps[index], [field]: val };
        setThermomixData({ ...thermomixData, steps: newSteps });
    };

    const handleStepDelete = (index: number) => {
        if (!thermomixData || !thermomixData.steps) return;
        if (confirm("Delete this step?")) {
            const newSteps = [...thermomixData.steps];
            newSteps.splice(index, 1);
            setThermomixData({ ...thermomixData, steps: newSteps });
        }
    };

    const handleAddStep = () => {
        if (!thermomixData) return;
        const newStep = {
            id: `step-new-${Date.now()}`,
            description: '',
            time: '',
            temperature: '',
            speed: '',
            mode: ''
        };
        const newSteps = thermomixData.steps ? [...thermomixData.steps, newStep] : [newStep];
        setThermomixData({ ...thermomixData, steps: newSteps });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Thermomix Conversion</h2>
                <div className="flex items-center space-x-4">
                    {/* Toggle Edit */}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isEditing
                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {isEditing ? <X size={16} className="mr-1" /> : <Pencil size={16} className="mr-1" />}
                        {isEditing ? 'Done Editing' : 'Edit Steps'}
                    </button>

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
                        <div className="bg-white border rounded-lg h-96 overflow-y-auto">
                            {thermomixData?.steps ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="divide-y">
                                        <SortableContext
                                            items={thermomixData.steps.map((s: any) => s.id)}
                                            strategy={verticalListSortingStrategy}
                                            disabled={!isEditing}
                                        >
                                            {thermomixData.steps.map((step: any, i: number) => (
                                                <SortableStepItem
                                                    key={step.id}
                                                    step={step}
                                                    index={i}
                                                    isEditing={isEditing}
                                                    onChange={(field, val) => handleStepChange(i, field, val)}
                                                    onDelete={() => handleStepDelete(i)}
                                                />
                                            ))}
                                        </SortableContext>
                                    </div>
                                </DndContext>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No steps available.
                                    {isEditing && (
                                        <button onClick={handleAddStep} className="mt-2 text-indigo-600 font-medium hover:underline">Add First Step</button>
                                    )}
                                </div>
                            )}

                            {isEditing && thermomixData?.steps && (
                                <div className="p-4 border-t bg-gray-50">
                                    <button
                                        onClick={handleAddStep}
                                        className="w-full py-2 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium"
                                    >
                                        <Plus size={20} className="mr-2" />
                                        Add Step
                                    </button>
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
