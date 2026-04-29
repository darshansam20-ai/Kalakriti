import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { AddressForm, Address } from '../components/AddressForm';
import { Plus, MapPin, Trash2, Edit2 } from 'lucide-react';

export const Addresses: React.FC = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists() && userDoc.data().addresses) {
            setAddresses(userDoc.data().addresses);
          }
        } catch (error) {
          console.error("Error fetching user addresses: ", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUserAddresses();
  }, [user]);

  const handleSaveAddress = async (newAddress: Address) => {
    if (!user) return;
    
    let updatedAddresses = [...addresses];
    
    if (editingAddressId) {
      updatedAddresses = updatedAddresses.map(addr => addr.id === editingAddressId ? newAddress : addr);
    } else {
      updatedAddresses.push(newAddress);
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        addresses: updatedAddresses
      });
      setAddresses(updatedAddresses);
      setIsAddingAddress(false);
      setEditingAddressId(null);
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  const handleDeleteAddress = async (idToDelete: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    const updatedAddresses = addresses.filter(addr => addr.id !== idToDelete);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-[32px] font-bold text-ink mb-4">Account Required</h2>
        <p className="text-text-light mb-6">Please log in to view your addresses.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[70vh]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-serif text-[32px] font-bold text-ink mb-2">My Addresses</h1>
          <p className="text-text-light text-[14px]">Manage your saved shipping addresses.</p>
        </div>
        {!isAddingAddress && !editingAddressId && (
          <button 
            onClick={() => setIsAddingAddress(true)}
            className="flex items-center text-white bg-maroon hover:bg-maroon-dark px-4 py-2 rounded-[30px] font-semibold text-[14px] transition-colors"
          >
            <Plus size={16} className="mr-1" /> Add Address
          </button>
        )}
      </div>

      {(isAddingAddress || editingAddressId) ? (
        <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h2 className="font-serif text-[24px] font-bold text-ink mb-6">
            {editingAddressId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <AddressForm 
            initialAddress={editingAddressId ? addresses.find(a => a.id === editingAddressId) : undefined}
            onSave={handleSaveAddress}
            onCancel={() => {
              setIsAddingAddress(false);
              setEditingAddressId(null);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.length === 0 ? (
            <div className="col-span-full text-center py-12 border border-dashed border-black/20 rounded-[16px]">
              <MapPin size={32} className="mx-auto text-black/20 mb-3" />
              <p className="text-text-light">You have no saved addresses yet.</p>
            </div>
          ) : (
            addresses.map(addr => (
              <div key={addr.id} className="p-5 border border-black/10 rounded-[12px] bg-white relative group flex flex-col h-full">
                <div className="pr-12">
                  <h3 className="font-bold text-ink text-[16px] mb-1">{addr.fullName || addr.description.split(',')[0]}</h3>
                  <p className="text-text-light text-[14px] leading-relaxed line-clamp-3">
                    {addr.description}
                  </p>
                  {addr.phone && <p className="text-text-light text-[14px] mt-2">Phone: {addr.phone}</p>}
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingAddressId(addr.id)}
                    className="p-2 text-ink hover:text-maroon hover:bg-maroon/5 rounded-full transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-2 text-ink hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
