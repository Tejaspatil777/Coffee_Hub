import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
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
  Frown,
  Filter,
  Eye,
  Reply,
  CheckCircle2,
  XCircle,
  BarChart3,
  Search,
  User
} from 'lucide-react';
import { feedbackService, Feedback, FeedbackStats } from '../../services/feedbackService';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'PENDING' | 'HIDDEN'>('ALL');
  const [filterRating, setFilterRating] = useState<'ALL' | '5' | '4' | '3' | '2' | '1'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST'>('NEWEST');

  useEffect(() => {
    loadFeedbacks();
    loadStats();

    // Listen for new feedback submissions
    const handleFeedbackSubmitted = () => {
      loadFeedbacks();
      loadStats();
    };

    window.addEventListener('feedbackSubmitted', handleFeedbackSubmitted);

    return () => {
      window.removeEventListener('feedbackSubmitted', handleFeedbackSubmitted);
    };
  }, []);

  const loadFeedbacks = () => {
    const allFeedbacks = feedbackService.getAllFeedbacks();
    setFeedbacks(allFeedbacks);
  };

  const loadStats = () => {
    const statistics = feedbackService.getFeedbackStats();
    setStats(statistics);
  };

  const handleAddResponse = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.adminResponse || '');
    setShowResponseDialog(true);
  };

  const submitResponse = () => {
    if (!selectedFeedback || !responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    feedbackService.addAdminResponse(selectedFeedback.id, responseText.trim());
    toast.success('Response added successfully! ☕');
    
    setShowResponseDialog(false);
    setResponseText('');
    setSelectedFeedback(null);
    loadFeedbacks();
  };

  const updateFeedbackStatus = (feedbackId: string, status: 'PUBLISHED' | 'HIDDEN') => {
    feedbackService.updateFeedback(feedbackId, { status });
    toast.success(`Feedback ${status.toLowerCase()} successfully`);
    loadFeedbacks();
    loadStats();
  };

  const deleteFeedback = (feedbackId: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      feedbackService.deleteFeedback(feedbackId);
      toast.success('Feedback deleted successfully');
      loadFeedbacks();
      loadStats();
    }
  };

  // Filter and sort feedbacks
  const getFilteredFeedbacks = () => {
    let filtered = feedbacks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.locationName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(f => f.status === filterStatus);
    }

    // Rating filter
    if (filterRating !== 'ALL') {
      filtered = filtered.filter(f => Math.round(f.overallRating) === parseInt(filterRating));
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'NEWEST':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'OLDEST':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'HIGHEST':
          return b.overallRating - a.overallRating;
        case 'LOWEST':
          return a.overallRating - b.overallRating;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredFeedbacks = getFilteredFeedbacks();

  const StarRating = ({ rating, readonly = true }: { rating: number; readonly?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating 
              ? 'fill-accent text-accent' 
              : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );

  const getRatingEmoji = (rating: number) => {
    if (rating >= 4.5) return <Smile className="h-6 w-6 text-green-500" />;
    if (rating >= 3) return <Meh className="h-6 w-6 text-yellow-500" />;
    return <Frown className="h-6 w-6 text-red-500" />;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-500';
    if (rating >= 3.5) return 'text-blue-500';
    if (rating >= 2.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-foreground mb-2">Customer Feedback & Ratings ⭐</h2>
        <p className="text-muted-foreground">
          Monitor and respond to customer feedback to improve service quality
        </p>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Feedbacks</p>
                  <p className="text-2xl text-foreground mt-1">{stats.totalFeedbacks}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-2xl ${getRatingColor(stats.averageRating)}`}>
                      {stats.averageRating.toFixed(1)}
                    </p>
                    {stats.averageRating > 0 && getRatingEmoji(stats.averageRating)}
                  </div>
                </div>
                <Star className="h-8 w-8 text-accent fill-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">5-Star Reviews</p>
                  <p className="text-2xl text-green-500 mt-1">
                    {stats.ratingDistribution[5]}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="text-2xl text-foreground mt-1">
                    {feedbacks.length > 0 
                      ? Math.round((feedbacks.filter(f => f.adminResponse).length / feedbacks.length) * 100)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Ratings */}
      {stats && stats.totalFeedbacks > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Category Ratings Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Coffee className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Food Quality</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xl ${getRatingColor(stats.categoryAverages.foodQuality)}`}>
                    {stats.categoryAverages.foodQuality.toFixed(1)}
                  </span>
                  <StarRating rating={Math.round(stats.categoryAverages.foodQuality)} />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Service Quality</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xl ${getRatingColor(stats.categoryAverages.serviceQuality)}`}>
                    {stats.categoryAverages.serviceQuality.toFixed(1)}
                  </span>
                  <StarRating rating={Math.round(stats.categoryAverages.serviceQuality)} />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Ambiance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xl ${getRatingColor(stats.categoryAverages.ambiance)}`}>
                    {stats.categoryAverages.ambiance.toFixed(1)}
                  </span>
                  <StarRating rating={Math.round(stats.categoryAverages.ambiance)} />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Value for Money</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xl ${getRatingColor(stats.categoryAverages.valueForMoney)}`}>
                    {stats.categoryAverages.valueForMoney.toFixed(1)}
                  </span>
                  <StarRating rating={Math.round(stats.categoryAverages.valueForMoney)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, comment, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="HIDDEN">Hidden</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRating} onValueChange={(value: any) => setFilterRating(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Ratings</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ (5 Stars)</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ (4 Stars)</SelectItem>
                <SelectItem value="3">⭐⭐⭐ (3 Stars)</SelectItem>
                <SelectItem value="2">⭐⭐ (2 Stars)</SelectItem>
                <SelectItem value="1">⭐ (1 Star)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEWEST">Newest First</SelectItem>
                <SelectItem value="OLDEST">Oldest First</SelectItem>
                <SelectItem value="HIGHEST">Highest Rating</SelectItem>
                <SelectItem value="LOWEST">Lowest Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-foreground">
            {filteredFeedbacks.length} {filteredFeedbacks.length === 1 ? 'Feedback' : 'Feedbacks'}
          </h3>
        </div>

        {filteredFeedbacks.length === 0 ? (
          <Card className="p-12 bg-card/50 backdrop-blur-sm border-border text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl text-foreground mb-2">No Feedback Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== 'ALL' || filterRating !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Customer feedback will appear here'}
            </p>
          </Card>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <Card key={feedback.id} className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{feedback.customerName}</span>
                          </div>
                          <Badge className={`${getRatingColor(feedback.overallRating)} bg-opacity-10 border-0`}>
                            {feedback.overallRating.toFixed(1)} ⭐
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
                                : feedback.status === 'PENDING'
                                ? 'border-yellow-500/20 text-yellow-500'
                                : 'border-gray-500/20 text-gray-500'
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
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      {/* Category Ratings */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {feedback.foodQuality && (
                          <div className="flex items-center gap-2">
                            <Coffee className="h-4 w-4 text-primary" />
                            <StarRating rating={feedback.foodQuality} />
                          </div>
                        )}
                        {feedback.serviceQuality && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <StarRating rating={feedback.serviceQuality} />
                          </div>
                        )}
                        {feedback.ambiance && (
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-primary" />
                            <StarRating rating={feedback.ambiance} />
                          </div>
                        )}
                        {feedback.valueForMoney && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <StarRating rating={feedback.valueForMoney} />
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
                      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/20">
                            <ThumbsUp className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-primary">Admin Response</span>
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

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddResponse(feedback)}
                        className="border-primary/20 hover:bg-primary/10"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        {feedback.adminResponse ? 'Edit Response' : 'Add Response'}
                      </Button>

                      {feedback.status === 'PUBLISHED' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFeedbackStatus(feedback.id, 'HIDDEN')}
                          className="border-yellow-500/20 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Hide
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFeedbackStatus(feedback.id, 'PUBLISHED')}
                          className="border-green-500/20 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Publish
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteFeedback(feedback.id)}
                        className="border-red-500/20 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>
              Show your customers you care by responding to their feedback
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              {/* Original Feedback */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{selectedFeedback.customerName}</span>
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                    {selectedFeedback.overallRating} ⭐
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedFeedback.comment}</p>
              </div>

              {/* Response Input */}
              <div>
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  placeholder="Thank you for your feedback! We appreciate..."
                  className="mt-2 min-h-[120px]"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResponseDialog(false);
                setResponseText('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitResponse}
              className="bg-gradient-to-r from-primary to-accent text-white"
              disabled={!responseText.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
