import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MapPin, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/Stepper';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader } from '@googlemaps/js-api-loader';

declare global {
  interface Window {
    google: typeof google;
  }
}

const steps = [
  { id: 0, title: 'Perfil' },
  { id: 1, title: 'Dados Básicos' },
  { id: 2, title: 'Dados do Posto' },
  { id: 3, title: 'Localização' }
];

// Temporary Google Maps API key - user needs to set this in environment
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // User needs to replace this

export const LocationPicker: React.FC = () => {
  const { state, updateLocationData, prevStep } = useOnboarding();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize Google Maps
    if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      toast.error('Google Maps API key não configurada. Configure VITE_GOOGLE_MAPS_API_KEY no ambiente.');
      return;
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      setMapLoaded(true);
      initializeMap();
      initializeAutocomplete();
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
      toast.error('Erro ao carregar o mapa');
    });
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;

    // Default to São Paulo center
    const center = { lat: -23.5505, lng: -46.6333 };
    
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    // Add click listener to map
    mapInstance.current.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        updateMapMarker(lat, lng);
        reverseGeocode(lat, lng);
      }
    });
  };

  const initializeAutocomplete = () => {
    if (!searchInputRef.current || !window.google) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(
      searchInputRef.current,
      {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'BR' }
      }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        updateMapMarker(lat, lng);
        
        if (mapInstance.current) {
          mapInstance.current.setCenter({ lat, lng });
          mapInstance.current.setZoom(18);
        }

        updateLocationData({
          placeId: place.place_id || '',
          formattedAddress: place.formatted_address || '',
          lat,
          lng
        });
        
        setHasLocation(true);
        setSearchValue(place.formatted_address || '');
      }
    });
  };

  const updateMapMarker = (lat: number, lng: number) => {
    if (!mapInstance.current) return;

    // Remove existing marker
    if (markerInstance.current) {
      markerInstance.current.setMap(null);
    }

    // Create new marker
    markerInstance.current = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstance.current,
      draggable: true,
      title: 'Localização do posto'
    });

    // Add drag listener
    markerInstance.current.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        reverseGeocode(newLat, newLng);
      }
    });
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        
        updateLocationData({
          placeId: result.place_id,
          formattedAddress: result.formatted_address,
          lat,
          lng
        });
        
        setSearchValue(result.formatted_address);
        setHasLocation(true);
      }
    });
  };

  const handleConfirmLocation = async () => {
    if (!hasLocation || !state.locationData) {
      toast.error('Selecione um endereço válido na lista ou no mapa');
      return;
    }

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error('Usuário não encontrado');
        navigate('/signup');
        return;
      }

      // Create station data
      const { error } = await supabase
        .from('stations_new')
        .insert({
          id: user.user.id,
          cnpj: state.stationData.cnpj.replace(/\D/g, ''),
          station_name: state.stationData.stationName,
          brand: state.stationData.brand,
          manager_name: state.stationData.managerName,
          manager_phone: state.stationData.managerPhone.replace(/\D/g, ''),
          place_id: state.locationData.placeId,
          formatted_address: state.locationData.formattedAddress,
          lat: state.locationData.lat,
          lng: state.locationData.lng,
          status: 'pending'
        });

      if (error) {
        if (error.message.includes('duplicate key')) {
          toast.error('CNPJ já cadastrado no sistema');
        } else {
          toast.error('Erro ao salvar dados: ' + error.message);
        }
        return;
      }

      toast.success('Cadastro realizado com sucesso! Seus dados estão em análise.');
      navigate('/onboarding/station');
    } catch (error) {
      console.error('Station data error:', error);
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    prevStep();
    navigate('/signup/station');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Stepper steps={steps} currentStep={state.currentStep} className="mb-8" />

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Localização do Posto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">
                <Search className="w-4 h-4 inline mr-2" />
                Buscar endereço ou nome do posto
              </Label>
              <Input
                ref={searchInputRef}
                id="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Digite o endereço do posto..."
                disabled={!mapLoaded}
              />
            </div>

            <div className="space-y-2">
              <Label>Mapa Interativo</Label>
              <div 
                ref={mapRef} 
                className="w-full h-64 rounded-md border bg-muted flex items-center justify-center"
              >
                {!mapLoaded && (
                  <div className="text-center">
                    <p className="text-muted-foreground">Carregando mapa...</p>
                    {GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' && (
                      <p className="text-red-500 text-sm mt-2">
                        Configure VITE_GOOGLE_MAPS_API_KEY
                      </p>
                    )}
                  </div>
                )}
              </div>
              {mapLoaded && (
                <p className="text-xs text-muted-foreground">
                  Clique no mapa ou arraste o pin para ajustar a localização exata
                </p>
              )}
            </div>

            {hasLocation && state.locationData && (
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Endereço selecionado:</p>
                    <p className="text-sm text-muted-foreground">{state.locationData.formattedAddress}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button 
                onClick={handleConfirmLocation} 
                disabled={loading || !hasLocation}
                className="flex-1"
              >
                {loading ? 'Finalizando...' : 'Confirmar Localização'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};