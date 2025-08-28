import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ProfileType = 'motorista' | 'posto';

export interface MotoristaData {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export interface PostoData {
  cnpj: string;
  nome_fantasia: string;
  email: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  bandeira?: string;
  senha?: string;
  confirmarSenha?: string;
}

interface SignupContextType {
  profileType: ProfileType | null;
  currentStep: number;
  motoristaData: MotoristaData;
  postoData: PostoData;
  setProfileType: (type: ProfileType) => void;
  setMotoristaData: (data: Partial<MotoristaData>) => void;
  setPostoData: (data: Partial<PostoData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetContext: () => void;
}

const SignupContext = createContext<SignupContextType | null>(null);

const initialMotoristaData: MotoristaData = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  senha: '',
  confirmarSenha: '',
};

const initialPostoData: PostoData = {
  cnpj: '',
  nome_fantasia: '',
  email: '',
  telefone: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
};

export const SignupProvider = ({ children }: { children: ReactNode }) => {
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [motoristaData, setMotoristaDataState] = useState<MotoristaData>(initialMotoristaData);
  const [postoData, setPostoDataState] = useState<PostoData>(initialPostoData);

  const setMotoristaData = (data: Partial<MotoristaData>) => {
    setMotoristaDataState(prev => ({ ...prev, ...data }));
  };

  const setPostoData = (data: Partial<PostoData>) => {
    setPostoDataState(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const resetContext = () => {
    setProfileType(null);
    setCurrentStep(1);
    setMotoristaDataState(initialMotoristaData);
    setPostoDataState(initialPostoData);
  };

  return (
    <SignupContext.Provider value={{
      profileType,
      currentStep,
      motoristaData,
      postoData,
      setProfileType,
      setMotoristaData,
      setPostoData,
      nextStep,
      prevStep,
      resetContext,
    }}>
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error('useSignup deve ser usado dentro de um SignupProvider');
  }
  return context;
};