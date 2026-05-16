import React, { useState, useEffect } from 'react';
import { useFilterSettings } from '../../context/FilterSettingsContext';
import { Plus, X, GripVertical } from 'lucide-react';

export const AdminFilters: React.FC = () => {
  const { settings, updateSettings, loading } = useFilterSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      alert('Filter settings saved successfully!');
    } catch (e) {
      alert('Failed to save filter settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading filter settings...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[32px] font-bold text-ink mb-2">Filters & Sorting</h1>
        <p className="text-text-light text-[15px]">Manage the options available for filtering and sorting in the store.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h2 className="font-serif text-[20px] font-bold text-ink mb-6">Filter Groups</h2>
          <div className="space-y-8">
            {localSettings.filterGroups.map((group, groupIndex) => (
              <div key={group.id} className="border border-black/10 rounded-[12px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <label className="block text-[13px] font-medium text-text-light mb-1">Display Label</label>
                    <input 
                      type="text" 
                      value={group.label}
                      onChange={(e) => {
                        const newGroups = [...localSettings.filterGroups];
                        newGroups[groupIndex].label = e.target.value;
                        setLocalSettings({ ...localSettings, filterGroups: newGroups });
                      }}
                      className="w-full max-w-sm border border-black/10 rounded-[8px] px-3 py-2 text-[14px]"
                    />
                  </div>
                  <div className="flex items-center space-x-2 bg-black/5 p-1 rounded-md">
                    <button 
                      onClick={() => {
                        const newGroups = [...localSettings.filterGroups];
                        newGroups[groupIndex].enabled = !newGroups[groupIndex].enabled;
                        setLocalSettings({ ...localSettings, filterGroups: newGroups });
                      }}
                      className={`px-3 py-1 text-[12px] font-medium rounded ${group.enabled ? 'bg-white shadow text-ink' : 'text-text-light'}`}
                    >
                      {group.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[13px] font-medium text-text-light mb-2">Options</p>
                  <p className="text-[12px] text-text-light mb-3">Leave empty to auto-generate from existing products, or define specific options here.</p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt, optIndex) => (
                      <div key={optIndex} className="bg-black/5 px-3 py-1 rounded-full flex items-center space-x-2">
                        <span className="text-[13px] text-ink">{opt}</span>
                        <button 
                          onClick={() => {
                            const newGroups = [...localSettings.filterGroups];
                            newGroups[groupIndex].options.splice(optIndex, 1);
                            setLocalSettings({ ...localSettings, filterGroups: newGroups });
                          }}
                          className="text-text-light hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        placeholder="Add new option..."
                        className="border border-black/10 rounded-l-[8px] px-3 py-1 text-[13px] w-32 focus:w-48 transition-all"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (!group.options.includes(val)) {
                              const newGroups = [...localSettings.filterGroups];
                              newGroups[groupIndex].options.push(val);
                              setLocalSettings({ ...localSettings, filterGroups: newGroups });
                            }
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <button className="bg-black/5 border border-black/5 border-l-0 rounded-r-[8px] px-2 py-1 h-[30px] flex items-center justify-center text-text-light hover:bg-black/10">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h2 className="font-serif text-[20px] font-bold text-ink mb-6">Sort Options</h2>
          <div className="space-y-3">
            {localSettings.sortOptions.map((sortOpt, index) => (
              <div key={sortOpt.id} className="flex items-center justify-between p-3 border border-black/10 rounded-[8px] bg-white">
                <div className="flex items-center space-x-4">
                  <GripVertical size={16} className="text-black/20" />
                  <div>
                    <input 
                      type="text" 
                      value={sortOpt.label}
                      onChange={(e) => {
                        const newOpts = [...localSettings.sortOptions];
                        newOpts[index].label = e.target.value;
                        setLocalSettings({ ...localSettings, sortOptions: newOpts });
                      }}
                      className="border-none bg-transparent focus:ring-0 p-0 text-[14px] font-medium text-ink min-w-[200px]"
                    />
                    <p className="text-[11px] text-text-light mt-0.5 font-mono">{sortOpt.id}</p>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={sortOpt.enabled} 
                      onChange={(e) => {
                        const newOpts = [...localSettings.sortOptions];
                        newOpts[index].enabled = e.target.checked;
                        setLocalSettings({ ...localSettings, sortOptions: newOpts });
                      }} 
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${sortOpt.enabled ? 'bg-maroon' : 'bg-black/20'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${sortOpt.enabled ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-maroon text-white font-medium rounded-[8px] hover:bg-maroon-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Filters & Sorting'}
          </button>
        </div>
      </div>
    </div>
  );
};
