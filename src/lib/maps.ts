// Google Maps utilities for directions
export function buildDirections({ lat, lng, placeId }: { lat: number; lng: number; placeId?: string }) {
  const gmaps = placeId
    ? `https://www.google.com/maps/dir/?api=1&destination_place_id=${encodeURIComponent(placeId)}&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const apple = `http://maps.apple.com/?daddr=${lat},${lng}`;
  
  return isIOS ? apple : gmaps;
}

// Brazilian states list for dropdowns
export const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

// Fuel station brands
export const stationBrands = [
  { value: 'petrobras', label: 'Petrobras' },
  { value: 'shell', label: 'Shell' },
  { value: 'ipiranga', label: 'Ipiranga' },
  { value: 'ale', label: 'Ale' },
  { value: 'br', label: 'BR' },
  { value: 'bandeira-branca', label: 'Bandeira Branca' },
  { value: 'outro', label: 'Outro' }
];

// Payment methods
export const paymentMethods = [
  { value: 'credit-card', label: 'Cartão de Crédito' },
  { value: 'debit-card', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'fuel-card', label: 'Cartão Combustível' }
];