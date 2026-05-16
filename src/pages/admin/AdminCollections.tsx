import React, { useRef, useState } from 'react';
import { useCollections } from '../../context/CollectionContext';
import { Plus, Edit2, Trash2, X, Upload, Check } from 'lucide-react';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const AdminCollections: React.FC = () => {
  const { categories, loading, addCategory, updateCategory, removeCategory } = useCollections();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    image: ''
  });

  const compressImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
          }
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      try {
        const base64Url = await compressImageToBase64(file);
        setFormData(prev => ({ ...prev, image: base64Url }));
      } catch (err) {
        console.error("Base64 compression failed:", err);
        throw new Error("Failed to process image locally.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(`Failed to process image: ${(error as any).message || error}.`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startEdit = (category: any) => {
    setIsEditing(category.id);
    setFormData({ id: category.id, name: category.name, image: category.image || '' });
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({ id: '', name: '', image: '' });
    setImageUrlInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    // Auto-generate an id if not present AND not editing
    let docId = formData.id;
    if (!isEditing && !docId) {
      docId = formData.name.toLowerCase().replace(/\s+/g, '-');
    } else if (isEditing && !docId) {
      docId = formData.name.toLowerCase().replace(/\s+/g, '-');
    }

    try {
      if (isEditing) {
        await updateCategory(isEditing, { name: formData.name, image: formData.image }, docId);
      } else {
        await addCategory({ id: docId, name: formData.name, image: formData.image });
      }
      resetForm();
    } catch (error) {
      alert("Failed to save collection.");
    }
  };

  const handleDelete = async (id: string) => {
    setCategoryToDelete(id);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await removeCategory(categoryToDelete);
        setCategoryToDelete(null);
      } catch (error) {
        setCategoryToDelete(null);
        console.error("Failed to delete collection.", error);
      }
    }
  };

  if (loading) return <div className="p-8">Loading collections...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-serif text-[32px] font-bold text-ink mb-2">Manage Collections</h1>
          <p className="text-text-light text-[15px]">Add, edit, or remove product collections/categories.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center px-4 py-2 bg-maroon text-white font-medium text-[13px] rounded-[8px] hover:bg-maroon-dark transition-colors"
          >
            <Plus size={16} className="mr-2" /> Add Collection
          </button>
        )}
      </div>

      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-[16px] p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold font-serif mb-2 text-ink">Delete Collection</h3>
            <p className="text-text-light text-sm mb-6">Are you sure you want to delete this collection? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-text-light hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-[8px] hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-[20px] font-bold text-ink">{isEditing ? 'Edit Collection' : 'Add New Collection'}</h2>
            <button onClick={resetForm} className="text-text-light hover:text-red-500">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-text-light mb-1">Collection Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-light mb-1">Collection ID</label>
                <input 
                  type="text" 
                  name="id" 
                  value={formData.id} 
                  onChange={handleInputChange} 
                  placeholder="e.g. bridal-sets"
                  className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-light mb-2">Cover Image</label>
              
              <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-end">
                <div className="flex-grow w-full md:w-auto">
                   <label className="block text-[11px] font-medium text-text-light mb-1">Add Image via URL</label>
                   <div className="flex gap-2">
                      <input 
                         type="url" 
                         value={imageUrlInput}
                         onChange={(e) => setImageUrlInput(e.target.value)}
                         placeholder="https://example.com/image.jpg" 
                         className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" 
                         onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                               e.preventDefault();
                               if (imageUrlInput) {
                                  setFormData(prev => ({ ...prev, image: imageUrlInput }));
                                  setImageUrlInput('');
                               }
                            }
                         }}
                      />
                      <button 
                         type="button"
                         onClick={() => {
                            if (imageUrlInput) {
                               setFormData(prev => ({ ...prev, image: imageUrlInput }));
                               setImageUrlInput('');
                            }
                         }}
                         className="px-4 py-2 bg-black/5 text-ink text-[13px] font-medium rounded-[8px] hover:bg-black/10 transition-colors whitespace-nowrap"
                      >
                         Add URL
                      </button>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                {formData.image && (
                  <div className="relative w-32 h-32 border border-black/10 rounded-[8px] overflow-hidden group">
                    <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                {!formData.image && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-32 h-32 border-2 border-dashed border-black/20 rounded-[8px] flex flex-col items-center justify-center text-text-light hover:border-maroon hover:text-maroon transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-maroon border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Upload size={20} className="mb-1" />
                        <span className="text-[11px] font-medium">Upload Image</span>
                      </>
                    )}
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-black/5">
              <button type="button" onClick={resetForm} className="px-6 py-2 text-[13px] font-medium text-text-light hover:text-ink transition-colors">Cancel</button>
              <button disabled={uploading} type="submit" className="px-6 py-2 bg-maroon text-white text-[13px] font-semibold tracking-wide rounded-[8px] hover:bg-maroon-dark transition-colors disabled:opacity-50">
                {isEditing ? 'Save Changes' : 'Add Collection'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent-soft border-b border-black/5 text-[12px] uppercase tracking-wider text-text-light">
              <th className="p-4 font-medium w-16">Cover</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-black/5 hover:bg-bg/50 transition-colors">
                <td className="p-4">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded bg-accent-soft" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-black/5 flex items-center justify-center">
                      <span className="text-text-light text-[10px]">No Image</span>
                    </div>
                  )}
                </td>
                <td className="p-4 text-[14px] font-medium text-ink">{category.name}</td>
                <td className="p-4 text-[13px] text-text-light font-mono">{category.id}</td>
                <td className="p-4 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors mr-1">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-light">No collections found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
