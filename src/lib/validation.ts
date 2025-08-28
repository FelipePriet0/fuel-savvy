// Validação de CPF
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // Sequência igual
  
  // Cálculo dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// Validação de CNPJ
export const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false; // Sequência igual
  
  // Cálculo do primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  // Cálculo do segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleanCNPJ.charAt(13))) return false;
  
  return true;
};

// Validação de senha
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Uma letra maiúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Um número');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validação detalhada de senha para feedback visual
export const getPasswordValidationStatus = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    isValid: password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password),
  };
};

// Validação de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Máscaras
export const maskCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
};

export const maskCNPJ = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2');
};

export const maskPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    return cleaned
      .slice(0, 10)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})/, '$1-$2');
  }
  return cleaned
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})/, '$1-$2');
};

export const maskCEP = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

// Validação de CEP
export const validateCEP = (cep: string): boolean => {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
};

// Validações de dados existentes
import { supabase } from '@/integrations/supabase/client';

export const checkEmailExists = async (email: string): Promise<{ exists: boolean; message?: string }> => {
  try {
    // Verificar em profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (profileData) {
      return { exists: true, message: 'Já existe uma conta com este email' };
    }

    // Verificar em postos
    const { data: postoData } = await supabase
      .from('postos')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (postoData) {
      return { exists: true, message: 'Já existe uma conta com este email' };
    }

    return { exists: false };
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return { exists: false };
  }
};

export const checkCPFExists = async (cpf: string): Promise<{ exists: boolean; message?: string }> => {
  try {
    const cleanCPF = cpf.replace(/\D/g, '');

    // Verificar em profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('cpf')
      .eq('cpf', cpf)
      .maybeSingle();

    if (profileData) {
      return { exists: true, message: 'Já existe uma conta com este CPF' };
    }

    return { exists: false };
  } catch (error) {
    console.error('Erro ao verificar CPF:', error);
    return { exists: false };
  }
};

export const checkCNPJExists = async (cnpj: string): Promise<{ exists: boolean; message?: string }> => {
  try {
    // Verificar em postos
    const { data: postoData } = await supabase
      .from('postos')
      .select('cnpj')
      .eq('cnpj', cnpj)
      .maybeSingle();

    if (postoData) {
      return { exists: true, message: 'Já existe uma conta com este CNPJ' };
    }

    return { exists: false };
  } catch (error) {
    console.error('Erro ao verificar CNPJ:', error);
    return { exists: false };
  }
};

export const checkPhoneExists = async (phone: string): Promise<{ exists: boolean; message?: string }> => {
  try {
    const cleanPhone = phone.replace(/\D/g, '');

    // Verificar em profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('telefone')
      .eq('telefone', phone)
      .maybeSingle();

    if (profileData) {
      return { exists: true, message: 'Já existe uma conta com este telefone' };
    }

    // Verificar em postos
    const { data: postoData } = await supabase
      .from('postos')
      .select('telefone')
      .eq('telefone', phone)
      .maybeSingle();

    if (postoData) {
      return { exists: true, message: 'Já existe uma conta com este telefone' };
    }

    return { exists: false };
  } catch (error) {
    console.error('Erro ao verificar telefone:', error);
    return { exists: false };
  }
};

// Validação consolidada para motoristas
export const validateDriverData = async (email: string, cpf: string, telefone: string): Promise<{ isValid: boolean; field?: string; message?: string }> => {
  try {
    // Verificar email
    const emailCheck = await checkEmailExists(email);
    if (emailCheck.exists) {
      return { isValid: false, field: 'email', message: emailCheck.message };
    }

    // Verificar CPF
    const cpfCheck = await checkCPFExists(cpf);
    if (cpfCheck.exists) {
      return { isValid: false, field: 'cpf', message: cpfCheck.message };
    }

    // Verificar telefone
    const phoneCheck = await checkPhoneExists(telefone);
    if (phoneCheck.exists) {
      return { isValid: false, field: 'telefone', message: phoneCheck.message };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Erro na validação de motorista:', error);
    return { isValid: false, message: 'Erro ao validar dados' };
  }
};

// Validação consolidada para postos
export const validateStationData = async (email: string, cnpj: string, telefone: string): Promise<{ isValid: boolean; field?: string; message?: string }> => {
  try {
    // Verificar email
    const emailCheck = await checkEmailExists(email);
    if (emailCheck.exists) {
      return { isValid: false, field: 'email', message: emailCheck.message };
    }

    // Verificar CNPJ
    const cnpjCheck = await checkCNPJExists(cnpj);
    if (cnpjCheck.exists) {
      return { isValid: false, field: 'cnpj', message: cnpjCheck.message };
    }

    // Verificar telefone
    const phoneCheck = await checkPhoneExists(telefone);
    if (phoneCheck.exists) {
      return { isValid: false, field: 'telefone', message: phoneCheck.message };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Erro na validação de posto:', error);
    return { isValid: false, message: 'Erro ao validar dados' };
  }
};