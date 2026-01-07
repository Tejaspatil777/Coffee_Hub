import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Users, 
  Clock, 
  Activity,
  RefreshCw
} from 'lucide-react';
import { 
  getActiveCustomerSessions, 
  getStatusLabel, 
  getStatusColor,
  type CustomerSession 
} from '../../services/customerSessionService';
import { ScrollArea } from '../ui/scroll-area';

export function ActiveCustomerSessions() {
  const [sessions, setSessions] = useState<CustomerSession[]>([]);

  useEffect(() => {
    loadSessions();

    // Listen for session updates
    const handleSessionCreated = () => {
      loadSessions();
    };

    const handleSessionUpdated = () => {
      loadSessions();
    };

    const handleSessionRemoved = () => {
      loadSessions();
    };

    window.addEventListener('customerSessionCreated', handleSessionCreated);
    window.addEventListener('customerSessionUpdated', handleSessionUpdated);
    window.addEventListener('customerSessionRemoved', handleSessionRemoved);

    // Poll for updates every 5 seconds
    const interval = setInterval(loadSessions, 5000);

    return () => {
      window.removeEventListener('customerSessionCreated', handleSessionCreated);
      window.removeEventListener('customerSessionUpdated', handleSessionUpdated);
      window.removeEventListener('customerSessionRemoved', handleSessionRemoved);
      clearInterval(interval);
    };
  }, []);

  const loadSessions = () => {
    const activeSessions = getActiveCustomerSessions();
    // Sort by most recent activity
    activeSessions.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
    setSessions(activeSessions);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimeAgo = (isoString: string) => {
    const now = new Date().getTime();
    const time = new Date(isoString).getTime();
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  return (
    <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              Active Customers
              {sessions.length > 0 && (
                <Badge className="bg-primary text-white">{sessions.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time customer activity tracking
            </CardDescription>
          </div>
          <RefreshCw 
            className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" 
            onClick={loadSessions}
          />
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No active customers</p>
            <p className="text-sm text-muted-foreground mt-2">
              Customers will appear here when they log in
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card
                  key={session.userId}
                  className="border-2 border-border bg-background/50 hover:border-primary/30 transition-all"
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-primary" />
                          <h4 className="text-foreground">{session.userName}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{session.userEmail}</p>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        {getStatusLabel(session.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Login Time</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">{formatTime(session.loginTime)}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Last Activity</p>
                        <span className="text-foreground">{getTimeAgo(session.lastActivity)}</span>
                      </div>

                      {session.tableNumber && (
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Table</p>
                          <span className="text-foreground">Table {session.tableNumber}</span>
                        </div>
                      )}

                      {session.locationName && (
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Location</p>
                          <span className="text-foreground">{session.locationName}</span>
                        </div>
                      )}
                    </div>

                    {session.currentBookingId && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Booking ID: <span className="text-foreground">{session.currentBookingId}</span>
                        </p>
                      </div>
                    )}

                    {session.currentOrderId && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Order ID: <span className="text-foreground">{session.currentOrderId}</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
