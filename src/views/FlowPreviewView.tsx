import Sidebar from '@/components/layout/Sidebar';

const FlowPreviewView = () => {
  return (
    <div className="flex h-full">
      <Sidebar>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Flows</h2>
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Account Management</div>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
            Remove User
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
            Add User
          </button>
        </div>
        
        <div className="space-y-1 mt-6">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Subscription & Billing</div>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
            Check Subscription
          </button>
        </div>
      </Sidebar>

      <div className="flex-1 h-full relative bg-gray-50">
        {/* Chat panel will appear in bottom-right corner */}
        <div className="absolute bottom-4 right-4 w-[400px] h-[600px] bg-white rounded-t-lg shadow-vca-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Help</h3>
            <button className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="p-4 text-center text-gray-500">
            Select a flow from the sidebar to preview
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowPreviewView;

