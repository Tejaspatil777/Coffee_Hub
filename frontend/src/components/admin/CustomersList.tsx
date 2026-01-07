import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Ban,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  totalOrders: number;
  status: 'ACTIVE' | 'BLOCKED';
  avatar?: string;
  gender?: 'Male' | 'Female' | 'Other';
}

interface CustomersListProps {
  onCustomerClick?: (customerId: string) => void;
}

// Mock customer data - replace with actual API call
const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    registrationDate: '2024-01-15',
    totalOrders: 24,
    status: 'ACTIVE',
    gender: 'Male'
  },
  {
    id: 'c2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 234-5678',
    registrationDate: '2024-02-20',
    totalOrders: 15,
    status: 'ACTIVE',
    gender: 'Female'
  },
  {
    id: 'c3',
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    phone: '+1 (555) 345-6789',
    registrationDate: '2024-03-10',
    totalOrders: 8,
    status: 'BLOCKED',
    gender: 'Male'
  },
  {
    id: 'c4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+1 (555) 456-7890',
    registrationDate: '2024-01-25',
    totalOrders: 32,
    status: 'ACTIVE',
    gender: 'Female'
  },
  {
    id: 'c5',
    name: 'Robert Wilson',
    email: 'robert.w@example.com',
    phone: '+1 (555) 567-8901',
    registrationDate: '2024-02-14',
    totalOrders: 19,
    status: 'ACTIVE',
    gender: 'Male'
  },
  {
    id: 'c6',
    name: 'Sarah Brown',
    email: 'sarah.brown@example.com',
    phone: '+1 (555) 678-9012',
    registrationDate: '2024-03-05',
    totalOrders: 11,
    status: 'ACTIVE',
    gender: 'Female'
  },
  {
    id: 'c7',
    name: 'David Martinez',
    email: 'david.m@example.com',
    phone: '+1 (555) 789-0123',
    registrationDate: '2024-01-30',
    totalOrders: 27,
    status: 'ACTIVE',
    gender: 'Male'
  },
  {
    id: 'c8',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    phone: '+1 (555) 890-1234',
    registrationDate: '2024-02-28',
    totalOrders: 5,
    status: 'BLOCKED',
    gender: 'Female'
  },
  {
    id: 'c9',
    name: 'James Taylor',
    email: 'james.t@example.com',
    phone: '+1 (555) 901-2345',
    registrationDate: '2024-03-15',
    totalOrders: 14,
    status: 'ACTIVE',
    gender: 'Male'
  },
  {
    id: 'c10',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    phone: '+1 (555) 012-3456',
    registrationDate: '2024-01-20',
    totalOrders: 21,
    status: 'ACTIVE',
    gender: 'Female'
  }
];

export function CustomersList({ onCustomerClick }: CustomersListProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const itemsPerPage = 8;

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleToggleStatus = (customerId: string) => {
    setCustomers(prev => prev.map(customer =>
      customer.id === customerId
        ? { ...customer, status: customer.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' }
        : customer
    ));
    
    const customer = customers.find(c => c.id === customerId);
    toast.success(`Customer ${customer?.status === 'ACTIVE' ? 'blocked' : 'activated'} successfully`);
  };

  const handleViewCustomer = (customerId: string) => {
    if (onCustomerClick) {
      onCustomerClick(customerId);
    } else {
      navigate(`/admin-dashboard/customers/${customerId}`);
    }
  };

  return (
    <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Customer Management
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              View and manage all customer accounts
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-primary text-primary">
            {filteredCustomers.length} Customers
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-10 bg-background/50 border-border"
          />
        </div>

        {/* Customers Table */}
        <div className="rounded-lg border border-border overflow-hidden bg-background/30">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-foreground">Customer ID</TableHead>
                <TableHead className="text-foreground">Name</TableHead>
                <TableHead className="text-foreground">Contact</TableHead>
                <TableHead className="text-foreground">Registration Date</TableHead>
                <TableHead className="text-foreground text-center">Total Orders</TableHead>
                <TableHead className="text-foreground text-center">Status</TableHead>
                <TableHead className="text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => handleViewCustomer(customer.id)}
                >
                  <TableCell className="text-muted-foreground">
                    #{customer.id.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-full">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-foreground">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(customer.registrationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-primary/30 bg-primary/10">
                      <ShoppingBag className="h-3 w-3 mr-1" />
                      {customer.totalOrders}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={customer.status === 'ACTIVE' ? 'default' : 'destructive'}
                      className={
                        customer.status === 'ACTIVE'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-red-500 hover:bg-red-600'
                      }
                    >
                      {customer.status === 'ACTIVE' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Ban className="h-3 w-3 mr-1" />
                      )}
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCustomer(customer.id);
                        }}
                        className="border-border hover:bg-primary/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(customer.id);
                        }}
                        className={
                          customer.status === 'ACTIVE'
                            ? 'border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }
                      >
                        {customer.status === 'ACTIVE' ? (
                          <>
                            <Ban className="h-4 w-4 mr-1" />
                            Block
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Unblock
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No customers found matching your search' : 'No customers yet'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-border"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'border-border'
                    }
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-border"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
