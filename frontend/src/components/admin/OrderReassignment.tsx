import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { 
  Clock, 
  ChefHat, 
  UtensilsCrossed,
  AlertCircle,
  ArrowRight,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  getPendingOrders, 
  getPreparingOrders,
  assignOrderToStaff,
  reassignOrder,
  type OrderWithStaff 
} from '../../services/orderReassignmentService';
import { getAvailableStaffByRole, recalculateStaffOrdersCounts } from '../../services/staffManagementService';

export function OrderReassignment() {
  const [pendingOrders, setPendingOrders] = useState<OrderWithStaff[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<OrderWithStaff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<{ [orderId: string]: string }>({});

  useEffect(() => {
    loadOrders();

    // Listen for order updates
    const handleUpdate = () => {
      loadOrders();
    };

    window.addEventListener('ordersUpdated', handleUpdate);
    window.addEventListener('staffStatusUpdated', handleUpdate);

    return () => {
      window.removeEventListener('ordersUpdated', handleUpdate);
      window.removeEventListener('staffStatusUpdated', handleUpdate);
    };
  }, []);

  const loadOrders = () => {
    recalculateStaffOrdersCounts();
    setPendingOrders(getPendingOrders());
    setPreparingOrders(getPreparingOrders());
  };

  const handleAssignOrder = (orderId: string) => {
    const staffId = selectedStaff[orderId];
    
    if (!staffId) {
      toast.error('Please select a staff member');
      return;
    }

    const result = assignOrderToStaff(orderId, staffId);
    
    if (result) {
      toast.success(`Order assigned to ${result.assignedStaffName}`, {
        description: 'Customer has been notified'
      });
      setSelectedStaff(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
      loadOrders();
    } else {
      toast.error('Failed to assign order');
    }
  };

  const handleReassignOrder = (orderId: string) => {
    const staffId = selectedStaff[orderId];
    
    if (!staffId) {
      toast.error('Please select a staff member');
      return;
    }

    const result = reassignOrder(orderId, staffId);
    
    if (result) {
      toast.success(`Order reassigned to ${result.assignedStaffName}`, {
        description: 'Customer has been notified'
      });
      setSelectedStaff(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
      loadOrders();
    } else {
      toast.error('Failed to reassign order');
    }
  };

  const OrderCard = ({ 
    order, 
    showAssignment = true 
  }: { 
    order: OrderWithStaff; 
    showAssignment?: boolean;
  }) => {
    // Determine role based on order type (simplified - you can enhance this logic)
    const requiredRole: 'CHEF' | 'WAITER' = 'CHEF'; // Default to chef for food orders
    const availableStaff = getAvailableStaffByRole(requiredRole);

    return (
      <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-foreground">Order #{order.id.slice(-6)}</p>
              {order.status === 'PENDING' ? (
                <Badge variant="outline" className="border-orange-500 text-orange-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Waiting in Queue
                </Badge>
              ) : (
                <Badge className="bg-blue-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  In Preparation
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Customer: {order.customerName || 'Unknown'}</p>
              <p>Items: {order.items?.length || 0} item(s)</p>
              <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
              {order.assignedStaffName && (
                <p className="text-primary">
                  Assigned to: {order.assignedStaffName}
                </p>
              )}
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Order items:</p>
                <div className="space-y-1">
                  {order.items.slice(0, 3).map((item: any, idx: number) => (
                    <p key={idx} className="text-xs text-foreground">
                      • {item.name || item.itemName} {item.quantity ? `(${item.quantity}x)` : ''}
                    </p>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      ...and {order.items.length - 3} more item(s)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {showAssignment && (
          <>
            <Separator className="my-3 bg-border" />
            
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Select
                  value={selectedStaff[order.id] || ''}
                  onValueChange={(value) => 
                    setSelectedStaff(prev => ({ ...prev, [order.id]: value }))
                  }
                >
                  <SelectTrigger className="bg-input-background border-border text-foreground">
                    <SelectValue placeholder="Select available staff" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {availableStaff.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <XCircle className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">No available {requiredRole.toLowerCase()}s</p>
                      </div>
                    ) : (
                      availableStaff.map((staff) => (
                        <SelectItem key={staff.staffId} value={staff.staffId}>
                          <div className="flex items-center gap-2">
                            {staff.role === 'CHEF' ? (
                              <ChefHat className="h-4 w-4 text-primary" />
                            ) : (
                              <UtensilsCrossed className="h-4 w-4 text-accent" />
                            )}
                            <span>{staff.name}</span>
                            {staff.assignedOrdersCount !== undefined && staff.assignedOrdersCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({staff.assignedOrdersCount} active)
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={() => order.status === 'PENDING' 
                  ? handleAssignOrder(order.id) 
                  : handleReassignOrder(order.id)
                }
                disabled={!selectedStaff[order.id] || availableStaff.length === 0}
                className="bg-primary hover:bg-accent text-white"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {order.status === 'PENDING' ? 'Assign' : 'Reassign'}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Queued Orders</p>
                <p className="text-2xl text-orange-600 dark:text-orange-400 mt-1">
                  {pendingOrders.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Waiting for staff assignment
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Preparation</p>
                <p className="text-2xl text-blue-600 dark:text-blue-400 mt-1">
                  {preparingOrders.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently being prepared
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queued Orders */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Queued Orders ({pendingOrders.length})
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Orders waiting to be assigned to available staff members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingOrders.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No orders in queue</p>
              <p className="text-sm text-muted-foreground mt-2">
                All orders are either assigned or completed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} showAssignment={true} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* In Preparation Orders */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            In Preparation ({preparingOrders.length})
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Orders currently being prepared by staff. You can reassign if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {preparingOrders.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders in preparation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {preparingOrders.map(order => (
                <OrderCard key={order.id} order={order} showAssignment={true} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                <strong>Order Assignment Guide:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Queued orders appear when staff becomes unavailable or new orders are placed</li>
                <li>Select an available staff member and click "Assign" to start preparation</li>
                <li>You can reassign orders already in preparation if needed</li>
                <li>Customers receive automatic notifications when orders are assigned or reassigned</li>
                <li>Only available staff members appear in the dropdown</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
