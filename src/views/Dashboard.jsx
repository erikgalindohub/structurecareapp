const Dashboard = ({ setView }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 md:p-12 brand-background">
    <div className="brand-card brand-card--accent w-full max-w-xl space-y-7 text-center">
      <span className="brand-eyebrow">Structure Landscapes</span>
      <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700">
        Project Documentation Hub
      </h1>
      <p className="text-stone-600">
        Manage client projects efficiently and deliver polished documentation that mirrors your
        field-ready brand.
      </p>

      <div className="space-y-4 pt-6">
        <button
          onClick={() => setView({ name: 'NewProjectForm', projectId: null })}
          className="brand-button w-full"
        >
          <span>+ New Project</span>
        </button>
        <button
          onClick={() => setView({ name: 'ProjectList', status: 'In Progress' })}
          className="brand-button brand-button--accent w-full"
        >
          <span>Current Projects</span>
        </button>
        <button
          onClick={() => setView({ name: 'ProjectList', status: 'Completed' })}
          className="brand-button brand-button--neutral w-full"
        >
          <span>Completed Projects</span>
        </button>
      </div>
      <p className="text-xs text-stone-500 text-center pt-4">
        Data is securely stored via Firebase Firestore.
      </p>
    </div>
  </div>
);

export default Dashboard;
