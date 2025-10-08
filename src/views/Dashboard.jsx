const Dashboard = ({ setView }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 md:p-12 brand-background">
    <div className="brand-card brand-card--accent w-full max-w-3xl space-y-7 md:space-y-8 p-8 md:p-12 text-left">
      <span className="brand-eyebrow">Structure Landscapes</span>
      <h1 className="brand-heading text-emerald-700">Build the Landscape Report of Your Dreams.</h1>
      <p className="brand-subtext max-w-xl">
        Capture every detail from scouting through sign-off so you can craft polished, client-ready
        documentation in minutes.
      </p>

      <ul className="space-y-3 text-stone-700 font-medium">
        <li className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm">
            ✓
          </span>
          Locally curated plant database, checklist tooling, and project records.
        </li>
        <li className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm">
            ✓
          </span>
          Auto-generated care guides that delight clients and crews.
        </li>
      </ul>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={() => setView({ name: 'NewProjectForm', projectId: null })}
          className="brand-button brand-button--reverse w-full"
        >
          + New Project
        </button>
        <button
          onClick={() => setView({ name: 'ProjectList', status: 'In Progress' })}
          className="brand-button brand-button--outline w-full"
        >
          View Current Projects
        </button>
        <button
          onClick={() => setView({ name: 'ProjectList', status: 'Completed' })}
          className="brand-button brand-button--neutral brand-button--reverse w-full"
        >
          Completed Projects
        </button>
      </div>
      <p className="text-xs md:text-sm text-stone-500 pt-2">
        Data is securely stored via Firebase Firestore.
      </p>
    </div>
  </div>
);

export default Dashboard;
