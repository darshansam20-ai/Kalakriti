import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

const libraries: "places"[] = ["places"];
const mapContainerStyle = { width: '100%', height: '250px' };
const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India Center

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  houseNo: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  description: string; // compatibility with existing mapping
}

interface AddressFormProps {
  onSave: (address: Address) => void;
  onCancel: () => void;
  initialAddress?: Partial<Address>;
}

export const AddressForm: React.FC<AddressFormProps> = ({ onSave, onCancel, initialAddress }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [formData, setFormData] = useState({
    fullName: initialAddress?.fullName || '',
    phone: initialAddress?.phone || '',
    houseNo: initialAddress?.houseNo || '',
    area: initialAddress?.area || '',
    landmark: initialAddress?.landmark || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    pincode: initialAddress?.pincode || '',
  });

  const [markerPos, setMarkerPos] = useState({ lat: initialAddress?.lat || 0, lng: initialAddress?.lng || 0 });
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const {
    ready,
    value: searchValue,
    suggestions: { status, data },
    setValue: setSearchValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "in" },
    },
    debounce: 300,
  });

  useEffect(() => {
    if (initialAddress?.lat && initialAddress?.lng) {
      setMapCenter({ lat: initialAddress.lat, lng: initialAddress.lng });
      setMarkerPos({ lat: initialAddress.lat, lng: initialAddress.lng });
    } else {
      // Try to get user current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            setMapCenter(pos);
            setMarkerPos(pos);
          },
          () => console.log("Geolocation blocked or failed")
        );
      }
    }
  }, [initialAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mapRef = useRef<google.maps.Map | null>(null);
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleSelectPlace = async (description: string) => {
    setSearchValue(description, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      setMapCenter({ lat, lng });
      setMarkerPos({ lat, lng });
      
      // Auto-fill some fields if possible
      const addressComponents = results[0].address_components;
      let city = formData.city;
      let state = formData.state;
      let pincode = formData.pincode;

      for (let component of addressComponents) {
        if (component.types.includes("locality")) city = component.long_name;
        if (component.types.includes("administrative_area_level_1")) state = component.long_name;
        if (component.types.includes("postal_code")) pincode = component.long_name;
      }
      
      setFormData(prev => ({
        ...prev,
        city,
        state,
        pincode,
        area: description
      }));

    } catch (error) {
      console.log("Error getting geocode: ", error);
    }
  };

  const handleMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });

      // reverse geocode
      try {
        const results = await getGeocode({ location: { lat, lng } });
        if (results && results[0]) {
          const addressComponents = results[0].address_components;
          let city = formData.city;
          let state = formData.state;
          let pincode = formData.pincode;

          for (let component of addressComponents) {
            if (component.types.includes("locality")) city = component.long_name;
            if (component.types.includes("administrative_area_level_1")) state = component.long_name;
            if (component.types.includes("postal_code")) pincode = component.long_name;
          }
          
          setFormData(prev => ({
            ...prev,
            city,
            state,
            pincode,
            area: results[0].formatted_address
          }));
          setSearchValue(results[0].formatted_address, false);
        }
      } catch (error) {
        console.log("Reverse geocode error: ", error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!markerPos.lat || !markerPos.lng) {
      alert("Please select a location on the map.");
      return;
    }
    const fullDesc = `${formData.houseNo}, ${formData.area}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
    onSave({
      id: initialAddress?.id || new Date().getTime().toString(),
      ...formData,
      lat: markerPos.lat,
      lng: markerPos.lng,
      description: fullDesc
    });
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-ink mb-1">Full Name</label>
          <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-1">Mobile Number</label>
          <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-ink mb-1">Search Area / Location</label>
        <div className="relative">
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={!ready}
            placeholder="Start typing your area..."
            className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]"
          />
          {status === "OK" && (
            <ul className="absolute z-10 w-full border border-black/10 rounded-[8px] mt-1 bg-white max-h-48 overflow-y-auto shadow-lg">
              {data.map(({ place_id, description }) => (
                <li
                  key={place_id}
                  onClick={() => handleSelectPlace(description)}
                  className="p-3 hover:bg-accent-soft cursor-pointer text-[14px]"
                >
                  {description}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border border-black/10 rounded-[8px] overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={15}
          center={mapCenter}
          onLoad={onMapLoad}
          options={{ disableDefaultUI: true, zoomControl: true }}
        >
          {(markerPos.lat !== 0 || markerPos.lng !== 0) && (
            <Marker
              position={markerPos}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </GoogleMap>
      </div>
      <p className="text-[12px] text-text-light text-center">Drag the marker to pinpoint your exact location</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-ink mb-1">Flat, House no., Building</label>
          <input required type="text" name="houseNo" value={formData.houseNo} onChange={handleChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-1">Landmark (Optional)</label>
          <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <label className="block text-[13px] font-bold text-ink mb-1">City</label>
          <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
        </div>
        <div className="col-span-1">
          <label className="block text-[13px] font-bold text-ink mb-1">State</label>
          <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
        </div>
        <div className="col-span-1">
          <label className="block text-[13px] font-bold text-ink mb-1">Pincode</label>
          <input required type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-black/5 mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-[14px] font-semibold text-ink hover:text-maroon">Cancel</button>
        <button type="submit" className="px-6 py-2 bg-ink text-white text-[14px] font-semibold rounded-[30px] uppercase tracking-wide hover:bg-maroon transition-colors">Save Address</button>
      </div>
    </form>
  );
};
