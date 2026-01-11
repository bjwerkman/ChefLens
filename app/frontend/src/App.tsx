import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useWizardStore } from './store/wizardStore';
import { WizardLayout } from './components/wizard/WizardLayout';
import { WizardStep1_Input } from './components/wizard/WizardStep1_Input';
import { WizardStep2_Review } from './components/wizard/WizardStep2_Review';
import { WizardStep3_Thermomix } from './components/wizard/WizardStep3_Thermomix';
import { WizardStep4_Upload } from './components/wizard/WizardStep4_Upload';
import { LibraryLayout } from './components/library/LibraryLayout';
import { supabase } from './utils/supabase';
import { LogOut, Loader2, User as UserIcon, PlusCircle, BookOpen, Settings } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const currentStep = useWizardStore((state) => state.currentStep);

  // Navigation State
  const [currentView, setCurrentView] = useState<'wizard' | 'library' | 'settings'>('wizard');

  const handleLogin = async () => {
    const email = prompt("Enter Email:");
    const password = prompt("Enter Password:");
    if (email && password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  };

  const handleLogout = () => supabase.auth.signOut();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="h-screen w-full bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl w-96 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">ChefLens</h1>
          <p className="text-gray-500 mb-8">Please login to continue</p>
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center justify-center">
          <img src="/logo.png" alt="ChefLens Logo" className="h-24 w-auto object-contain" />
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div
            onClick={() => setCurrentView('wizard')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors ${currentView === 'wizard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <PlusCircle size={20} className="mr-3" />
            New Recipe
          </div>
          <div
            onClick={() => setCurrentView('library')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors ${currentView === 'library' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <BookOpen size={20} className="mr-3" />
            My Recipes
          </div>
          <div
            onClick={() => setCurrentView('settings')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors ${currentView === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings size={20} className="mr-3" />
            Settings
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              <UserIcon size={16} className="text-gray-500" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-700 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentView === 'wizard' && (
          <WizardLayout>
            {currentStep === 1 && <WizardStep1_Input />}
            {currentStep === 2 && <WizardStep2_Review />}
            {currentStep === 3 && <WizardStep3_Thermomix />}
            {currentStep === 4 && <WizardStep4_Upload />}
          </WizardLayout>
        )}

        {currentView === 'library' && (
          <LibraryLayout />
        )}

        {currentView === 'settings' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            Settings feature coming soon...
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
