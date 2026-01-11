import { create } from 'zustand';

interface WizardState {
    currentStep: number;
    url: string;
    rawText: string;
    recipeJson: any;
    recipeId: string | null;
    thermomixData: any;
    setStep: (step: number) => void;
    setUrl: (url: string) => void;
    setRawText: (text: string) => void;
    setRecipeJson: (json: any) => void;
    setRecipeId: (id: string) => void;
    setThermomixData: (data: any) => void;
    reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
    currentStep: 1,
    url: '',
    rawText: '',
    recipeJson: null,
    recipeId: null,
    thermomixData: null,
    setStep: (step) => set({ currentStep: step }),
    setUrl: (url) => set({ url }),
    setRawText: (rawText) => set({ rawText }),
    setRecipeJson: (recipeJson) => set({ recipeJson }),
    setRecipeId: (recipeId) => set({ recipeId }),
    setThermomixData: (thermomixData) => set({ thermomixData }),
    reset: () => set({ currentStep: 1, url: '', rawText: '', recipeJson: null, recipeId: null, thermomixData: null }),
}));
