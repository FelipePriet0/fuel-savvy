import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'driver' | 'station';

export interface BasicData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface DriverData {
  cpf: string;
  licensePlate: string;
  city: string;
  state: string;
  paymentMethod: string;
}

export interface StationData {
  cnpj: string;
  stationName: string;
  brand: string;
  managerName: string;
  managerPhone: string;
}

export interface LocationData {
  placeId: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

export interface OnboardingState {
  role: UserRole | null;
  basicData: BasicData;
  driverData: DriverData;
  stationData: StationData;
  locationData: LocationData | null;
  currentStep: number;
}

interface OnboardingContextType {
  state: OnboardingState;
  updateRole: (role: UserRole) => void;
  updateBasicData: (data: Partial<BasicData>) => void;
  updateDriverData: (data: Partial<DriverData>) => void;
  updateStationData: (data: Partial<StationData>) => void;
  updateLocationData: (data: LocationData) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetOnboarding: () => void;
}

const initialState: OnboardingState = {
  role: null,
  basicData: {
    fullName: '',
    email: '',
    phone: '',
    password: ''
  },
  driverData: {
    cpf: '',
    licensePlate: '',
    city: '',
    state: '',
    paymentMethod: ''
  },
  stationData: {
    cnpj: '',
    stationName: '',
    brand: '',
    managerName: '',
    managerPhone: ''
  },
  locationData: null,
  currentStep: 0
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(initialState);

  const updateRole = (role: UserRole) => {
    setState(prev => ({ ...prev, role, currentStep: 1 }));
  };

  const updateBasicData = (data: Partial<BasicData>) => {
    setState(prev => ({
      ...prev,
      basicData: { ...prev.basicData, ...data }
    }));
  };

  const updateDriverData = (data: Partial<DriverData>) => {
    setState(prev => ({
      ...prev,
      driverData: { ...prev.driverData, ...data }
    }));
  };

  const updateStationData = (data: Partial<StationData>) => {
    setState(prev => ({
      ...prev,
      stationData: { ...prev.stationData, ...data }
    }));
  };

  const updateLocationData = (data: LocationData) => {
    setState(prev => ({ ...prev, locationData: data }));
  };

  const nextStep = () => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
  };

  const resetOnboarding = () => {
    setState(initialState);
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        updateRole,
        updateBasicData,
        updateDriverData,
        updateStationData,
        updateLocationData,
        nextStep,
        prevStep,
        resetOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};