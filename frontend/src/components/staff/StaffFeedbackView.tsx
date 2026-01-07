import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Star, 
  MessageSquare, 
  Coffee, 
  Users, 
  Home, 
  DollarSign,
  Calendar,
  MapPin,
  ShoppingBag,
  Award,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  User
} from 'lucide-react';
import { feedbackService, Feedback, FeedbackStats } from '../../services/feedbackService';
import { ScrollArea } from '../ui/scroll-area';

export function StaffFeedbackView() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);

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
    const allFeedbacks = feedbackService.getAllFeedbacks()
      .filter(f => f.status === 'PUBLISHED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFeedbacks(allFeedbacks);
  };

  const loadStats = () => {
    const statistics = feedbackService.getFeedbackStats();
    setStats(statistics);
  };

  const StarRating = ({ rating }: { rating: number }) => (
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
        <h2 className="text-2xl text-foreground mb-2">Customer Feedback ⭐</h2>
        <p className="text-muted-foreground">
          View customer ratings and feedback to maintain quality standards
        </p>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
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
                  <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                  <p className="text-2xl text-foreground mt-1">
                    {stats.totalFeedbacks > 0 
                      ? Math.round((stats.averageRating / 5) * 100)
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
            <CardTitle className="text-foreground">Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Coffee className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Food Quality</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl ${getRatingColor(stats.categoryAverages.foodQuality)}`}>
                    {stats.categoryAverages.foodQuality.toFixed(1)}
                  </span>
                  <StarRating rating={Math.round(stats.categoryAverages.foodQuality)} />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Service Quality</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl ${getRatingColor(stats.categoryAverages.serviceQuality)}`}>
                    {stats.categoryAverages.serviceQuality.toFixed(1)}
                  </span>
                  <StarRating rating={Math.round(stats.categoryAverages.serviceQuality)} />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Ambiance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl ${getRatingColor(stats.categoryAverages.ambiance)}`}>
                    {stats.categoryAverages.ambiance.toFixed(1)}
                  </span>
                  <StarRating rating={Math.round(stats.categoryAverages.ambiance)} />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Value for Money</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl ${getRatingColor(stats.categoryAverages.valueForMoney)}`}>
                    {stats.categoryAverages.valueForMoney.toFixed(1)}
                  </span>
                  <StarRating rating={Math.round(stats.categoryAverages.valueForMoney)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Feedback */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Customer Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No customer feedback yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {feedbacks.slice(0, 20).map((feedback) => (
                  <div key={feedback.id} className="p-4 rounded-lg bg-muted/20 border border-border">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{feedback.customerName}</span>
                          <Badge className={`${getRatingColor(feedback.overallRating)} bg-opacity-10 border-0`}>
                            {feedback.overallRating.toFixed(1)} ⭐
                          </Badge>
                          {feedback.orderId && (
                            <Badge variant="outline" className="border-primary/20 text-xs">
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              Order #{feedback.orderId.slice(-6)}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {feedback.locationName && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {feedback.locationName}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Category Ratings */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {feedback.foodQuality && (
                          <div className="flex items-center gap-1">
                            <Coffee className="h-3 w-3 text-primary" />
                            <StarRating rating={feedback.foodQuality} />
                          </div>
                        )}
                        {feedback.serviceQuality && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-primary" />
                            <StarRating rating={feedback.serviceQuality} />
                          </div>
                        )}
                        {feedback.ambiance && (
                          <div className="flex items-center gap-1">
                            <Home className="h-3 w-3 text-primary" />
                            <StarRating rating={feedback.ambiance} />
                          </div>
                        )}
                        {feedback.valueForMoney && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-primary" />
                            <StarRating rating={feedback.valueForMoney} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-foreground leading-relaxed">
                      "{feedback.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
