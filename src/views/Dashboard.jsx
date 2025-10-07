const Dashboard = ({ setView }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-stone-100">
    <div className="w-full max-w-lg p-10 bg-white rounded-xl shadow-2xl border-t-4 border-emerald-600 space-y-6">
      <h1 className="text-3xl font-extrabold text-emerald-800 text-center">Project Documentation Hub</h1>
      <p className="text-stone-500 text-center">
        Manage client projects efficiently for professional documentation.
      </p>

      <div className="space-y-4 pt-4">
        <button
          onClick={() => setView({ name: 'NewProjectForm', projectId: null })}
          className="w-full bg-emerald-700 text-white font-bold py-4 rounded-lg text-lg shadow-lg hover:bg-emerald-800 transition"
        >
          + New Project
        </button>
        <button
          onClick={() => setView({ name: 'ProjectList', status: 'In Progress' })}
          className="w-full bg-yellow-600 text-white font-bold py-4 rounded-lg text-lg shadow-lg hover:bg-yellow-700 transition"
        >
          Current Projects
        </button>
        <button
          onClick={() => setView({ name: 'ProjectList', status: 'Completed' })}
          className="w-full bg-gray-600 text-white font-bold py-4 rounded-lg text-lg shadow-lg hover:bg-gray-700 transition"
        >
          Completed Projects
        </button>
      </div>
      <p className="text-xs text-stone-400 text-center pt-4">Data is securely stored via Firebase Firestore.</p>
    </div>
  </div>
);

export default Dashboard;
