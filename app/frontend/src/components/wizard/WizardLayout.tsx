import { useWizardStore } from '../../store/wizardStore';
import { ChefHat, FileText, Settings, CloudUpload } from 'lucide-react';

const steps = [
    { number: 1, title: 'Input', icon: ChefHat },
    { number: 2, title: 'Review', icon: FileText },
    { number: 3, title: 'Thermomix', icon: Settings },
    { number: 4, title: 'Upload', icon: CloudUpload },
];

export function WizardLayout({ children }: { children: React.ReactNode }) {
    const currentStep = useWizardStore((state) => state.currentStep);

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep >= step.number;
                        const isCurrent = currentStep === step.number;

                        return (
                            <div key={step.number} className="flex flex-col items-center bg-gray-50 px-4">
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-400'}
                  `}
                                >
                                    <Icon size={20} />
                                </div>
                                <span className={`mt-2 text-sm font-medium ${isCurrent ? 'text-indigo-600' : 'text-gray-500'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
                {children}
            </div>
        </div>
    );
}
