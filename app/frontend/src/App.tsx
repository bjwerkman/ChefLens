import { useAuth } from './hooks/useAuth';
import { useWizardStore } from './store/wizardStore';
import { WizardLayout } from './components/wizard/WizardLayout';
import { WizardStep1_Input } from './components/wizard/WizardStep1_Input';
import { WizardStep2_Review } from './components/wizard/WizardStep2_Review';
import { WizardStep3_Thermomix } from './components/wizard/WizardStep3_Thermomix';
import { WizardStep4_Upload } from './components/wizard/WizardStep4_Upload';
import { supabase } from './utils/supabase';
import { LogOut, Loader2, User as UserIcon } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const currentStep = useWizardStore((state) => state.currentStep);

  const handleLogin = async () => {
    // For demo/dev, we might use email/password or magic link.
    // For now, let's assume generic email/pass or just redirect.
    // Assuming backend handles auth, but frontend needs token.
    // Using Supabase Auth UI (simple prompt for now)
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">ChefLens</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg font-medium cursor-pointer">
            New Recipe
          </div>
          <div className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            My Recipes
          </div>
          <div className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
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
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <WizardLayout>
          {currentStep === 1 && <WizardStep1_Input />}
          {currentStep === 2 && <WizardStep2_Review />}
          {currentStep === 3 && <WizardStep3_Thermomix />}
          {currentStep === 4 && <WizardStep4_Upload />}
        </WizardLayout>
      </main>
    </div>
  );
}

export default App;
