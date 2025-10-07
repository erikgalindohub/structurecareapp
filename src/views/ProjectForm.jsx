import {
  createRef,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Timestamp, addDoc, doc, updateDoc } from 'firebase/firestore';
import { PLACEHOLDER_BASE } from '../constants';
import { getProjectsCollectionRef } from '../firebase';
import useProjectState from '../hooks/useProjectState';

const PRIMARY_FILTERS = [
  {
    key: 'type',
    label: '🌳 Trees',
    values: ['Tree', 'Shade Tree', 'Ornamental Tree', 'Evergreen Tree', 'Fruit Tree', 'Nut Tree'],
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

const CustomAlert = ({ message, onClose }) => {
  if (!message) {
    return null;
  }

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

const InlineZoneAssignment = ({ plant, zones, currentZones, onZoneToggle }) => {
  const handleToggle = (zone) => {
    const isCurrentlySelected = currentZones.includes(zone);
    const newZones = isCurrentlySelected
      ? currentZones.filter((value) => value !== zone)
      : [...currentZones, zone];

    onZoneToggle(newZones, plant);
  };

  return (
    <div className="mt-2 pt-2 pb-2 pl-3 pr-3 bg-stone-100 rounded-b-lg border-t border-stone-300 transition-all duration-300">
      <p className="text-xs font-semibold text-stone-600 mb-2">Assign to Area(s):</p>
      <div className="flex flex-wrap gap-2">
        {zones.length > 0 ? (
          zones.map((zone) => (
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
          <p className="text-stone-500 italic text-xs">
            No areas defined. Use the input field above.
          </p>
        )}
      </div>
    </div>
  );
};

const PlantDetailModal = ({ plant, onClose }) => {
  if (!plant) {
    return null;
  }

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
            <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-3xl">
              &times;
            </button>
          </header>

          <img
            src={plant.imageUrl}
            alt={plant.name}
            className="w-full h-48 object-cover rounded-lg mt-6 mb-6 border border-stone-200"
            onError={(event) => {
              // eslint-disable-next-line no-param-reassign
              event.target.src = `${PLACEHOLDER_BASE}${encodeURIComponent('No Image Available')}`;
            }}
          />

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-emerald-700 mb-2">Aesthetic & Placement</h3>
              <p className="text-stone-600">{plant.aesthetic}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-center">
              {details.map((detail) => (
                <div key={detail.label} className="bg-stone-50 p-4 rounded-lg border">
                  <p className="text-xl mb-1">{detail.icon}</p>
                  <h4 className="font-bold text-stone-700 text-sm">{detail.label}</h4>
                  <p className="text-xs text-stone-600">{detail.value}</p>
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

const FilterButton = ({
  label,
  value,
  currentFilter,
  setFilter,
  isComplete,
  activeClasses,
  inactiveClasses,
}) => {
  const isActive = currentFilter === value;
  const baseClasses = 'text-sm font-medium py-2 px-4 rounded-lg border transition disabled:opacity-50';

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

const PlantListItem = memo(
  ({
    plant,
    isSelected,
    onToggle,
    zones,
    onZoneToggle,
    onDetailsClick,
    isComplete,
    editingPlantId,
    setEditingPlantId,
    plantRef,
  }) => {
    const currentZones = plant.zones || [];
    const isPanelOpen = isSelected && !isComplete && editingPlantId === plant.id;

    const handleCheckboxChange = (event) => {
      if (!event.target.checked && isSelected) {
        onToggle(plant, false);
        setEditingPlantId(null);
      } else if (event.target.checked && !isSelected) {
        onToggle(plant, true);
        setEditingPlantId(plant.id);
      }
    };

    const handleLabelClick = (event) => {
      if (event.target.type === 'checkbox' || event.target.classList.contains('details-btn')) {
        return;
      }

      if (isComplete) {
        return;
      }

      if (isSelected) {
        setEditingPlantId(editingPlantId === plant.id ? null : plant.id);
      } else {
        onToggle(plant, true);
        setEditingPlantId(plant.id);
      }
    };

    return (
      <div
        ref={plantRef}
        className={`transition-all duration-150 border rounded-lg ${
          isSelected ? 'shadow-md border-emerald-500' : 'border-gray-200'
        }`}
      >
        <div
          onClick={handleLabelClick}
          className={`flex items-start p-3 cursor-pointer transition duration-100 ${
            isSelected ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-white hover:bg-stone-50'
          } ${isPanelOpen ? 'rounded-t-lg' : 'rounded-lg'}`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="h-5 w-5 mt-0.5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 flex-shrink-0"
            disabled={isComplete}
          />

          <div className="ml-3 flex items-center space-x-3 flex-1">
            <img
              src={plant.imageUrl || `${PLACEHOLDER_BASE}${encodeURIComponent(plant.name || 'Plant')}`}
              alt={plant.name}
              className="w-12 h-12 rounded-md object-cover border border-stone-300 flex-shrink-0"
              onError={(event) => {
                // eslint-disable-next-line no-param-reassign
                event.target.src = `${PLACEHOLDER_BASE}${encodeURIComponent('Plant')}`;
              }}
            />

            <div className="flex-1 min-w-0 text-sm">
              <p className="font-semibold text-stone-800 truncate">{plant.name}</p>
              <p className="text-stone-500 italic text-xs truncate">{plant.scientific}</p>
              <p className="text-xs text-stone-400">
                {plant.type} • {plant.light}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1 ml-2 flex-shrink-0">
            <button
              onClick={() => onDetailsClick(plant)}
              className="details-btn text-xs font-medium py-1 px-2 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 transition"
            >
              Details
            </button>
            {isSelected && currentZones.length > 0 && (
              <div className="text-xs font-medium text-emerald-600 mt-1">{currentZones.length} Area(s)</div>
            )}
          </div>
        </div>

        {isPanelOpen && zones.length > 0 && (
          <InlineZoneAssignment
            plant={plant}
            zones={zones}
            currentZones={currentZones}
            onZoneToggle={onZoneToggle}
          />
        )}
        {isPanelOpen && zones.length === 0 && (
          <div className="mt-2 p-2 text-xs text-red-600 bg-red-50 border-t border-red-300 rounded-b-lg">
            Define areas first to assign this plant.
          </div>
        )}
      </div>
    );
  }
);

const OfflineBanner = () => (
  <div className="mb-4 p-3 rounded-lg border border-amber-500 bg-amber-100 text-amber-800 font-medium">
    You appear to be offline. Check your connection before saving project updates.
  </div>
);

const ProjectForm = ({ db, setView, projectId, projectData, dbPlants, isLoadingPlants }) => {
  const isNew = !projectId;
  const { project, actions } = useProjectState(projectData);
  const [zoneInput, setZoneInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [selectedPlantDetails, setSelectedPlantDetails] = useState(null);
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const plantRefs = useRef({});

  const [filters, setFilters] = useState({
    searchTerm: '',
    filterCategory: '',
    filterValue: '',
    filterZone: '',
    sortBy: 'name',
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { searchTerm, filterCategory, filterValue, filterZone, sortBy } = filters;
  const zones = project.zones;
  const isComplete = project.status === 'Completed';

  const selectedPlantsSummary = useMemo(
    () =>
      project.plants.map((plant) => ({
        id: plant.id,
        name: plant.name,
        zones: plant.zones || [],
        type: plant.type,
      })),
    [project.plants]
  );

  const allAvailablePlants = useMemo(() => {
    const combined = [...dbPlants];

    return combined.sort((a, b) => {
      if (sortBy === 'type') {
        const typeCompare = a.type.toLowerCase().localeCompare(b.type.toLowerCase());
        if (typeCompare !== 0) {
          return typeCompare;
        }
      }
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  }, [dbPlants, sortBy]);

  const filteredPlants = useMemo(() => {
    const selectedPlantIds = new Set(project.plants.map((plant) => plant.id));

    return allAvailablePlants.filter((plant) => {
      const searchMatch =
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientific.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) {
        return false;
      }

      if (filterCategory === 'type') {
        const group = PRIMARY_FILTERS.find((filterGroup) => filterGroup.label === filterValue);
        if (group && !group.values.includes(plant.type)) {
          return false;
        }
      }

      if (filterZone) {
        const selectedPlant = project.plants.find((value) => value.id === plant.id);
        if (selectedPlantIds.has(plant.id) && selectedPlant && selectedPlant.zones.includes(filterZone)) {
          return true;
        }
        return false;
      }

      return true;
    });
  }, [allAvailablePlants, filterCategory, filterValue, filterZone, project.plants, searchTerm]);

  const handlePrimaryFilter = (key, value) => {
    const isActive = filterCategory === key && filterValue === value;

    setFilters((prev) => ({
      ...prev,
      filterCategory: isActive ? '' : key,
      filterValue: isActive ? '' : value,
    }));
    setEditingPlantId(null);
  };

  const handleSearchChange = (event) => {
    setFilters((prev) => ({ ...prev, searchTerm: event.target.value }));
  };

  const handleSortChange = (newSort) => {
    setFilters((prev) => ({ ...prev, sortBy: newSort }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    actions.setField(name, value);
  };

  const addZone = (zoneName) => {
    const cleanZone = zoneName.trim();
    if (cleanZone) {
      actions.addZone(cleanZone);
      setZoneInput('');
    }
  };

  const removeZone = (zoneToRemove) => {
    actions.removeZone(zoneToRemove);

    if (filterZone === zoneToRemove) {
      setFilters((prev) => ({ ...prev, filterZone: '' }));
    }
    setEditingPlantId(null);
  };

  const handleZoneInputKeyDown = (event) => {
    if (event.key === 'Enter' && zoneInput) {
      event.preventDefault();
      addZone(zoneInput);
    }
  };

  const clearAllFilters = () => {
    setFilters((prev) => ({
      searchTerm: '',
      filterCategory: '',
      filterValue: '',
      filterZone: '',
      sortBy: prev.sortBy,
    }));
    setEditingPlantId(null);
  };

  const handlePlantToggleOrZoneUpdate = (plant, isSelecting, updatedZones = null) => {
    const existingPlant = project.plants.find((value) => value.id === plant.id);

    if (isSelecting === false) {
      actions.removePlant(plant.id);
      setEditingPlantId(null);
      return;
    }

    if (updatedZones !== null) {
      if (!existingPlant) {
        if (zones.length === 0) {
          setAlertMessage('Please define Planting Areas (Zones) first.');
          return;
        }
        actions.addPlant(plant, updatedZones);
      } else {
        actions.updatePlantZones(plant.id, updatedZones);
      }
      return;
    }

    if (zones.length === 0) {
      setAlertMessage('Please define Planting Areas (Zones) first.');
      return;
    }

    if (!existingPlant) {
      actions.addPlant(plant, []);
    }
    setEditingPlantId(plant.id);
  };

  const handleSummaryPlantClick = (plant) => {
    if (isComplete) {
      return;
    }

    const nextEditingId = editingPlantId === plant.id ? null : plant.id;
    setEditingPlantId(nextEditingId);

    const plantRef = plantRefs.current[plant.id];
    if (nextEditingId && plantRef && plantRef.current) {
      plantRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    plantRefs.current = filteredPlants.reduce((acc, plant) => {
      acc[plant.id] = plantRefs.current[plant.id] || createRef();
      return acc;
    }, {});
  }, [filteredPlants]);

  const saveProject = async (newStatus = project.status) => {
    if (!isOnline) {
      setAlertMessage('You appear to be offline. Reconnect before saving your progress.');
      return;
    }

    if (!db) {
      setAlertMessage('Database connection is not ready. Please try again.');
      return;
    }

    if (!project.clientName || !project.clientEmail) {
      setAlertMessage('Client Name and Email are required before saving.');
      return;
    }

    const unassignedPlants = project.plants.filter((plant) => plant.zones.length === 0);
    if (unassignedPlants.length > 0 && newStatus === 'Completed') {
      setAlertMessage(
        `Cannot finalize project. ${unassignedPlants.length} selected plant(s) (e.g., ${unassignedPlants[0].name}) do not have any Planting Areas assigned. Please assign areas before completing.`
      );
      return;
    }

    setIsSaving(true);
    try {
      const projectToSave = {
        ...project,
        status: newStatus,
        zones,
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
      console.error('Error saving project:', error);
      setAlertMessage('Failed to save project to the database. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = () => {
    if (project.plants.length === 0) {
      setAlertMessage('Please select plants before attempting to generate the report.');
      return;
    }
    setAlertMessage('PDF Generation is on hold! But your plant list is locked in for the report.');
  };

  const isAnyFilterActive = searchTerm || filterCategory || filterValue || filterZone;

  return (
    <>
      <CustomAlert message={alertMessage} onClose={() => setAlertMessage(null)} />
      {selectedPlantDetails && (
        <PlantDetailModal plant={selectedPlantDetails} onClose={() => setSelectedPlantDetails(null)} />
      )}

      <div className="p-8 lg:p-12 bg-stone-50 min-h-screen max-w-6xl mx-auto">
        {!isOnline && <OfflineBanner />}

        <h1 className="text-3xl font-extrabold text-emerald-800 mb-6">
          {isNew ? 'New Client Project Setup' : `Editing: ${project.clientName}`}
        </h1>

        <button
          onClick={() => setView({ name: 'ProjectList', status: project.status })}
          className="mb-6 text-sm text-stone-600 hover:text-emerald-700 transition"
        >
          &larr; Back to {project.status === 'Completed' ? 'Completed' : 'Current'} Projects
        </button>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-l-4 border-yellow-600">
          <h2 className="text-xl font-semibold text-stone-700 mb-4">Client Details & Notes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              name="clientName"
              placeholder="Client Name"
              value={project.clientName}
              onChange={handleChange}
              required
              className="p-3 border rounded-lg"
              disabled={isComplete}
            />
            <input
              type="email"
              name="clientEmail"
              placeholder="Client Email"
              value={project.clientEmail}
              onChange={handleChange}
              required
              className="p-3 border rounded-lg"
              disabled={isComplete}
            />
            <input
              type="tel"
              name="clientPhone"
              placeholder="Client Phone"
              value={project.clientPhone}
              onChange={handleChange}
              className="p-3 border rounded-lg"
              disabled={isComplete}
            />
            <input
              type="text"
              name="projectAddress"
              placeholder="Project Address"
              value={project.projectAddress}
              onChange={handleChange}
              className="p-3 border rounded-lg"
              disabled={isComplete}
            />
          </div>
          <textarea
            name="clientNotes"
            placeholder="Notes for the Client"
            value={project.clientNotes}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border rounded-lg resize-none"
            disabled={isComplete}
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-l-4 border-emerald-600">
          <h2 className="text-xl font-semibold text-stone-700 mb-4">Plant Selection Checklist</h2>

          <div className="mb-4 space-y-2">
            <label className="text-sm font-semibold text-stone-600">Define Planting Areas:</label>
            <div className="flex">
              <input
                type="text"
                placeholder="Type area name (e.g., Backyard, Patio) and press Enter"
                value={zoneInput}
                onChange={(event) => setZoneInput(event.target.value)}
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
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            {zones.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center p-3 border-b border-stone-200">
                <span className="text-sm font-semibold text-stone-600 pr-2">Areas:</span>
                {zones.map((zone) => (
                  <div key={zone} className="flex items-center space-x-1">
                    <FilterButton
                      label={zone}
                      value={zone}
                      currentFilter={filterZone}
                      setFilter={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          filterZone: prev.filterZone === value ? '' : value,
                        }))
                      }
                      isComplete={isComplete}
                      activeClasses="bg-white text-yellow-800 border-yellow-500 shadow-sm ring-2 ring-yellow-500"
                      inactiveClasses="bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                    />
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

            <div className="flex flex-wrap gap-3 items-center">
              {PRIMARY_FILTERS.map((filterGroup, index) => (
                <FilterButton
                  key={`${filterGroup.label}-${index.toString()}`}
                  label={filterGroup.label}
                  value={filterGroup.label}
                  currentFilter={filterValue}
                  setFilter={(value) => handlePrimaryFilter(filterGroup.key, value)}
                  isComplete={isComplete}
                  activeClasses="bg-emerald-700 text-white border-emerald-700 shadow-md"
                  inactiveClasses="bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
                />
              ))}

              <div className="flex items-center space-x-3 ml-auto">
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

          <div className="h-96 overflow-y-auto border p-4 rounded-lg bg-stone-50 space-y-3">
            {!isLoadingPlants && (
              <>
                <p className="text-sm text-stone-500 mb-2 font-medium">Showing {filteredPlants.length} plants.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredPlants.map((plant) => {
                    const isSelected = project.plants.some((value) => value.id === plant.id);
                    const assignedPlant = project.plants.find((value) => value.id === plant.id) || plant;

                    if (!plantRefs.current[plant.id]) {
                      plantRefs.current[plant.id] = createRef();
                    }

                    return (
                      <PlantListItem
                        key={plant.id}
                        plant={assignedPlant}
                        isSelected={isSelected}
                        onToggle={handlePlantToggleOrZoneUpdate}
                        onZoneToggle={(updatedZones) => handlePlantToggleOrZoneUpdate(plant, true, updatedZones)}
                        onDetailsClick={setSelectedPlantDetails}
                        zones={zones}
                        isComplete={isComplete}
                        editingPlantId={editingPlantId}
                        setEditingPlantId={setEditingPlantId}
                        plantRef={plantRefs.current[plant.id]}
                      />
                    );
                  })}
                </div>
                {filteredPlants.length === 0 && searchTerm.length > 0 && (
                  <p className="text-center text-stone-500 mt-4">
                    No plants match your current filters. Clear your search or filters.
                  </p>
                )}
              </>
            )}
          </div>

          {selectedPlantsSummary.length > 0 && (
            <div className="mt-4 p-4 border-t border-emerald-300 rounded-lg bg-emerald-50">
              <h3 className="text-base font-bold text-emerald-800 mb-2">
                Current Selections ({selectedPlantsSummary.length})
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {selectedPlantsSummary.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => handleSummaryPlantClick(plant)}
                    className="bg-emerald-200 text-emerald-800 font-medium px-3 py-1 rounded-full hover:bg-emerald-300 transition duration-150"
                  >
                    {plant.name} ({plant.zones.join(', ') || 'Unassigned'})
                  </button>
                ))}
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Click a plant to scroll to it and edit its area assignment.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between space-x-4 pt-4">
          <button
            onClick={() => saveProject(project.status)}
            disabled={isSaving || isComplete || !isOnline}
            className="flex-1 bg-sky-600 text-white font-bold py-3 rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Progress'}
          </button>

          {!isComplete && (
            <button
              onClick={() => saveProject('Completed')}
              disabled={isSaving || project.plants.length === 0 || !isOnline}
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

export default ProjectForm;
