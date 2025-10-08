import { useEffect, useState } from 'react';
import useFirebase from './hooks/useFirebase';
import usePlantData from './hooks/usePlantData';
import useAuth from './hooks/useAuth';
import Dashboard from './views/Dashboard';
import ProjectList from './views/ProjectList';
import ProjectForm from './views/ProjectForm';

const App = () => {
  const { db, isReady } = useFirebase();
  const { dbPlants, isLoading } = usePlantData();
  const { user, loading: authLoading, error, lastEmail, signIn } = useAuth();
  const [view, setView] = useState({ name: 'Dashboard' });

  useEffect(() => {
    document.title = 'Care - Structure Landscapes';
  }, []);

  if (!isReady || isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-100">
        <div className="text-xl font-medium text-emerald-700 flex items-center">
          <span className="spinner h-6 w-6 border-4 border-emerald-500 rounded-full mr-3" />
          Initializing App and Loading Resources...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-2xl font-extrabold text-stone-900">Sign in</h1>
          <p className="text-sm text-stone-600">Use your Structure Landscapes Google account.</p>
          {error && (
            <div className="text-red-600 text-sm" role="alert">
              {error}
            </div>
          )}
          {lastEmail && (
            <button onClick={signIn} className="brand-button brand-button--reverse w-full">
              Continue as {lastEmail}
            </button>
          )}
          <button onClick={signIn} className="brand-button w-full">
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  switch (view.name) {
    case 'NewProjectForm':
    case 'ProjectForm':
      return (
        <ProjectForm
          db={db}
          setView={setView}
          projectId={view.projectId}
          projectData={view.projectData}
          dbPlants={dbPlants}
          isLoadingPlants={isLoading}
        />
      );
    case 'ProjectList':
      return <ProjectList db={db} setView={setView} status={view.status} />;
    case 'Dashboard':
    default:
      return <Dashboard setView={setView} />;
  }
};

export default App;
