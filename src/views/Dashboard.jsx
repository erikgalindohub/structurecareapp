const Dashboard = ({ setView }) => (
  <div className="min-h-screen w-full bg-white flex items-start justify-center p-8 md:p-16">
    <div className="w-full max-w-4xl space-y-7 md:space-y-8 text-left">
      <span className="brand-eyebrow text-stone-700">Structure Landscapes</span>
      <h1 className="brand-heading text-stone-900">Build the Landscape Report of Your Dreams.</h1>
      <p className="text-stone-900 font-medium max-w-2xl">
        StructureCare keeps every site note, plant pick, and photo organized so you can assemble
        polished maintenance packets in just a few clicks.
      </p>

      <ul className="space-y-3 text-stone-800 font-medium">
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
          className="brand-button w-full"
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
