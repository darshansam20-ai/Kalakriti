import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Search, User, Shield } from 'lucide-react';

const ADMIN_EMAILS = ['darshansam20@gmail.com', 'kalakriticreations80@gmail.com'];

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-serif text-[32px] font-bold text-ink mb-2">Manage Users</h1>
          <p className="text-text-light text-[15px]">View and manage user accounts and roles.</p>
        </div>
        <div className="relative w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-black/10 rounded-[8px] focus:outline-none focus:border-maroon"
          />
        </div>
      </div>

      <div className="bg-surface rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent-soft border-b border-black/5 text-[12px] uppercase tracking-wider text-text-light">
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-black/5 hover:bg-bg/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-maroon/10 flex items-center justify-center text-maroon">
                      {user.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                    </div>
                    <span className="text-[14px] font-medium text-ink">{user.displayName || 'No Name'}</span>
                  </div>
                </td>
                <td className="p-4 text-[14px] text-text-light">{user.email}</td>
                <td className="p-4 text-[14px] text-text-light">
                  {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role || 'customer'}
                  </span>
                </td>
                <td className="p-4">
                  <select 
                    value={user.role || 'customer'}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={user.email && ADMIN_EMAILS.includes(user.email)} // Prevent changing super admins
                    className="text-[13px] border border-black/10 rounded p-1 bg-white focus:outline-none focus:border-maroon disabled:opacity-50"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-light">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
