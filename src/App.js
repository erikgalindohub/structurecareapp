import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, collection, doc, query, where, onSnapshot, 
    addDoc, updateDoc, orderBy, Timestamp
} from 'firebase/firestore';

// --- Config and Global Variables ---
const placeholderBase = "https://placehold.co/400x300/10b981/ffffff?text=";
// FINAL AND CORRECT DATA SOURCE: Google Sheet Published as TSV
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLKA6Q1lcHhpkw-ZtiI364wtyAtrLJ6SZoUgGFuiRE0YTQEHYRiersA0S2LceGlUEgTeFCuRxPDbKx/pub?output=tsv"; 

// <<< USER'S CUSTOM FIREBASE CONFIGURATION >>>
const customFirebaseConfig = {
    apiKey: "AIzaSyD7AFxBfVUzXf_jFMTiXsbHfJfBDo5KuAY",
    authDomain: "projectdata-firebase.firebaseapp.com",
    projectId: "projectdata-firebase",
    storageBucket: "projectdata-firebase.firebasestorage.app",
    messagingSenderId: "20916193303",
    appId: "1:20916193303:web:12710ef4c5de433be47452",
    measurementId: "G-BMMEKV6M2F"
};

// Use the custom config to link to the user's project
const firebaseConfig = customFirebaseConfig;
const initialAuthToken = null;
const appId = 'default-app-id';


// --- Firebase Initialization Hook (Anonymous Only) ---
const useFirebase = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!firebaseConfig.projectId) {
            console.error("Firebase config is missing or invalid. Check customFirebaseConfig definition.");
            return;
        }

        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const authService = getAuth(app);

        // Function to handle the authentication process
        const authenticate = async () => {
            try {
                // Using Anonymous sign-in for the custom project.
                await signInAnonymously(authService);
            } catch (error) {
                console.error("Firebase Auth failed during initial sign-in:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(authService, (user) => {
            if (user) {
                setDb(firestore);
                setAuth(authService);
                setIsReady(true);
            } else {
                authenticate();
            }
        });

        return () => unsubscribe();
    }, [initialAuthToken]); 

    // We don't return userId because the Project Collection Ref doesn't use it in this shared setup
    // But we still need user data for getProjectsCollectionRef
    return { db, auth, isReady };
};

// --- Shared Projects Collection Reference ---
const getProjectsCollectionRef = (db) => {
    if (!db) return null;
    return collection(db, "projects");  // Always top-level "projects"
};

// --- Helpers (Network) ---

const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, options);
            if (!res.ok) {
                if (res.status === 429 && i < retries - 1) {
                    await new Promise(r => setTimeout(r, (2 ** i) * 1000 + Math.random() * 800));
                    continue;
                }
                throw new Error(`HTTP ${res.status}`);
            }
            return res;
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, (2 ** i) * 1000 + Math.random() * 800));
        }
    }
};


// --- Fetch Plant Data from Google Sheet ---
const usePlantData = () => {
    const [dbPlants, setDbPlants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                // Fetch data from the Google Sheet TSV URL
                const res = await fetchWithRetry(GOOGLE_SHEET_URL);
                const tsv = await res.text();
                const rows = tsv.trim().split("\n").map(r => r.split("\t"));
                rows.shift();
                const data = rows.map((c, i) => ({
                    id: `db-${i + 1}`,
                    name: c[1]?.trim() || 'Unknown Plant',
                    scientific: c[2]?.trim() || '',
                    type: c[3]?.trim() || 'Perennial', 
                    size: c[4]?.trim() || 'Medium',
                    aesthetic: c[5]?.trim() || 'Description Missing',
                    light: c[6]?.trim() || 'Varies',
                    soil: c[7]?.trim() || 'Varies',
                    water: c[8]?.trim() || 'Varies',
                    benefits: c[9]?.trim() || 'Varies',
                    subType: c[10]?.trim() || 'General',
                    imageUrl: placeholderBase + encodeURIComponent(c[1]?.trim() || 'Plant')
                })).filter(p => p.name !== 'Unknown Plant');
                setDbPlants(data);
            } catch (err) {
                console.error("Failed to load plant data:", err);
                setDbPlants([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlants();
    }, []);

    return { dbPlants, isLoading };
};

// --- Simple Custom Alert ---
const CustomAlert = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full space-y-4">
                <p className="text-lg font-medium text-red-600">Error</p>
                <p className="text-stone-700">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

// --- Zone Assignment Panel Component (Inline, not a modal) ---
const InlineZoneAssignment = ({ plant, zones, currentZones, onZoneToggle }) => {
    
    const handleToggle = (zone) => {
        const isCurrentlySelected = currentZones.includes(zone);
        const newZones = isCurrentlySelected ? 
            currentZones.filter(z => z !== zone) : 
            [...currentZones, zone];
        
        onZoneToggle(newZones, plant);
    };

    return (
        <div className="mt-2 pt-2 pb-2 pl-3 pr-3 bg-stone-100 rounded-b-lg border-t border-stone-300 transition-all duration-300">
            <p className="text-xs font-semibold text-stone-600 mb-2">Assign to Area(s):</p>
            <div className="flex flex-wrap gap-2">
                {zones.length > 0 ? (
                    zones.map(zone => (
                        <button
                            key={zone}
                            onClick={() => handleToggle(zone)}
                            className={`text-xs font-medium py-1 px-3 rounded-full border transition duration-150 ${
                                currentZones.includes(zone)
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                                    : 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300'
                            }`}
                        >
                            {zone}
                        </button>
                    ))
                ) : (
                    <p className="text-stone-500 italic text-xs">No areas defined. Use the input field above.</p>
                )}
            </div>
        </div>
    );
};

// --- Plant Detail Modal Component ---
const PlantDetailModal = ({ plant, onClose }) => {
    if (!plant) return null;

    const details = [
        { label: 'Scientific Name', value: plant.scientific, icon: '🔬' },
        { label: 'Type', value: plant.type, icon: '🌿' },
        { label: 'Mature Size', value: plant.size, icon: '📏' },
        { label: 'Light Needs', value: plant.light, icon: '☀️' },
        { label: 'Water Needs', value: plant.water, icon: '💧' },
        { label: 'Soil Type', value: plant.soil, icon: '🧱' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition duration-300">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-lg shadow-2xl overflow-y-auto transform scale-100">
                <div className="p-6 lg:p-8">
                    <header className="flex justify-between items-start pb-4 border-b border-stone-200">
                        <div>
                            <h2 className="text-2xl font-bold text-emerald-900">{plant.name}</h2>
                            <p className="text-stone-500 italic text-sm">{plant.scientific}</p>
                        </div>
                        <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-3xl">&times;</button>
                    </header>
                    
                    <img 
                        src={plant.imageUrl} 
                        alt={plant.name}
                        className="w-full h-48 object-cover rounded-lg mt-6 mb-6 border border-stone-200" 
                        onError={(e) => { e.target.src = placeholderBase + encodeURIComponent('No Image Available'); }}
                    />
                    
                    <div className="mt-6 space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg text-emerald-700 mb-2">Aesthetic & Placement</h3>
                            <p className="text-stone-600">{plant.aesthetic}</p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-center">
                            {details.map(d => (
                                <div key={d.label} className="bg-stone-50 p-4 rounded-lg border">
                                    <p className="text-xl mb-1">{d.icon}</p>
                                    <h4 className="font-bold text-stone-700 text-sm">{d.label}</h4>
                                    <p className="text-xs text-stone-600">{d.value}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-lg text-emerald-700 mb-2">Ecological Benefits</h3>
                            <p className="text-stone-600">{plant.benefits}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Dashboard View ---
const Dashboard = ({ setView }) => (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-stone-100">
        <div className="w-full max-w-lg p-10 bg-white rounded-xl shadow-2xl border-t-4 border-emerald-600 space-y-6">
            <h1 className="text-3xl font-extrabold text-emerald-800 text-center">Project Documentation Hub</h1>
            <p className="text-stone-500 text-center">Manage client projects efficiently for professional documentation.</p>

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

// --- Project List View ---
const ProjectList = ({ db, setView, status }) => {
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        const projectsRef = getProjectsCollectionRef(db);
        const q = query(projectsRef, where('status', '==', status), orderBy('dateCreated', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsArray = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                dateCreated: doc.data().dateCreated?.toDate(),
                dateCompleted: doc.data().dateCompleted?.toDate()
            }));
            setProjects(projectsArray);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [db, status]);

    const filteredProjects = projects.filter(p => 
        p.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientPhone?.includes(searchQuery) ||
        p.clientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
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
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                {filteredProjects.map(project => (
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
                                onClick={() => setView({ name: 'ProjectForm', projectId: project.id, projectData: project })} 
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

const FilterButton = ({ label, value, currentFilter, setFilter, isComplete, activeClasses, inactiveClasses }) => {
    const isActive = currentFilter === value;
    const baseClasses = "text-sm font-medium py-2 px-4 rounded-lg border transition disabled:opacity-50";
    
    return (
        <button
            onClick={() => setFilter(value)}
            disabled={isComplete}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {label}
        </button>
    );
};

const PlantListItem = React.memo(({ plant, isSelected, onToggle, zones, onZoneToggle, onDetailsClick, isComplete, editingPlantId, setEditingPlantId, plantRef }) => {
    // Panel opens if the plant is selected AND the project is NOT complete AND its ID matches the currently editing ID.
    const isPanelOpen = isSelected && !isComplete && editingPlantId === plant.id;
    
    // Find the plant's current zone assignments from the plant object itself
    const currentZones = plant.zones || [];

    // Toggling the plant's selection status
    const handleCheckboxChange = (e) => {
        if (!e.target.checked && isSelected) {
            // User is UNCHECKING: Remove plant and clear editing state
            onToggle(plant, false); 
            setEditingPlantId(null);
        } else if (e.target.checked && !isSelected) {
            // User is CHECKING: Add plant (handler takes care of assignment logic)
            onToggle(plant, true); 
            setEditingPlantId(plant.id); // Open panel immediately
        }
    };

    // If the entire card/label is clicked, and the plant is selected, we want to open/close the panel
    const handleLabelClick = (e) => {
        // Prevent event propagation if the click was on the checkbox itself or the Details button
        if (e.target.type === 'checkbox' || e.target.classList.contains('details-btn')) return;

        if (isComplete) return;

        if (isSelected) {
            // TOGGLE PANEL: If already selected, click toggles panel open/closed
            setEditingPlantId(editingPlantId === plant.id ? null : plant.id);
        } else {
            // NEW SELECTION: Add plant and open panel
             onToggle(plant, true); 
             setEditingPlantId(plant.id); 
        }
    };


    return (
        <div 
            ref={plantRef} // Attach the ref here for scrolling
            className={`transition-all duration-150 border rounded-lg ${isSelected ? 'shadow-md border-emerald-500' : 'border-gray-200'}`}
        >
            <div 
                onClick={handleLabelClick}
                className={`flex items-start p-3 cursor-pointer transition duration-100 
                    ${isSelected ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-white hover:bg-stone-50'}
                    ${isPanelOpen ? 'rounded-t-lg' : 'rounded-lg'}
                `}
            >
                {/* Checkbox Column */}
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 mt-0.5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 flex-shrink-0"
                    disabled={isComplete}
                />
                
                {/* Image + Details Column */}
<div className="ml-3 flex items-center space-x-3 flex-1">
    {/* Thumbnail Image */}
    <img
        src={plant.imageUrl || placeholderBase + encodeURIComponent(plant.name || 'Plant')}
        alt={plant.name}
        className="w-12 h-12 rounded-md object-cover border border-stone-300 flex-shrink-0"
        onError={(e) => { e.target.src = placeholderBase + encodeURIComponent('Plant'); }}
    />

    {/* Text Info */}
    <div className="flex-1 min-w-0 text-sm">
        <p className="font-semibold text-stone-800 truncate">{plant.name}</p>
        <p className="text-stone-500 italic text-xs truncate">{plant.scientific}</p>
        <p className="text-xs text-stone-400">{plant.type} • {plant.light}</p>
    </div>
</div>


                {/* Status and Action Column */}
                <div className="flex flex-col items-end space-y-1 ml-2 flex-shrink-0">
                    <button
                        onClick={() => onDetailsClick(plant)}
                        className="details-btn text-xs font-medium py-1 px-2 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 transition"
                    >
                        Details
                    </button>
                    {isSelected && currentZones.length > 0 && (
                         <div className="text-xs font-medium text-emerald-600 mt-1">
                            {currentZones.length} Area(s)
                        </div>
                    )}
                </div>
            </div>
            
            {/* Inline Assignment Panel (Conditional Slide-Down) */}
            {isPanelOpen && zones.length > 0 && (
                 <InlineZoneAssignment
                    plant={plant}
                    zones={zones}
                    currentZones={currentZones}
                    onZoneToggle={onZoneToggle}
                    // Since we are editing inline, closing the panel is done by toggling the editingPlantId
                />
            )}
            {/* Show error if zones are not defined */}
            {isPanelOpen && zones.length === 0 && (
                <div className="mt-2 p-2 text-xs text-red-600 bg-red-50 border-t border-red-300 rounded-b-lg">
                    Define areas first to assign this plant.
                </div>
            )}
        </div>
    );
});


const ProjectForm = ({ db, setView, projectId, projectData: initialData, dbPlants, isLoadingPlants }) => {
    const isNew = !projectId;
    const [project, setProject] = useState(initialData || {
        clientName: '', clientPhone: '', clientEmail: '', projectAddress: '', clientNotes: '', zones: [], status: 'In Progress', plants: []
    });
    const [zoneInput, setZoneInput] = useState(''); 
    const [isSaving, setIsSaving] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null); 
    
    // New state for Detail Modal
    const [selectedPlantDetails, setSelectedPlantDetails] = useState(null);

    // New state to control which plant's assignment panel is open
    const [editingPlantId, setEditingPlantId] = useState(null); 
    
    // Ref map for scrolling to selected plant
    const plantRefs = useRef({});

    // State for filtering and sorting
    const [filters, setFilters] = useState({
        searchTerm: '',
        filterCategory: '', // Tracks which category button is active (e.g., 'type')
        filterValue: '', // The actual value selected (e.g., 'Tree')
        filterZone: '', 
        sortBy: 'name', 
    });

    const { searchTerm, filterCategory, filterValue, filterZone, sortBy } = filters;
    
    // --- Derived Data ---
    const zones = project.zones;
    const isComplete = project.status === 'Completed';

    // PRIMARY FILTER GROUPS (Type Filters)
   const primaryFilters = [
  {
    key: 'type',
    label: '🌳 Trees',
    values: [
      'Tree',
      'Shade Tree',
      'Ornamental Tree',
      'Evergreen Tree',
      'Fruit Tree',
      'Nut Tree',
    ],
  },
  {
    key: 'type',
    label: '🌿 Shrubs',
    values: [
      'Shrub',
      'Foundation Shrub',
      'Flowering Shrub',
      'Evergreen Shrub',
      'Privacy Shrub',
      'Screening Shrub',
    ],
  },
  {
    key: 'type',
    label: '✨ Accents',
    values: [
      'Perennial',
      'Annual',
      'Flowering Plant',
      'Bulb',
      'Groundcover',
      'Ornamental Grass',
      'Succulent',
      'Cactus',
      'Vine',
      'Climber',
      'Aquatic Plant',
      'Bog Plant',
    ],
  },
];

    
    const selectedPlantsSummary = useMemo(() => {
        return project.plants.map(p => ({
            id: p.id,
            name: p.name,
            zones: p.zones || [],
            type: p.type
        }));
    }, [project.plants]);


    const allAvailablePlants = useMemo(() => {
        const combined = [...dbPlants];

        // --- Sorting Logic ---
        return combined.sort((a, b) => {
            if (sortBy === 'type') {
                const typeCompare = a.type.toLowerCase().localeCompare(b.type.toLowerCase());
                if (typeCompare !== 0) return typeCompare;
            }
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        });
    }, [dbPlants, sortBy]);

    // --- Filtering Logic ---
    const filteredPlants = useMemo(() => {
        const selectedPlantIds = new Set(project.plants.map(p => p.id));
        
        return allAvailablePlants.filter(plant => {
            const searchMatch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                plant.scientific.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (!searchMatch) return false;

            // Type Filter Logic (Primary Filter)
            if (filterCategory === 'type') {
  const group = primaryFilters.find(f => f.label === filterValue);
  if (group && !group.values.includes(plant.type)) return false;
}
            
            // ZONE FILTER: Only show plants that are selected AND in the filtered zone.
            if (filterZone) {
                const selectedPlant = project.plants.find(p => p.id === plant.id);
                // If filtering by zone, only show selected plants that belong to that zone
                if (selectedPlantIds.has(plant.id) && selectedPlant && selectedPlant.zones.includes(filterZone)) {
                     return true; 
                }
                return false; 
            }

            return true;
        });
    }, [allAvailablePlants, searchTerm, filterCategory, filterValue, filterZone]); 

    // Handle primary filter click (Trees, Shrubs, Accents buttons)
    const handlePrimaryFilter = (key, value) => {
        const isActive = filterCategory === key && filterValue === value;
        
        setFilters(prev => ({ 
            ...prev, 
            filterCategory: isActive ? '' : key, 
            filterValue: isActive ? '' : value
        }));
        setEditingPlantId(null); // Close any open panels
    };
    
    
    // Handle search term change
    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
    };
    
    // Handle sort change
    const handleSortChange = (newSort) => {
        setFilters(prev => ({ ...prev, sortBy: newSort }));
    };


    // Handle standard input change for client details and notes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject(prev => ({ ...prev, [name]: value }));
    };

    // --- Zone Tagging Logic ---
    const addZone = (zoneName) => {
        const cleanZone = zoneName.trim();
        if (cleanZone && !zones.includes(cleanZone)) {
            setProject(prev => ({ ...prev, zones: [...prev.zones, cleanZone] }));
            setZoneInput('');
        }
    };

    const removeZone = (zoneToRemove) => {
        const updatedZones = zones.filter(z => z !== zoneToRemove);
        const updatedPlants = project.plants.map(plant => ({
            ...plant,
            // Remove the zone from the plant's assignment array
            zones: plant.zones.filter(z => z !== zoneToRemove)
        }));
        
        setProject(prev => ({ ...prev, zones: updatedZones, plants: updatedPlants }));

        if (filterZone === zoneToRemove) {
            setFilters(prev => ({ ...prev, filterZone: '' }));
        }
        setEditingPlantId(null); // Close any open panels
    };

    const handleZoneInputKeyDown = (e) => {
        if (e.key === 'Enter' && zoneInput) {
            e.preventDefault(); 
            addZone(zoneInput);
        }
    };
    
    const clearAllFilters = () => {
        setFilters({
            searchTerm: '',
            filterCategory: '', 
            filterValue: '', 
            filterZone: '', 
            sortBy: filters.sortBy, // Keep current sort setting
        });
        setEditingPlantId(null); // Close any open panels
    };


    // --- Plant Assignment Handlers ---

    // Unified handler for all selection and zone assignment/update logic
    const handlePlantToggleOrZoneUpdate = (plant, isSelecting, updatedZones = null) => {
        const existingPlant = project.plants.find(p => p.id === plant.id);
        
        if (isSelecting === false) {
            // UNCHECKING: Remove plant entirely
             setProject(prev => ({
                ...prev, 
                plants: prev.plants.filter(p => p.id !== plant.id)
            }));
            setEditingPlantId(null);
            return;
        }

        if (updatedZones !== null) {
            // ZONE UPDATE from InlinePanel
            if (existingPlant) {
                // Update existing plant's zones
                setProject(prev => ({
                    ...prev,
                    plants: prev.plants.map(p => 
                        p.id === plant.id ? { ...p, zones: updatedZones } : p
                    )
                }));
            } else {
                // Initial assignment (only happens if plant wasn't in the list yet)
                if (zones.length === 0) { // Safety check moved here
                    setAlertMessage("Please define Planting Areas (Zones) first.");
                    return;
                }
                setProject(prev => ({
                    ...prev,
                    // New plant selection, add it with the new zones
                    plants: [...prev.plants, { ...plant, zones: updatedZones }] 
                }));
            }
        } else {
            // INITIAL CHECK: Add plant or toggle panel
             if (zones.length === 0) {
                 setAlertMessage("Please define Planting Areas (Zones) first.");
                 return;
            }
             
             if (!existingPlant) {
                 // New plant selection, add it with empty zones to open the panel
                 setProject(prev => ({
                    ...prev,
                    plants: [...prev.plants, { ...plant, zones: [] }]
                }));
             }
             setEditingPlantId(plant.id);
        }
    };
    
    // Handler for the buttons in the "Current Selections" summary (the fix)
    const handleSummaryPlantClick = (plant) => {
        if (isComplete) return;

        // Toggles the editing state: Open panel if closed, close if open
        const nextEditingId = editingPlantId === plant.id ? null : plant.id;
        setEditingPlantId(nextEditingId);

        // SCROLL INTO VIEW 
        const plantRef = plantRefs.current[plant.id];
        if (nextEditingId && plantRef && plantRef.current) {
            plantRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    
    // Effect to cleanup refs when filtered list changes (good housekeeping)
    useEffect(() => {
        plantRefs.current = filteredPlants.reduce((acc, plant) => {
            acc[plant.id] = plantRefs.current[plant.id] || React.createRef();
            return acc;
        }, {});
    }, [filteredPlants]); // Dependency on filteredPlants ensures refs are mapped

    // Save project to Firestore
    const saveProject = async (newStatus = project.status) => {
        if (!db) {
            setAlertMessage("Database connection is not ready. Please try again.");
            return;
        }
        
        if (!project.clientName || !project.clientEmail) {
            setAlertMessage("Client Name and Email are required before saving.");
            return;
        }
        
        // Final validation: Ensure all selected plants have at least one zone assigned
        const unassignedPlants = project.plants.filter(p => p.zones.length === 0);
        if (unassignedPlants.length > 0 && newStatus === 'Completed') {
            setAlertMessage(`Cannot finalize project. ${unassignedPlants.length} selected plant(s) (e.g., ${unassignedPlants[0].name}) do not have any Planting Areas assigned. Please assign areas before completing.`);
            return;
        }

        setIsSaving(true);
        try {
            const projectToSave = {
                ...project,
                status: newStatus,
                zones: zones, 
                dateCreated: project.dateCreated ? project.dateCreated : Timestamp.fromDate(new Date()),
                dateCompleted: newStatus === 'Completed' ? Timestamp.fromDate(new Date()) : null,
            };
            
            const projectsRef = getProjectsCollectionRef(db);

            if (isNew) {
                await addDoc(projectsRef, projectToSave);
            } else {
                const docRef = doc(projectsRef, projectId);
                await updateDoc(docRef, projectToSave);
            }
            setView({ name: 'ProjectList', status: newStatus });
        } catch (error) {
            console.error("Error saving project:", error);
            setAlertMessage("Failed to save project to the database. Check console for details.");
        } finally {
            setIsSaving(false);
        }
    };
    
    // Placeholder function for PDF Generation
    const handleGeneratePDF = () => {
        if (project.plants.length === 0) {
            setAlertMessage("Please select plants before attempting to generate the report.");
            return;
        }
        // The PDF generation logic would go here
        setAlertMessage("PDF Generation is on hold! But your plant list is locked in for the report.");
    };

    const isAnyFilterActive = searchTerm || filterCategory || filterValue || filterZone;

    return (
        <>
            <CustomAlert message={alertMessage} onClose={() => setAlertMessage(null)} />
            {selectedPlantDetails && (
                <PlantDetailModal 
                    plant={selectedPlantDetails} 
                    onClose={() => setSelectedPlantDetails(null)} 
                />
            )}
            
            <div className="p-8 lg:p-12 bg-stone-50 min-h-screen max-w-6xl mx-auto">
                <h1 className="text-3xl font-extrabold text-emerald-800 mb-6">
                    {isNew ? 'New Client Project Setup' : `Editing: ${project.clientName}`}
                </h1>
                
                <button 
                    onClick={() => setView({ name: 'ProjectList', status: project.status })} 
                    className="mb-6 text-sm text-stone-600 hover:text-emerald-700 transition"
                >
                    &larr; Back to {project.status === 'Completed' ? 'Completed' : 'Current'} Projects
                </button>
                
                {/* Client Info Form */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-l-4 border-yellow-600">
                    <h2 className="text-xl font-semibold text-stone-700 mb-4">Client Details & Notes</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <input 
                            type="text" name="clientName" placeholder="Client Name" 
                            value={project.clientName} onChange={handleChange} required
                            className="p-3 border rounded-lg" disabled={isComplete}
                        />
                        <input 
                            type="email" name="clientEmail" placeholder="Client Email" 
                            value={project.clientEmail} onChange={handleChange} required
                            className="p-3 border rounded-lg" disabled={isComplete}
                        />
                        <input 
                            type="tel" name="clientPhone" placeholder="Client Phone" 
                            value={project.clientPhone} onChange={handleChange}
                            className="p-3 border rounded-lg" disabled={isComplete}
                        />
                        <input 
                            type="text" name="projectAddress" placeholder="Project Address" 
                            value={project.projectAddress} onChange={handleChange}
                            className="p-3 border rounded-lg" disabled={isComplete}
                        />
                    </div>
                    {/* Notes Field */}
                    <textarea
                        name="clientNotes"
                        placeholder="Notes for the Client"
                        value={project.clientNotes}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-3 border rounded-lg resize-none"
                        disabled={isComplete}
                    ></textarea>
                </div>

                {/* Plant Checklist */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-l-4 border-emerald-600">
                    <h2 className="text-xl font-semibold text-stone-700 mb-4">Plant Selection Checklist</h2>
                    
                    {/* ZONES/AREAS TAGGING INPUT */}
                    <div className="mb-4 space-y-2">
                        <label className="text-sm font-semibold text-stone-600">Define Planting Areas:</label>
                        <div className="flex">
                            <input
                                type="text"
                                placeholder="Type area name (e.g., Backyard, Patio) and press Enter"
                                value={zoneInput}
                                onChange={(e) => setZoneInput(e.target.value)}
                                onKeyDown={handleZoneInputKeyDown}
                                className="flex-1 p-3 border rounded-l-lg"
                                disabled={isComplete}
                            />
                            <button
                                onClick={() => addZone(zoneInput)}
                                className="bg-yellow-500 text-white p-3 rounded-r-lg hover:bg-yellow-600 transition disabled:opacity-50 flex items-center justify-center"
                                disabled={isComplete || !zoneInput.trim()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Filter and Sort Controls */}
                    <div className="mb-6 space-y-4">
                        {/* ZONE FILTER BUTTONS */}
                        {zones.length > 0 && (
                            <div className="flex flex-wrap gap-2 items-center p-3 border-b border-stone-200">
                                <span className="text-sm font-semibold text-stone-600 pr-2">Areas:</span>
                                {zones.map(zone => (
                                    <div key={zone} className="flex items-center space-x-1">
                                        {/* Filter Button */}
                                        <FilterButton
                                            label={zone}
                                            value={zone}
                                            currentFilter={filterZone}
                                            setFilter={(value) => setFilters(prev => ({ ...prev, filterZone: prev.filterZone === value ? '' : value }))}
                                            isComplete={isComplete}
                                            activeClasses="bg-white text-yellow-800 border-yellow-500 shadow-sm ring-2 ring-yellow-500"
                                            inactiveClasses="bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                                        />
                                        {/* Remove Tag Button */}
                                        <button
                                            onClick={() => removeZone(zone)}
                                            disabled={isComplete}
                                            className="text-stone-400 hover:text-red-500 disabled:opacity-50"
                                            title={`Remove ${zone}`}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* PRIMARY TYPE FILTERS (Trees, Shrubs, Accents) */}
                        <div className="flex flex-wrap gap-3 items-center">
                            {primaryFilters.map((filterGroup, index) => (
  <FilterButton 
    key={`${filterGroup.label}-${index}`}
    label={filterGroup.label}
    value={filterGroup.label}
    currentFilter={filterValue}
    setFilter={(value) => handlePrimaryFilter(filterGroup.key, value)} 
    isComplete={isComplete}
    activeClasses="bg-emerald-700 text-white border-emerald-700 shadow-md"
    inactiveClasses="bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
  />
))}

                            
                            {/* SORT TOGGLE & CLEAR FILTER BUTTON */}
                            <div className="flex items-center space-x-3 ml-auto">
                                {/* Clear All Filters */}
                                {isAnyFilterActive && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm font-medium text-red-600 hover:text-red-800 underline disabled:opacity-50"
                                        disabled={isComplete}
                                        title="Reset all search and filter criteria"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                                
                                <div className="flex items-center space-x-2 p-1 bg-stone-100 rounded-lg border border-stone-300">
                                    <span className="text-sm font-semibold text-stone-600 pl-1">Sort:</span>
                                    <button
                                        onClick={() => handleSortChange('name')}
                                        disabled={isComplete}
                                        className={`py-1 px-3 text-sm font-medium rounded-md transition duration-150 ${
                                            sortBy === 'name' ? 'bg-white shadow-sm text-emerald-700' : 'text-stone-600 hover:text-emerald-600'
                                        }`}
                                    >
                                        A-Z
                                    </button>
                                    <button
                                        onClick={() => handleSortChange('type')}
                                        disabled={isComplete}
                                        className={`py-1 px-3 text-sm font-medium rounded-md transition duration-150 ${
                                            sortBy === 'type' ? 'bg-white shadow-sm text-emerald-700' : 'text-stone-600 hover:text-emerald-600'
                                        }`}
                                    >
                                        Type
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                    </div>

                    
                    {/* Search Bar */}
                    <div className="flex space-x-2 mb-4">
                        <input 
                            type="text" 
                            placeholder="Search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="flex-1 p-3 border rounded-lg"
                            disabled={isComplete}
                        />
                    </div>
                    
                    {isLoadingPlants && <p className="text-stone-500">Loading master plant list...</p>}

                    {/* Plant List / Checklist (Scrollable Area) */}
                    <div id="plant-list-container" className="h-96 overflow-y-auto border p-4 rounded-lg bg-stone-50 space-y-3">
                        {!isLoadingPlants && (
                            <>
                                <p className="text-sm text-stone-500 mb-2 font-medium">
                                    Showing {filteredPlants.length} plants.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {filteredPlants.map(plant => {
                                        const isSelected = project.plants.some(p => p.id === plant.id);
                                        const assignedPlant = project.plants.find(p => p.id === plant.id) || plant;
                                        
                                        // Initialize the ref for this plant item
                                        if (!plantRefs.current[plant.id]) {
                                            plantRefs.current[plant.id] = React.createRef();
                                        }

                                        return (
                                            <PlantListItem 
                                                key={plant.id}
                                                plant={assignedPlant}
                                                isSelected={isSelected}
                                                onToggle={handlePlantToggleOrZoneUpdate}
                                                onZoneToggle={(updatedZones) => handlePlantToggleOrZoneUpdate(plant, true, updatedZones)}
                                                onDetailsClick={setSelectedPlantDetails} // New detail handler
                                                zones={zones}
                                                isComplete={isComplete}
                                                editingPlantId={editingPlantId}
                                                setEditingPlantId={setEditingPlantId}
                                                plantRef={plantRefs.current[plant.id]} // Pass the ref down
                                            />
                                        );
                                    })}
                                </div>
                                {filteredPlants.length === 0 && searchTerm.length > 0 && (
                                     <p className="text-center text-stone-500 mt-4">No plants match your current filters. Clear your search or filters.</p>
                                )}
                            </>
                        )}
                    </div>
                    
                    {/* CURRENT SELECTIONS - MOVED HERE (Always Visible Footer) */}
                    {selectedPlantsSummary.length > 0 && (
                        <div className="mt-4 p-4 border-t border-emerald-300 rounded-lg bg-emerald-50">
                            <h3 className="text-base font-bold text-emerald-800 mb-2">Current Selections ({selectedPlantsSummary.length})</h3>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {selectedPlantsSummary.map(p => (
                                    <button 
                                        key={p.id}
                                        // This button now runs the specific handler to toggle the assignment panel for this specific plant
                                        onClick={() => handleSummaryPlantClick(p)} 
                                        className="bg-emerald-200 text-emerald-800 font-medium px-3 py-1 rounded-full hover:bg-emerald-300 transition duration-150"
                                    >
                                        {p.name} ({p.zones.join(', ') || 'Unassigned'})
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-stone-500 mt-2">Click a plant to scroll to it and edit its area assignment.</p>
                        </div>
                    )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between space-x-4 pt-4">
                    <button 
                        onClick={() => saveProject(project.status)} 
                        disabled={isSaving || isComplete}
                        className="flex-1 bg-sky-600 text-white font-bold py-3 rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Progress'}
                    </button>
                    
                    {!isComplete && (
                        <button 
                            onClick={() => saveProject('Completed')} 
                            disabled={isSaving || project.plants.length === 0}
                            className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition shadow-xl disabled:opacity-50"
                        >
                            Finalize & Complete Project ({project.plants.length} plants)
                        </button>
                    )}
                    
                    {isComplete && (
                        <button 
                            onClick={handleGeneratePDF} 
                            className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-xl"
                        >
                            Generate Final Client PDF 📄
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

// --- Main Application Component ---
const App = () => {
    const { db, isReady } = useFirebase();
    // usePlantData now fetches from the defined URL
    const { dbPlants, isLoading: isLoadingPlants } = usePlantData(); 
    const [view, setView] = useState({ name: 'Dashboard' });

    if (!isReady || isLoadingPlants) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-stone-100">
                <div className="text-xl font-medium text-emerald-700 flex items-center">
                    <span className="spinner h-6 w-6 border-4 border-emerald-500 rounded-full mr-3"></span>
                    Initializing App and Loading Resources...
                </div>
            </div>
        );
    }

    // Router logic based on the current view state
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
                    isLoadingPlants={isLoadingPlants}
                />
            );
        case 'ProjectList':
            return (
                <ProjectList
                    db={db}
                    setView={setView}
                    status={view.status}
                />
            );
        case 'Dashboard':
        default:
            return <Dashboard setView={setView} />;
    }
};

export default App;
