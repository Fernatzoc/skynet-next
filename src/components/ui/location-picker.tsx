'use client';

import { useCallback, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';

interface LocationPickerProps {
    latitude: number | null;
    longitude: number | null;
    onLocationChange: (lat: number, lng: number) => void;
    disabled?: boolean;
}

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem',
};

// Coordenadas por defecto (Tegucigalpa, Honduras)
const defaultCenter = {
    lat: 14.0818,
    lng: -87.2068,
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export function LocationPicker({ latitude, longitude, onLocationChange, disabled }: LocationPickerProps) {
    const [searchAddress, setSearchAddress] = useState('');
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
        latitude && longitude ? { lat: latitude, lng: longitude } : null
    );
    const [isSearching, setIsSearching] = useState(false);

    const center = marker || defaultCenter;

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleMapClick = useCallback(
        (e: google.maps.MapMouseEvent) => {
            if (disabled || !e.latLng) return;

            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            setMarker({ lat, lng });
            onLocationChange(lat, lng);
        },
        [disabled, onLocationChange]
    );

    const handleSearchAddress = useCallback(async () => {
        if (!searchAddress.trim() || !map) return;

        setIsSearching(true);

        try {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ address: searchAddress });

            if (result.results[0]) {
                const location = result.results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();

                setMarker({ lat, lng });
                onLocationChange(lat, lng);
                map.panTo({ lat, lng });
                map.setZoom(15);
            }
        } catch (error) {
            console.error('Error searching address:', error);
        } finally {
            setIsSearching(false);
        }
    }, [searchAddress, map, onLocationChange]);

    const handleUseCurrentLocation = useCallback(() => {
        if (disabled || !map) return;

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    setMarker({ lat, lng });
                    onLocationChange(lat, lng);
                    map.panTo({ lat, lng });
                    map.setZoom(15);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('No se pudo obtener tu ubicación actual. Verifica los permisos del navegador.');
                }
            );
        } else {
            alert('Tu navegador no soporta geolocalización');
        }
    }, [disabled, map, onLocationChange]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchAddress();
        }
    };

    if (!GOOGLE_MAPS_API_KEY) {
        return (
            <div className="border border-red-200 bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">
                    ⚠️ API Key de Google Maps no configurada. Agrega <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> a tu archivo <code>.env.local</code>
                </p>
                <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="lat-manual">Latitud *</Label>
                            <Input
                                id="lat-manual"
                                type="number"
                                step="any"
                                value={latitude || ''}
                                onChange={(e) => {
                                    const lat = parseFloat(e.target.value);
                                    if (!isNaN(lat) && longitude) {
                                        onLocationChange(lat, longitude);
                                    }
                                }}
                                placeholder="14.0818"
                                disabled={disabled}
                            />
                        </div>
                        <div>
                            <Label htmlFor="lng-manual">Longitud *</Label>
                            <Input
                                id="lng-manual"
                                type="number"
                                step="any"
                                value={longitude || ''}
                                onChange={(e) => {
                                    const lng = parseFloat(e.target.value);
                                    if (!isNaN(lng) && latitude) {
                                        onLocationChange(latitude, lng);
                                    }
                                }}
                                placeholder="-87.2068"
                                disabled={disabled}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        placeholder="Buscar dirección... (ej: Tegucigalpa, Honduras)"
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={disabled || isSearching}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearchAddress}
                    disabled={disabled || isSearching || !searchAddress.trim()}
                >
                    <Search className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseCurrentLocation}
                    disabled={disabled}
                    title="Usar mi ubicación actual"
                >
                    <MapPin className="h-4 w-4" />
                </Button>
            </div>

            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={marker ? 15 : 12}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={handleMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: true,
                        fullscreenControl: false,
                    }}
                >
                    {marker && <Marker position={marker} />}
                </GoogleMap>
            </LoadScript>

            {marker && (
                <div className="text-sm text-muted-foreground">
                    <strong>Coordenadas seleccionadas:</strong> {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Haz clic en el mapa para seleccionar la ubicación del cliente
            </p>
        </div>
    );
}
