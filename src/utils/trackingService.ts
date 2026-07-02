export interface VisitorData {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    city?: string;
  };
  userAgent: string;
}

export interface TrackingStats {
  totalVisitors: number;
  visitorsByDevice: Record<string, number>;
  visitorsByLocation: Array<{
    name: string;
    count: number;
    lat: number;
    lng: number;
  }>;
  recentVisitors: VisitorData[];
}

const LOCAL_STORAGE_KEY = 'namuiWam_trackingData';
const VISITOR_ID_KEY = 'namuiWam_visitorId';

export class TrackingService {
  private watchId: number | null = null;

  private getVisitorId(): string {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  }

  private getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private getDeviceName(): string {
    const userAgent = navigator.userAgent;
    if (/iPhone/.test(userAgent)) return 'iPhone';
    if (/iPad/.test(userAgent)) return 'iPad';
    if (/Android/.test(userAgent)) return 'Android';
    if (/Mac/.test(userAgent)) return 'Mac';
    if (/Windows/.test(userAgent)) return 'Windows PC';
    if (/Linux/.test(userAgent)) return 'Linux';
    return 'Unknown Device';
  }

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number; accuracy: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        () => {
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  startRealTimeTracking(onLocationUpdate: (location: { latitude: number; longitude: number; accuracy: number }) => void) {
    if (!navigator.geolocation) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        onLocationUpdate(location);
        this.updateVisitorLocation(location);
      },
      null,
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }

  stopRealTimeTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private updateVisitorLocation(location: { latitude: number; longitude: number; accuracy: number }) {
    const stats = this.getStoredData();
    const visitorId = this.getVisitorId();
    
    // Update or add current visitor
    const existingIndex = stats.recentVisitors.findIndex(v => v.id === visitorId);
    
    if (existingIndex !== -1) {
      stats.recentVisitors[existingIndex].location = location;
      stats.recentVisitors[existingIndex].timestamp = Date.now();
    } else {
      const visitor: VisitorData = {
        id: visitorId,
        deviceName: this.getDeviceName(),
        deviceType: this.getDeviceType(),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        location: location,
      };
      stats.recentVisitors.unshift(visitor);
      stats.recentVisitors = stats.recentVisitors.slice(0, 50);
      stats.totalVisitors = stats.recentVisitors.length;
    }

    // Update location stats
    const existingLocationIndex = stats.visitorsByLocation.findIndex(
      loc => Math.abs(loc.lat - location.latitude) < 0.01 &&
             Math.abs(loc.lng - location.longitude) < 0.01
    );

    if (existingLocationIndex === -1) {
      stats.visitorsByLocation.push({
        name: `Ubicación ${stats.visitorsByLocation.length + 1}`,
        count: 1,
        lat: location.latitude,
        lng: location.longitude,
      });
    }

    // Update device stats
    const deviceTypeKey = this.getDeviceType();
    if (existingIndex === -1) {
      stats.visitorsByDevice[deviceTypeKey] = (stats.visitorsByDevice[deviceTypeKey] || 0) + 1;
    }

    this.saveData(stats);
  }

  private getStoredData(): TrackingStats {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      return {
        totalVisitors: 0,
        visitorsByDevice: {},
        visitorsByLocation: [],
        recentVisitors: [],
      };
    }
    try {
      return JSON.parse(data);
    } catch {
      return {
        totalVisitors: 0,
        visitorsByDevice: {},
        visitorsByLocation: [],
        recentVisitors: [],
      };
    }
  }

  private saveData(stats: TrackingStats) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stats));
  }

  async trackVisit(): Promise<VisitorData> {
    const stats = this.getStoredData();
    const visitorId = this.getVisitorId();
    const location = await this.getCurrentLocation();
    
    const visitor: VisitorData = {
      id: visitorId,
      deviceName: this.getDeviceName(),
      deviceType: this.getDeviceType(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      location: location || undefined,
    };

    // Check if this visitor already exists in recent visitors
    const existingIndex = stats.recentVisitors.findIndex(v => v.id === visitorId);
    if (existingIndex === -1) {
      stats.recentVisitors.unshift(visitor);
      stats.recentVisitors = stats.recentVisitors.slice(0, 50); // Keep last 50 visitors
    } else {
      // Update existing visitor
      stats.recentVisitors[existingIndex] = visitor;
    }

    // Update device stats
    const deviceTypeKey = visitor.deviceType;
    stats.visitorsByDevice[deviceTypeKey] = (stats.visitorsByDevice[deviceTypeKey] || 0) + 1;
    stats.totalVisitors = stats.recentVisitors.length;

    // Update location stats
    if (visitor.location) {
      const existingLocationIndex = stats.visitorsByLocation.findIndex(
        loc => Math.abs(loc.lat - visitor.location!.latitude) < 0.1 &&
               Math.abs(loc.lng - visitor.location!.longitude) < 0.1
      );

      if (existingLocationIndex === -1) {
        stats.visitorsByLocation.push({
          name: `Ubicación ${stats.visitorsByLocation.length + 1}`,
          count: 1,
          lat: visitor.location.latitude,
          lng: visitor.location.longitude,
        });
      } else {
        stats.visitorsByLocation[existingLocationIndex].count++;
      }
    }

    this.saveData(stats);
    return visitor;
  }

  getStats(): TrackingStats {
    return this.getStoredData();
  }
}

export const trackingService = new TrackingService();
