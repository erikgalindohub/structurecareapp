import { useReducer } from 'react';

const createInitialState = (projectData) => {
  const base = {
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    projectAddress: '',
    clientNotes: '',
    zones: [],
    status: 'In Progress',
    plants: [],
    dateCreated: null,
    dateCompleted: null,
  };

  const merged = {
    ...base,
    ...(projectData ?? {}),
  };

  return {
    ...merged,
    zones: merged.zones ?? [],
    plants: (merged.plants ?? []).map((plant) => ({
      ...plant,
      zones: plant.zones ?? [],
    })),
  };
};

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
      };
    case 'ADD_ZONE':
      if (!action.payload || state.zones.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        zones: [...state.zones, action.payload],
      };
    case 'REMOVE_ZONE': {
      const updatedZones = state.zones.filter((zone) => zone !== action.payload);
      const updatedPlants = state.plants.map((plant) => ({
        ...plant,
        zones: plant.zones.filter((zone) => zone !== action.payload),
      }));
      return {
        ...state,
        zones: updatedZones,
        plants: updatedPlants,
      };
    }
    case 'ADD_PLANT': {
      const exists = state.plants.some((plant) => plant.id === action.payload.plant.id);
      if (exists) {
        return state;
      }
      return {
        ...state,
        plants: [
          ...state.plants,
          {
            ...action.payload.plant,
            zones: action.payload.zones ?? [],
          },
        ],
      };
    }
    case 'REMOVE_PLANT':
      return {
        ...state,
        plants: state.plants.filter((plant) => plant.id !== action.payload),
      };
    case 'UPDATE_PLANT_ZONES':
      return {
        ...state,
        plants: state.plants.map((plant) =>
          plant.id === action.payload.plantId
            ? {
                ...plant,
                zones: action.payload.zones,
              }
            : plant
        ),
      };
    case 'LOAD_PROJECT':
      return createInitialState(action.payload);
    default:
      return state;
  }
};

const useProjectState = (projectData) => {
  const [project, dispatch] = useReducer(projectReducer, projectData, createInitialState);

  const actions = {
    setField: (name, value) => dispatch({ type: 'SET_FIELD', payload: { name, value } }),
    setStatus: (status) => dispatch({ type: 'SET_STATUS', payload: status }),
    addZone: (zone) => dispatch({ type: 'ADD_ZONE', payload: zone }),
    removeZone: (zone) => dispatch({ type: 'REMOVE_ZONE', payload: zone }),
    addPlant: (plant, zones = []) =>
      dispatch({ type: 'ADD_PLANT', payload: { plant, zones } }),
    removePlant: (plantId) => dispatch({ type: 'REMOVE_PLANT', payload: plantId }),
    updatePlantZones: (plantId, zones) =>
      dispatch({ type: 'UPDATE_PLANT_ZONES', payload: { plantId, zones } }),
    reloadProject: (data) => dispatch({ type: 'LOAD_PROJECT', payload: data }),
  };

  return { project, actions };
};

export default useProjectState;
