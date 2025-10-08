import { useEffect, useState } from 'react';
import { onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getProjectsCollectionRef } from '../firebase';

const ProjectList = ({ db, setView, status }) => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      return;
    }
    const projectsRef = getProjectsCollectionRef(db);
    const queryRef = query(projectsRef, where('status', '==', status), orderBy('dateCreated', 'desc'));

    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot) => {
        const projectsArray = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
          dateCreated: docSnapshot.data().dateCreated?.toDate(),
          dateCompleted: docSnapshot.data().dateCompleted?.toDate(),
        }));
        setProjects(projectsArray);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching projects:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, status]);

  const filteredProjects = projects.filter(
    (project) =>
      project.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientPhone?.includes(searchQuery) ||
      project.clientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-12 brand-background min-h-screen">
      <div className="flex flex-col gap-2 mb-6">
        <span className="brand-eyebrow">{status === 'In Progress' ? 'Active Portfolio' : 'Archive'}</span>
        <h1 className="text-3xl font-extrabold text-emerald-700">
          {status === 'In Progress' ? 'Current Projects' : 'Completed Projects'}
        </h1>
      </div>

      <button
        onClick={() => setView({ name: 'Dashboard' })}
        className="mb-6 text-sm font-semibold text-emerald-700 hover:text-emerald-600 transition"
      >
        &larr; Back to Dashboard
      </button>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by Client Name, Phone, or Email..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full p-4 bg-white border border-stone-200 rounded-lg shadow-md focus:border-emerald-600 transition"
        />
      </div>

      {isLoading && <p className="text-stone-500">Loading projects...</p>}

      {!isLoading && filteredProjects.length === 0 && (
        <div className="brand-card p-8 text-center text-stone-500">
          No {status.toLowerCase()} projects found.
        </div>
      )}

      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="brand-card p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition hover:shadow-lg"
          >
            <div>
              <h2 className="text-xl font-bold text-emerald-700">{project.clientName}</h2>
              <p className="text-sm text-stone-600 mt-1">
                <span className="font-medium text-stone-700">Job:</span>{' '}
                {project.projectAddress || 'Address not set'}
              </p>
              <p className="text-xs text-stone-500">
                Started: {project.dateCreated ? project.dateCreated.toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() =>
                  setView({ name: 'ProjectForm', projectId: project.id, projectData: project })
                }
                className="brand-button w-full sm:w-auto py-3 px-6"
              >
                <span>{status === 'In Progress' ? 'Edit Checklist' : 'View Report'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
