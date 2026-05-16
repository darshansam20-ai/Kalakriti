import React, { useState, useRef } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useCollections } from '../../context/CollectionContext';
import { useFilterSettings } from '../../context/FilterSettingsContext';
import { Product } from '../../data/products';
import { Plus, Edit2, Trash2, X, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const AdminProducts: React.FC = () => {
  const { categories } = useCollections();
  const { products, loading, addProduct, removeProduct, updateProduct } = useProducts();
  const { settings } = useFilterSettings();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  const [imageUrl, setImageUrl] = useState('');
  
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    title: '',
    description: '',
    price: 0,
    mrp: 0,
    category: 'Bridal Sets',
    material: '',
    color: 'Gold',
    occasion: 'Wedding',
    rating: 0,
    reviews: 0,
    inStock: true,
    images: [''],
    sizes: [],
    isBestseller: false,
    isNewArrival: true,
    shippingReturns: '',
    careInstructions: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'inStock' || name === 'isBestseller' || name === 'isNewArrival') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'price' || name === 'mrp' || name === 'rating' || name === 'reviews') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

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
            // Fill background with white first for transparent images
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
      const uploadedUrls: string[] = [];
      const currentImages = [...(formData.images || [])].filter(url => url !== '');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Immediately process as Base64 to avoid Firebase Storage configuration issues
          const base64Url = await compressImageToBase64(file);
          uploadedUrls.push(base64Url);
        } catch (uploadError) {
          console.error("Base64 compression failed:", uploadError);
          throw new Error("Failed to process image locally.");
        }
      }

      setFormData(prev => ({ 
        ...prev, 
        images: [...currentImages, ...uploadedUrls] 
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
      alert(`Failed to process images: ${(error as any).message || error}.`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const startEdit = (product: Product) => {
    setIsEditing(product.id);
    setFormData(product);
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({
      title: '', description: '', price: 0, mrp: 0, category: 'Bridal Sets',
      material: '', color: 'Gold', occasion: 'Wedding', rating: 0, reviews: 0,
      inStock: true, images: [''], sizes: [], isBestseller: false, isNewArrival: true,
      shippingReturns: '', careInstructions: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateProduct(isEditing, formData);
      } else {
        await addProduct(formData);
      }
      resetForm();
    } catch (error) {
      alert("Failed to save product. Please check permissions and network.");
    }
  };

  const handleDelete = async (id: string) => {
    setProductToDelete(id);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await removeProduct(productToDelete);
        setProductToDelete(null);
      } catch (error) {
        setProductToDelete(null);
        // Using a non-blocking UI alert would be better but console error for now
        console.error("Failed to delete product.", error);
      }
    }
  };

  if (loading) return <div className="p-8">Loading products...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-serif text-[32px] font-bold text-ink mb-2">Manage Products</h1>
          <p className="text-text-light text-[15px]">Add, edit, or remove products from your store.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center px-4 py-2 bg-maroon text-white font-medium text-[13px] rounded-[8px] hover:bg-maroon-dark transition-colors"
          >
            <Plus size={16} className="mr-2" /> Add Product
          </button>
        )}
      </div>

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-[16px] p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold font-serif mb-2 text-ink">Delete Product</h3>
            <p className="text-text-light text-sm mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
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
            <h2 className="font-serif text-[20px] font-bold text-ink">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            <button onClick={resetForm} className="text-text-light hover:text-red-500">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Title</label>
              <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Category</label>
              <select required name="category" value={formData.category} onChange={handleInputChange as any} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px] bg-white">
                <option value="" disabled>Select a category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-text-light mb-1">Description</label>
              <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]"></textarea>
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Material</label>
              {settings.filterGroups.find(g => g.id === 'material')?.options.length ? (
                <select 
                  name="material" 
                  value={formData.material || ''} 
                  onChange={(e: any) => handleInputChange(e)} 
                  className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]"
                >
                  <option value="">Select Material</option>
                  {settings.filterGroups.find(g => g.id === 'material')!.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input required type="text" name="material" value={formData.material || ''} onChange={handleInputChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
              )}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Color</label>
              {settings.filterGroups.find(g => g.id === 'color')?.options.length ? (
                <select 
                  name="color" 
                  value={formData.color || ''} 
                  onChange={(e: any) => handleInputChange(e)} 
                  className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]"
                >
                  <option value="">Select Color</option>
                  {settings.filterGroups.find(g => g.id === 'color')!.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input required type="text" name="color" value={formData.color || ''} onChange={handleInputChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
              )}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Occasion</label>
              {settings.filterGroups.find(g => g.id === 'occasion')?.options.length ? (
                <select 
                  name="occasion" 
                  value={formData.occasion || ''} 
                  onChange={(e: any) => handleInputChange(e)} 
                  className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]"
                >
                  <option value="">Select Occasion</option>
                  {settings.filterGroups.find(g => g.id === 'occasion')!.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input required type="text" name="occasion" value={formData.occasion || ''} onChange={handleInputChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
              )}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Price (₹)</label>
              <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">MRP (₹)</label>
              <input required type="number" name="mrp" value={formData.mrp} onChange={handleInputChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-text-light mb-1">Care Instructions</label>
              <textarea name="careInstructions" value={formData.careInstructions || ''} onChange={handleInputChange} rows={2} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-text-light mb-1">Shipping & Returns</label>
              <textarea name="shippingReturns" value={formData.shippingReturns || ''} onChange={handleInputChange} rows={2} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]"></textarea>
            </div>


            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-text-light mb-2">Product Images</label>
              
              <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-end">
                <div className="flex-grow w-full md:w-auto">
                   <label className="block text-[11px] font-medium text-text-light mb-1">Add Image via URL (Fallback)</label>
                     <div className="flex gap-2">
                      <input 
                         type="url" 
                         value={imageUrl}
                         onChange={(e) => setImageUrl(e.target.value)}
                         placeholder="https://example.com/image.jpg" 
                         className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" 
                         onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                               e.preventDefault();
                               if (imageUrl) {
                                  setFormData(prev => ({ ...prev, images: [...(prev.images || []).filter(u => u !== ''), imageUrl] }));
                                  setImageUrl('');
                               }
                            }
                         }}
                      />
                      <button 
                         type="button"
                         onClick={() => {
                            if (imageUrl) {
                               setFormData(prev => ({ ...prev, images: [...(prev.images || []).filter(u => u !== ''), imageUrl] }));
                               setImageUrl('');
                            }
                         }}
                         className="px-4 py-2 bg-black/5 text-ink text-[13px] font-medium rounded-[8px] hover:bg-black/10 transition-colors whitespace-nowrap"
                      >
                         Add URL
                      </button>
                   </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                {formData.images.filter(url => url !== '').map((url, index) => (
                  <div key={index} className="relative w-24 h-24 border border-black/10 rounded-[8px] overflow-hidden group">
                    <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-24 h-24 border-2 border-dashed border-black/20 rounded-[8px] flex flex-col items-center justify-center text-text-light hover:border-maroon hover:text-maroon transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="text-[11px] font-medium">Uploading...</span>
                  ) : (
                    <>
                      <Upload size={20} className="mb-1" />
                      <span className="text-[11px] font-medium">Add Image</span>
                    </>
                  )}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  multiple 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                />
              </div>
              {formData.images.filter(url => url !== '').length === 0 && (
                <p className="text-[12px] text-red-500 mt-1">At least one image is required.</p>
              )}
            </div>

            <div className="flex space-x-6 items-center">
              <label className="flex items-center space-x-2 text-[13px] text-ink">
                <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleInputChange} className="accent-maroon" />
                <span>In Stock</span>
              </label>
              <label className="flex items-center space-x-2 text-[13px] text-ink">
                <input type="checkbox" name="isBestseller" checked={formData.isBestseller} onChange={handleInputChange} className="accent-maroon" />
                <span>Bestseller</span>
              </label>
              <label className="flex items-center space-x-2 text-[13px] text-ink">
                <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleInputChange} className="accent-maroon" />
                <span>New Arrival</span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button type="button" onClick={resetForm} className="px-6 py-2 text-[13px] font-medium text-text-light hover:text-ink transition-colors">Cancel</button>
              <button disabled={uploading} type="submit" className="px-6 py-2 bg-maroon text-white text-[13px] font-semibold tracking-wide rounded-[8px] hover:bg-maroon-dark transition-colors disabled:opacity-50">
                {isEditing ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent-soft border-b border-black/5 text-[12px] uppercase tracking-wider text-text-light">
              <th className="p-4 font-medium w-16">Image</th>
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-black/5 hover:bg-bg/50 transition-colors">
                <td className="p-4">
                  <img src={product.images[0]} alt={product.title} className="w-12 h-12 object-cover rounded bg-accent-soft" />
                </td>
                <td className="p-4">
                  <p className="text-[14px] font-medium text-ink">{product.title}</p>
                  <p className="text-[12px] text-text-light">{product.category}</p>
                </td>
                <td className="p-4 text-[14px] font-medium text-maroon">₹{product.price.toLocaleString('en-IN')}</td>
                <td className="p-4">
                  {product.inStock ? (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded-full"><Check size={10} className="mr-1" /> In Stock</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase rounded-full"><X size={10} className="mr-1" /> Out of Stock</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => startEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors mr-2">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-light">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
