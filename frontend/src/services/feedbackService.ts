// Customer Feedback Service
// Handles feedback and ratings for orders, service, ambiance, and overall experience

export interface Feedback {
  id: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  bookingId?: string;
  locationId?: string;
  locationName?: string;
  type: 'ORDER' | 'SERVICE' | 'AMBIANCE' | 'OVERALL';
  
  // Ratings (1-5 stars)
  foodQuality?: number;
  serviceQuality?: number;
  ambiance?: number;
  valueForMoney?: number;
  overallRating: number;
  
  // Feedback text
  comment: string;
  
  // Metadata
  createdAt: string;
  status: 'PENDING' | 'PUBLISHED' | 'HIDDEN';
  adminResponse?: string;
  respondedAt?: string;
}

export interface FeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  categoryAverages: {
    foodQuality: number;
    serviceQuality: number;
    ambiance: number;
    valueForMoney: number;
  };
}

class FeedbackService {
  private storageKey = 'takebits_feedbacks';

  // Get all feedbacks
  getAllFeedbacks(): Feedback[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Get feedbacks by customer
  getCustomerFeedbacks(customerId: string): Feedback[] {
    return this.getAllFeedbacks().filter(f => f.customerId === customerId);
  }

  // Get feedbacks by location
  getLocationFeedbacks(locationId: string): Feedback[] {
    return this.getAllFeedbacks()
      .filter(f => f.locationId === locationId && f.status === 'PUBLISHED');
  }

  // Get feedback by order
  getFeedbackByOrder(orderId: string): Feedback | null {
    return this.getAllFeedbacks().find(f => f.orderId === orderId) || null;
  }

  // Submit new feedback
  submitFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>): Feedback {
    const feedbacks = this.getAllFeedbacks();
    
    const newFeedback: Feedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'PUBLISHED'
    };

    feedbacks.push(newFeedback);
    localStorage.setItem(this.storageKey, JSON.stringify(feedbacks));

    // Trigger event for real-time updates
    window.dispatchEvent(new CustomEvent('feedbackSubmitted', { detail: newFeedback }));

    return newFeedback;
  }

  // Update feedback
  updateFeedback(feedbackId: string, updates: Partial<Feedback>): Feedback | null {
    const feedbacks = this.getAllFeedbacks();
    const index = feedbacks.findIndex(f => f.id === feedbackId);

    if (index === -1) return null;

    feedbacks[index] = { ...feedbacks[index], ...updates };
    localStorage.setItem(this.storageKey, JSON.stringify(feedbacks));

    return feedbacks[index];
  }

  // Admin: Add response to feedback
  addAdminResponse(feedbackId: string, response: string): Feedback | null {
    return this.updateFeedback(feedbackId, {
      adminResponse: response,
      respondedAt: new Date().toISOString()
    });
  }

  // Delete feedback
  deleteFeedback(feedbackId: string): boolean {
    const feedbacks = this.getAllFeedbacks();
    const filtered = feedbacks.filter(f => f.id !== feedbackId);

    if (filtered.length === feedbacks.length) return false;

    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    return true;
  }

  // Get feedback statistics
  getFeedbackStats(locationId?: string): FeedbackStats {
    let feedbacks = this.getAllFeedbacks().filter(f => f.status === 'PUBLISHED');
    
    if (locationId) {
      feedbacks = feedbacks.filter(f => f.locationId === locationId);
    }

    const totalFeedbacks = feedbacks.length;
    
    if (totalFeedbacks === 0) {
      return {
        totalFeedbacks: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        categoryAverages: {
          foodQuality: 0,
          serviceQuality: 0,
          ambiance: 0,
          valueForMoney: 0
        }
      };
    }

    // Calculate average rating
    const totalRating = feedbacks.reduce((sum, f) => sum + f.overallRating, 0);
    const averageRating = totalRating / totalFeedbacks;

    // Calculate rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach(f => {
      const rating = Math.round(f.overallRating) as 1 | 2 | 3 | 4 | 5;
      ratingDistribution[rating]++;
    });

    // Calculate category averages
    const categoryAverages = {
      foodQuality: this.calculateAverage(feedbacks, 'foodQuality'),
      serviceQuality: this.calculateAverage(feedbacks, 'serviceQuality'),
      ambiance: this.calculateAverage(feedbacks, 'ambiance'),
      valueForMoney: this.calculateAverage(feedbacks, 'valueForMoney')
    };

    return {
      totalFeedbacks,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      categoryAverages
    };
  }

  private calculateAverage(feedbacks: Feedback[], field: keyof Feedback): number {
    const values = feedbacks
      .map(f => f[field])
      .filter((v): v is number => typeof v === 'number');
    
    if (values.length === 0) return 0;
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }

  // Check if customer can submit feedback for order
  canSubmitFeedbackForOrder(orderId: string): boolean {
    return !this.getFeedbackByOrder(orderId);
  }

  // Initialize with sample data
  initializeSampleData() {
    const existing = this.getAllFeedbacks();
    if (existing.length > 0) return;

    const sampleFeedbacks: Feedback[] = [
      {
        id: 'feedback_1',
        customerId: 'customer_1',
        customerName: 'Sarah Johnson',
        orderId: 'order_1',
        locationId: 'loc_1',
        locationName: 'TakeBits Manhattan Central',
        type: 'ORDER',
        foodQuality: 5,
        serviceQuality: 5,
        ambiance: 4,
        valueForMoney: 5,
        overallRating: 5,
        comment: 'Absolutely amazing experience! The Caramel Macchiato was perfectly crafted, and the Blueberry Muffin was fresh and delicious. The staff was incredibly friendly and attentive. Will definitely be back!',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PUBLISHED',
        adminResponse: 'Thank you so much for your kind words, Sarah! We\'re thrilled you enjoyed your visit. Looking forward to serving you again! ☕',
        respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'feedback_2',
        customerId: 'customer_2',
        customerName: 'Michael Chen',
        orderId: 'order_2',
        locationId: 'loc_2',
        locationName: 'TakeBits Brooklyn Heights',
        type: 'ORDER',
        foodQuality: 4,
        serviceQuality: 5,
        ambiance: 5,
        valueForMoney: 4,
        overallRating: 4,
        comment: 'Great coffee and cozy atmosphere. The Cappuccino was excellent, though I found it slightly pricey. The service was top-notch, and the place is perfect for working remotely.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PUBLISHED'
      },
      {
        id: 'feedback_3',
        customerId: 'customer_3',
        customerName: 'Emily Rodriguez',
        locationId: 'loc_1',
        locationName: 'TakeBits Manhattan Central',
        type: 'AMBIANCE',
        foodQuality: 5,
        serviceQuality: 4,
        ambiance: 5,
        valueForMoney: 5,
        overallRating: 5,
        comment: 'Love the modern decor and comfortable seating! Perfect spot for meeting friends or getting work done. The WiFi is fast and the music selection is great.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PUBLISHED',
        adminResponse: 'We\'re so happy you love our space, Emily! We put a lot of thought into creating a comfortable environment for all our guests. ☕',
        respondedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    localStorage.setItem(this.storageKey, JSON.stringify(sampleFeedbacks));
  }
}

export const feedbackService = new FeedbackService();
