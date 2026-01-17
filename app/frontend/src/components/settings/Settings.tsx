import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export function Settings() {
    const [language, setLanguage] = useState('en');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const storedLang = localStorage.getItem('cheflens_language');
        if (storedLang) {
            setLanguage(storedLang);
        }
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call or just save to local storage
        localStorage.setItem('cheflens_language', language);

        setTimeout(() => {
            setIsSaving(false);
            alert('Settings saved!');
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-8">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">General Preferences</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Recipe Language
                            </label>
                            <p className="text-sm text-gray-500 mb-3">
                                Select the language for new recipes and translations.
                            </p>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                            >
                                <option value="en">English</option>
                                <option value="nl">Dutch (Nederlands)</option>
                                <option value="de">German (Deutsch)</option>
                                <option value="fr">French (Français)</option>
                                <option value="es">Spanish (Español)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        <Save size={16} className="mr-2" />
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}
