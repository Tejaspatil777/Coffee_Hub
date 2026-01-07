import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Star, 
  MessageSquare, 
  Coffee, 
  Users, 
  Home, 
  DollarSign,
  Send,
  ThumbsUp,
  Calendar,
  MapPin,
  ShoppingBag,
  Award,
  TrendingUp,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { feedbackService, Feedback } from '../../services/feedbackService';
import { getOrdersByCustomer } from '../../services/orderManagementService';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

export function CustomerFeedback() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    categories: { food: 0, service: 0, ambiance: 0, value: 0 }
  });

  // Form state
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [ratings, setRatings] = useState({
    foodQuality: 0,
    serviceQuality: 0,
    ambiance: 0,
    valueForMoney: 0,
    overall: 0
  });
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadFeedbacks();
    loadEligibleOrders();
  }, [user]);

  const loadFeedbacks = () => {
    if (!user?.id) return;
    
    const customerFeedbacks = feedbackService.getCustomerFeedbacks(user.id);
    setFeedbacks(customerFeedbacks);

    // Calculate stats
    if (customerFeedbacks.length > 0) {
      const avgRating = customerFeedbacks.reduce((sum, f) => sum + f.overallRating, 0) / customerFeedbacks.length;
      const avgFood = customerFeedbacks.reduce((sum, f) => sum + (f.foodQuality || 0), 0) / customerFeedbacks.length;
      const avgService = customerFeedbacks.reduce((sum, f) => sum + (f.serviceQuality || 0), 0) / customerFeedbacks.length;
      const avgAmbiance = customerFeedbacks.reduce((sum, f) => sum + (f.ambiance || 0), 0) / customerFeedbacks.length;
      const avgValue = customerFeedbacks.reduce((sum, f) => sum + (f.valueForMoney || 0), 0) / customerFeedbacks.length;

      setStats({
        totalFeedbacks: customerFeedbacks.length,
        averageRating: Math.round(avgRating * 10) / 10,
        categories: {
          food: Math.round(avgFood * 10) / 10,
          service: Math.round(avgService * 10) / 10,
          ambiance: Math.round(avgAmbiance * 10) / 10,
          value: Math.round(avgValue * 10) / 10
        }
      });
    }
  };

  const loadEligibleOrders = () => {
    if (!user?.id) return;

    // Get completed orders that don't have feedback yet
    const allOrders = getOrdersByCustomer(user.id);
    const completedOrders = allOrders.filter(order => 
      order.status === 'DELIVERED' || order.status === 'COMPLETED'
    );

    const ordersWithoutFeedback = completedOrders.filter(order =>
      feedbackService.canSubmitFeedbackForOrder(order.id)
    );

    setEligibleOrders(ordersWithoutFeedback);
  };

  const handleRatingClick = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const calculateOverallRating = () => {
    const { foodQuality, serviceQuality, ambiance, valueForMoney } = ratings;
    const total = foodQuality + serviceQuality + ambiance + valueForMoney;
    const count = [foodQuality, serviceQuality, ambiance, valueForMoney].filter(r => r > 0).length;
    return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
  };

  const handleSubmitFeedback = () => {
    if (!user) return;

    const overallRating = calculateOverallRating();

    if (overallRating === 0) {
      toast.error('Please provide at least one rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    const selectedOrder = eligibleOrders.find(o => o.id === selectedOrderId);

    const feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'> = {
      customerId: user.id,
      customerName: user.name,
      orderId: selectedOrderId || undefined,
      locationId: selectedOrder?.locationId,
      locationName: selectedOrder?.locationName,
      type: selectedOrderId ? 'ORDER' : 'OVERALL',
      foodQuality: ratings.foodQuality || undefined,
      serviceQuality: ratings.serviceQuality || undefined,
      ambiance: ratings.ambiance || undefined,
      valueForMoney: ratings.valueForMoney || undefined,
      overallRating,
      comment: comment.trim()
    };

    feedbackService.submitFeedback(feedback);
    
    toast.success('Thank you for your feedback! ☕', {
      description: 'Your feedback helps us improve our service.'
    });

    // Reset form
    setRatings({
      foodQuality: 0,
      serviceQuality: 0,
      ambiance: 0,
      valueForMoney: 0,
      overall: 0
    });
    setComment('');
    setSelectedOrderId('');
    setShowFeedbackForm(false);
    
    loadFeedbacks();
    loadEligibleOrders();
  };

  const StarRating = ({ 
    rating, 
    onRate, 
    readonly = false 
  }: { 
    rating: number; 
    onRate?: (value: number) => void; 
    readonly?: boolean;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 cursor-pointer transition-colors ${
            star <= rating 
              ? 'fill-accent text-accent' 
              : 'text-muted-foreground'
          } ${readonly ? 'cursor-default' : 'hover:text-accent'}`}
          onClick={() => !readonly && onRate?.(star)}
        />
      ))}
    </div>
  );

  const getRatingEmoji = (rating: number) => {
    if (rating >= 4.5) return <Smile className="h-6 w-6 text-green-500" />;
    if (rating >= 3) return <Meh className="h-6 w-6 text-yellow-500" />;
    return <Frown className="h-6 w-6 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl text-foreground mb-2">Your Feedback & Ratings ⭐</h2>
          <p className="text-muted-foreground">
            Share your experience and help us improve
          </p>
        </div>
        
        <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              Write Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Share Your Experience ☕</DialogTitle>
              <DialogDescription>
                Your feedback helps us serve you better
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Order Selection */}
                {eligibleOrders.length > 0 && (
                  <div>
                    <Label>Select Order (Optional)</Label>
                    <select
                      className="w-full mt-2 p-3 rounded-lg bg-background border border-border text-foreground"
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                    >
                      <option value="">General Feedback</option>
                      {eligibleOrders.map((order) => (
                        <option key={order.id} value={order.id}>
                          Order #{order.id.slice(-6)} - {order.locationName} - ${order.total}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rating Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 backdrop-blur-sm border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Coffee className="h-5 w-5 text-primary" />
                      <Label>Food Quality</Label>
                    </div>
                    <StarRating 
                      rating={ratings.foodQuality} 
                      onRate={(value) => handleRatingClick('foodQuality', value)}
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 backdrop-blur-sm border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <Label>Service Quality</Label>
                    </div>
                    <StarRating 
                      rating={ratings.serviceQuality} 
                      onRate={(value) => handleRatingClick('serviceQuality', value)}
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 backdrop-blur-sm border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-5 w-5 text-primary" />
                      <Label>Ambiance</Label>
                    </div>
                    <StarRating 
                      rating={ratings.ambiance} 
                      onRate={(value) => handleRatingClick('ambiance', value)}
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 backdrop-blur-sm border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <Label>Value for Money</Label>
                    </div>
                    <StarRating 
                      rating={ratings.valueForMoney} 
                      onRate={(value) => handleRatingClick('valueForMoney', value)}
                    />
                  </div>
                </div>

                {/* Overall Rating Display */}
                {calculateOverallRating() > 0 && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="text-foreground">Overall Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl text-foreground">{calculateOverallRating()}</span>
                        <Star className="h-6 w-6 fill-accent text-accent" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Comment */}
                <div>
                  <Label>Your Feedback</Label>
                  <Textarea
                    placeholder="Tell us about your experience..."
                    className="mt-2 min-h-[120px] bg-background border-border"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handleSubmitFeedback}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white"
                  disabled={calculateOverallRating() === 0 || !comment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Feedbacks</p>
              <p className="text-2xl text-foreground mt-1">{stats.totalFeedbacks}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl text-foreground">{stats.averageRating}</p>
                {stats.averageRating > 0 && getRatingEmoji(stats.averageRating)}
              </div>
            </div>
            <Star className="h-8 w-8 text-accent fill-accent" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
              <p className="text-2xl text-foreground mt-1">{eligibleOrders.length}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Impact Score</p>
              <p className="text-2xl text-foreground mt-1">{stats.totalFeedbacks * 10}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-accent" />
          </div>
        </Card>
      </div>

      {/* Category Ratings */}
      {stats.totalFeedbacks > 0 && (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-0">
          <h3 className="text-lg text-foreground mb-4">Your Average Ratings by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-primary" />
                <span className="text-foreground">Food Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-foreground">{stats.categories.food}</span>
                <StarRating rating={Math.round(stats.categories.food)} readonly />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-foreground">Service Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-foreground">{stats.categories.service}</span>
                <StarRating rating={Math.round(stats.categories.service)} readonly />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <span className="text-foreground">Ambiance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-foreground">{stats.categories.ambiance}</span>
                <StarRating rating={Math.round(stats.categories.ambiance)} readonly />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-foreground">Value for Money</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-foreground">{stats.categories.value}</span>
                <StarRating rating={Math.round(stats.categories.value)} readonly />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Feedback History */}
      <div className="space-y-4">
        <h3 className="text-lg text-foreground">Your Feedback History</h3>
        
        {feedbacks.length === 0 ? (
          <Card className="p-12 bg-card/50 backdrop-blur-sm border-0 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl text-foreground mb-2">No Feedback Yet</h3>
            <p className="text-muted-foreground mb-4">
              Share your experience and help us improve our service
            </p>
            <Button 
              onClick={() => setShowFeedbackForm(true)}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              Write Your First Feedback
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <Card key={feedback.id} className="p-6 bg-card/50 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                        {feedback.overallRating} ⭐
                      </Badge>
                      {feedback.orderId && (
                        <Badge variant="outline" className="border-primary/20">
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          Order #{feedback.orderId.slice(-6)}
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={
                          feedback.status === 'PUBLISHED' 
                            ? 'border-green-500/20 text-green-500' 
                            : 'border-yellow-500/20 text-yellow-500'
                        }
                      >
                        {feedback.status}
                      </Badge>
                    </div>
                    
                    {feedback.locationName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        {feedback.locationName}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Category Ratings */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {feedback.foodQuality && (
                      <div className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-primary" />
                        <StarRating rating={feedback.foodQuality} readonly />
                      </div>
                    )}
                    {feedback.serviceQuality && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <StarRating rating={feedback.serviceQuality} readonly />
                      </div>
                    )}
                    {feedback.ambiance && (
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-primary" />
                        <StarRating rating={feedback.ambiance} readonly />
                      </div>
                    )}
                    {feedback.valueForMoney && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <StarRating rating={feedback.valueForMoney} readonly />
                      </div>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div className="p-4 rounded-lg bg-muted/20 border border-border mb-4">
                  <p className="text-foreground leading-relaxed">{feedback.comment}</p>
                </div>

                {/* Admin Response */}
                {feedback.adminResponse && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/20">
                        <ThumbsUp className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-primary">TakeBits Team</span>
                          {feedback.respondedAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(feedback.respondedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{feedback.adminResponse}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}