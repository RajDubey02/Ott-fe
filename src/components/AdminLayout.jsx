import Sidebar from './Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout-wrapper min-h-screen bg-black flex">
      <Sidebar />
      <div className="admin-content flex-1 flex flex-col bg-black">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your OTT platform</p>
        </div>
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
