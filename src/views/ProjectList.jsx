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
    <div className="p-8 lg:p-12 bg-stone-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-emerald-800 mb-6">
        {status === 'In Progress' ? 'Current Projects' : 'Completed Projects'}
      </h1>

      <button
        onClick={() => setView({ name: 'Dashboard' })}
        className="mb-6 text-sm text-stone-600 hover:text-emerald-700 transition"
      >
        &larr; Back to Dashboard
      </button>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Client Name, Phone, or Email..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full p-3 border border-stone-300 rounded-lg focus:ring-emerald-700 focus:border-emerald-700 transition"
        />
      </div>

      {isLoading && <p className="text-stone-500">Loading projects...</p>}

      {!isLoading && filteredProjects.length === 0 && (
        <div className="p-8 bg-white rounded-lg shadow-inner text-center text-stone-500">
          No {status.toLowerCase()} projects found.
        </div>
      )}

      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-6 rounded-xl shadow-md border border-stone-200 flex justify-between items-center hover:shadow-lg transition"
          >
            <div>
              <h2 className="text-xl font-bold text-emerald-700">{project.clientName}</h2>
              <p className="text-sm text-stone-600 mt-1">
                <span className="font-medium">Job:</span> {project.projectAddress || 'Address not set'}
              </p>
              <p className="text-xs text-stone-400">
                Started: {project.dateCreated ? project.dateCreated.toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setView({ name: 'ProjectForm', projectId: project.id, projectData: project })
                }
                className="bg-emerald-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-emerald-600 transition shadow-md"
              >
                {status === 'In Progress' ? 'Edit Checklist' : 'View Report'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
