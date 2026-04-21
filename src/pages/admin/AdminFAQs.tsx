import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
}

export const AdminFAQs: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    isActive: true
  });

  const fetchFaqs = async () => {
    try {
      const q = query(collection(db, 'faqs'));
      const snapshot = await getDocs(q);
      const fetchedFaqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FAQ));
      setFaqs(fetchedFaqs);
    } catch (error) {
      console.error("Error fetching faqs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const startEdit = (faq: FAQ) => {
    setIsEditing(faq.id);
    setFormData({ question: faq.question, answer: faq.answer, isActive: faq.isActive });
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({ question: '', answer: '', isActive: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'faqs', isEditing), formData);
        setFaqs(prev => prev.map(f => f.id === isEditing ? { ...f, ...formData } : f));
      } else {
        const docRef = await addDoc(collection(db, 'faqs'), formData);
        setFaqs(prev => [...prev, { id: docRef.id, ...formData }]);
      }
      resetForm();
    } catch (error) {
      alert("Failed to save FAQ.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteDoc(doc(db, 'faqs', id));
        setFaqs(prev => prev.filter(f => f.id !== id));
      } catch (error) {
        alert("Failed to delete FAQ.");
      }
    }
  };

  if (loading) return <div className="p-8">Loading FAQs...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-serif text-[32px] font-bold text-ink mb-2">Manage FAQs</h1>
          <p className="text-text-light text-[15px]">Update frequently asked questions.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center px-4 py-2 bg-maroon text-white font-medium text-[13px] rounded-[8px] hover:bg-maroon-dark transition-colors"
          >
            <Plus size={16} className="mr-2" /> Add FAQ
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-[20px] font-bold text-ink">{isEditing ? 'Edit FAQ' : 'Add New FAQ'}</h2>
            <button onClick={resetForm} className="text-text-light hover:text-red-500">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Question</label>
              <input required type="text" name="question" value={formData.question} onChange={handleInputChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Answer</label>
              <textarea required name="answer" value={formData.answer} onChange={handleInputChange} rows={4} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]"></textarea>
            </div>
            
            <div className="flex items-center space-x-2 text-[13px] text-ink pt-2">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="accent-maroon" />
              <label>Active (Visible to customers)</label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-black/5">
              <button type="button" onClick={resetForm} className="px-6 py-2 text-[13px] font-medium text-text-light hover:text-ink transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-maroon text-white text-[13px] font-semibold tracking-wide rounded-[8px] hover:bg-maroon-dark transition-colors">
                {isEditing ? 'Save Changes' : 'Add FAQ'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent-soft border-b border-black/5 text-[12px] uppercase tracking-wider text-text-light">
              <th className="p-4 font-medium w-1/3">Question</th>
              <th className="p-4 font-medium">Answer</th>
              <th className="p-4 font-medium text-center w-24">Status</th>
              <th className="p-4 font-medium text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id} className="border-b border-black/5 hover:bg-bg/50 transition-colors">
                <td className="p-4 text-[14px] font-medium text-ink align-top">{faq.question}</td>
                <td className="p-4 text-[13px] text-text-light align-top">{faq.answer}</td>
                <td className="p-4 text-center align-top">
                  {faq.isActive ? (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded-full">Active</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-[10px] font-bold uppercase rounded-full">Hidden</span>
                  )}
                </td>
                <td className="p-4 text-right align-top whitespace-nowrap">
                  <button onClick={() => startEdit(faq)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors mr-1">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(faq.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-light">No FAQs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
