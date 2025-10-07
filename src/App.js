import { useState } from 'react';
import useFirebase from './hooks/useFirebase';
import usePlantData from './hooks/usePlantData';
import Dashboard from './views/Dashboard';
import ProjectList from './views/ProjectList';
import ProjectForm from './views/ProjectForm';

const App = () => {
  const { db, isReady } = useFirebase();
  const { dbPlants, isLoading } = usePlantData();
  const [view, setView] = useState({ name: 'Dashboard' });

  if (!isReady || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-100">
        <div className="text-xl font-medium text-emerald-700 flex items-center">
          <span className="spinner h-6 w-6 border-4 border-emerald-500 rounded-full mr-3" />
          Initializing App and Loading Resources...
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
