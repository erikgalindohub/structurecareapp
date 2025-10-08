const Dashboard = ({ setView }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 md:p-12 brand-background">
    <div className="brand-card brand-card--accent w-full max-w-3xl space-y-7 md:space-y-8 p-8 md:p-12 text-left">
      <span className="brand-eyebrow">Structure Landscapes</span>
      <h1 className="brand-heading text-emerald-700">
        Let&apos;s Build The Landscape Of Your Dreams.
      </h1>
      <p className="brand-subtext max-w-xl">
        Manage client projects efficiently and deliver polished documentation that mirrors your
        field-ready brand.
      </p>

      <ul className="space-y-3 text-stone-700 font-medium">
        <li className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm">
            ✓
          </span>
          Locally curated plant database and project records.
        </li>
        <li className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm">
            ✓
          </span>
          Client-ready deliverables in minutes.
        </li>
      </ul>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={() => setView({ name: 'NewProjectForm', projectId: null })}
          className="brand-button w-full"
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
          className="brand-button brand-button--neutral w-full"
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
