import { supabase } from '../lib/supabase';

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
  visitCount: number;
}

export interface TrackingStats {
  totalVisitors: number;
  totalVisits: number;
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
        console.log('[Tracking] Geolocalización no disponible en este navegador');
        resolve(null);
        return;
      }
      
      console.log('[Tracking] Iniciando solicitud de ubicación (compatible con todas las redes)...');
      
      // Función para intentar obtener ubicación con configuración específica
      const tryGetLocation = (options: PositionOptions, attempt: number) => {
        console.log(`[Tracking] Intento ${attempt} con opciones:`, options);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log(`[Tracking] Intento ${attempt} exitoso! Ubicación obtenida:`, position.coords);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          },
          (error) => {
            console.log(`[Tracking] Intento ${attempt} fallido:`, error.code, error.message);
            
            // Estrategia de fallback para todas las redes (WiFi, 4G, 5G)
            if (attempt === 1) {
              // Intento 1: Alta precisión (GPS) - ideal para WiFi/GPS
              console.log('[Tracking] Intentando sin alta precisión (mejor para redes móviles)...');
              tryGetLocation({ enableHighAccuracy: false, timeout: 30000, maximumAge: 600000 }, 2);
            } else if (attempt === 2) {
              // Intento 2: Baja precisión (torres de celular/WiFi) - ideal para 4G/5G
              console.log('[Tracking] Intentando con caché prolongada (más rápido)...');
              tryGetLocation({ enableHighAccuracy: false, timeout: 60000, maximumAge: 3600000 }, 3);
            } else if (attempt === 3) {
              // Intento 3: Caché máxima - funciona incluso con mala señal
              console.log('[Tracking] Último intento: usar cualquier ubicación en caché...');
              tryGetLocation({ enableHighAccuracy: false, timeout: 90000, maximumAge: 7200000 }, 4);
            } else {
              // Todos los intentos fallaron
              let errorMsg = '';
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  errorMsg = 'El usuario negó el permiso de ubicación';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMsg = 'La información de ubicación no está disponible (verifica GPS/Red)';
                  break;
                case error.TIMEOUT:
                  errorMsg = 'La solicitud de ubicación expiró (intenta con mejor señal)';
                  break;
                default:
                  errorMsg = 'Error desconocido al obtener la ubicación';
              }
              console.log('[Tracking]', errorMsg);
              resolve(null);
            }
          },
          options
        );
      };
      
      // Empezar con alta precisión, pero con fallbacks para todo tipo de red
      tryGetLocation({ enableHighAccuracy: true, timeout: 25000, maximumAge: 300000 }, 1);
    });
  }

  startRealTimeTracking(onLocationUpdate: (location: { latitude: number; longitude: number; accuracy: number }) => void) {
    if (!navigator.geolocation) {
      console.log('[Tracking] Geolocalización no disponible para seguimiento en tiempo real');
      return;
    }

    console.log('[Tracking] Iniciando seguimiento en tiempo real...');
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        console.log('[Tracking] Actualización de ubicación:', location);
        onLocationUpdate(location);
        this.updateVisitorLocation(location);
      },
      (error) => {
        console.log('[Tracking] Error en seguimiento en tiempo real:', error.message);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
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
        visitCount: 1,
      };
      stats.recentVisitors.unshift(visitor);
      stats.recentVisitors = stats.recentVisitors.slice(0, 50);
      stats.totalVisitors = stats.recentVisitors.length;
    }

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
        totalVisits: 0,
        visitorsByDevice: {},
        visitorsByLocation: [],
        recentVisitors: [],
      };
    }
    try {
      const parsed = JSON.parse(data);
      return {
        totalVisitors: parsed.totalVisitors || 0,
        totalVisits: parsed.totalVisits || 0,
        visitorsByDevice: parsed.visitorsByDevice || {},
        visitorsByLocation: parsed.visitorsByLocation || [],
        recentVisitors: parsed.recentVisitors || [],
      };
    } catch (e) {
      console.error('[Tracking] Error al leer datos de localStorage:', e);
      return {
        totalVisitors: 0,
        totalVisits: 0,
        visitorsByDevice: {},
        visitorsByLocation: [],
        recentVisitors: [],
      };
    }
  }

  private saveData(stats: TrackingStats) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stats));
      console.log('[Tracking] Datos guardados en localStorage:', stats);
    } catch (e) {
      console.error('[Tracking] Error al guardar datos en localStorage:', e);
    }
  }

  private async sendVisitorToSupabase(visitor: VisitorData) {
    try {
      console.log('[Tracking] Enviando datos a Supabase...');
      const { data, error } = await supabase
        .from('visitors')
        .upsert({
          id: visitor.id,
          device_name: visitor.deviceName,
          device_type: visitor.deviceType,
          timestamp: new Date(visitor.timestamp).toISOString(),
          latitude: visitor.location?.latitude,
          longitude: visitor.location?.longitude,
          accuracy: visitor.location?.accuracy,
          user_agent: visitor.userAgent,
          visit_count: visitor.visitCount,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (error) {
        console.error('[Tracking] Error al enviar a Supabase:', error);
      } else {
        console.log('[Tracking] Datos enviados a Supabase exitosamente:', data);
      }
    } catch (err) {
      console.error('[Tracking] Error inesperado al enviar a Supabase:', err);
    }
  }

  async trackVisit(): Promise<VisitorData> {
    console.log('[Tracking] Iniciando seguimiento de visita...');
    const stats = this.getStoredData();
    const visitorId = this.getVisitorId();
    
    console.log('[Tracking] Obteniendo ubicación...');
    const location = await this.getCurrentLocation();
    console.log('[Tracking] Ubicación final:', location);
    
    const existingIndex = stats.recentVisitors.findIndex(v => v.id === visitorId);
    
    let visitor: VisitorData;
    
    if (existingIndex === -1) {
      visitor = {
        id: visitorId,
        deviceName: this.getDeviceName(),
        deviceType: this.getDeviceType(),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        location: location || undefined,
        visitCount: 1,
      };
      stats.recentVisitors.unshift(visitor);
      stats.recentVisitors = stats.recentVisitors.slice(0, 50);
      stats.totalVisitors = stats.recentVisitors.length;
      
      const deviceTypeKey = visitor.deviceType;
      stats.visitorsByDevice[deviceTypeKey] = (stats.visitorsByDevice[deviceTypeKey] || 0) + 1;
    } else {
      visitor = {
        ...stats.recentVisitors[existingIndex],
        timestamp: Date.now(),
        location: location || stats.recentVisitors[existingIndex].location,
        visitCount: (stats.recentVisitors[existingIndex].visitCount || 1) + 1,
      };
      stats.recentVisitors[existingIndex] = visitor;
    }
    
    stats.totalVisits = (stats.totalVisits || 0) + 1;

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
    
    // Enviar datos a Supabase en segundo plano
    this.sendVisitorToSupabase(visitor);
    
    console.log('[Tracking] Visita registrada exitosamente:', visitor);
    return visitor;
  }

  getStats(): TrackingStats {
    const stats = this.getStoredData();
    console.log('[Tracking] Obteniendo estadísticas:', stats);
    return stats;
  }

  async syncFromSupabase(): Promise<TrackingStats> {
    try {
      console.log('[Tracking] Sincronizando datos desde Supabase...');
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('[Tracking] Error al sincronizar desde Supabase:', error);
        return this.getStoredData();
      }

      if (data && data.length > 0) {
        // Convertir datos de Supabase a nuestro formato
        const visitorsFromSupabase: VisitorData[] = data.map((item: any) => ({
          id: item.id,
          deviceName: item.device_name,
          deviceType: item.device_type as 'mobile' | 'desktop' | 'tablet',
          timestamp: new Date(item.timestamp).getTime(),
          userAgent: item.user_agent,
          visitCount: item.visit_count || 1,
          location: (item.latitude && item.longitude) ? {
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            accuracy: item.accuracy ? parseFloat(item.accuracy) : 0,
          } : undefined,
        }));

        // Actualizar estadísticas
        const newStats: TrackingStats = {
          totalVisitors: visitorsFromSupabase.length,
          totalVisits: visitorsFromSupabase.reduce((sum, v) => sum + (v.visitCount || 1), 0),
          visitorsByDevice: {},
          visitorsByLocation: [],
          recentVisitors: visitorsFromSupabase,
        };

        // Contar por tipo de dispositivo
        visitorsFromSupabase.forEach(v => {
          newStats.visitorsByDevice[v.deviceType] = (newStats.visitorsByDevice[v.deviceType] || 0) + 1;
        });

        // Agrupar por ubicación
        const locationMap = new Map<string, { lat: number; lng: number; count: number }>();
        visitorsFromSupabase.forEach(v => {
          if (v.location) {
            const key = `${v.location.latitude.toFixed(2)}_${v.location.longitude.toFixed(2)}`;
            const existing = locationMap.get(key);
            if (existing) {
              existing.count++;
            } else {
              locationMap.set(key, {
                lat: v.location.latitude,
                lng: v.location.longitude,
                count: 1,
              });
            }
          }
        });

        newStats.visitorsByLocation = Array.from(locationMap.entries()).map(([key, loc], index) => ({
          name: `Ubicación ${index + 1}`,
          lat: loc.lat,
          lng: loc.lng,
          count: loc.count,
        }));

        this.saveData(newStats);
        console.log('[Tracking] Datos sincronizados desde Supabase exitosamente');
        return newStats;
      }

      return this.getStoredData();
    } catch (err) {
      console.error('[Tracking] Error inesperado al sincronizar desde Supabase:', err);
      return this.getStoredData();
    }
  }

  clearAllData() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(VISITOR_ID_KEY);
    console.log('[Tracking] Todos los datos de tracking han sido eliminados');
  }
}

export const trackingService = new TrackingService();
