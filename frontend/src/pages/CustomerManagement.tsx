import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CustomersList } from '../components/admin/CustomersList';
import { CustomerDetail } from '../components/admin/CustomerDetail';
import { Button } from '../components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';

export default function CustomerManagement() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(customerId || null);

  const handleCustomerClick = (id: string) => {
    setSelectedId(id);
    navigate(`/admin/customers/${id}`);
  };

  const handleBack = () => {
    setSelectedId(null);
    navigate('/admin/customers');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin-dashboard')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Admin Dashboard
            </Button>
            <span>/</span>
            <span className="text-foreground">Customer Management</span>
            {selectedId && (
              <>
                <span>/</span>
                <span className="text-foreground">Customer Details</span>
              </>
            )}
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-foreground">Customer Management</h1>
              <p className="text-muted-foreground">
                {selectedId ? 'View customer details and history' : 'Manage all customer accounts'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedId ? (
          <CustomerDetail customerId={selectedId} onBack={handleBack} />
        ) : (
          <CustomersList onCustomerClick={handleCustomerClick} />
        )}
      </div>
    </div>
  );
}
