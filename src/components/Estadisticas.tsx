import React, { useEffect, useState } from 'react';
import { trackingService, type TrackingStats, type VisitorData } from '@/utils/trackingService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EstadisticasLogin } from './EstadisticasLogin';

export function Estadisticas() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<TrackingStats>(trackingService.getStats());
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem('namuiWam_dashboard_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Track visit on load only if authenticated
    const track = async () => {
      setIsTracking(true);
      await trackingService.trackVisit();
      // Start realtime tracking
      trackingService.startRealTimeTracking((location) => {
        setCurrentLocation({ lat: location.latitude, lng: location.longitude });
        setStats(trackingService.getStats());
      });
      setIsTracking(false);
    };
    track();

    // Cleanup on unmount
    return () => {
      trackingService.stopRealTimeTracking();
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('namuiWam_dashboard_auth');
    setIsAuthenticated(false);
  };

  // Calculate percentages for charts
  const getDevicePercentage = (deviceType: string) => {
    if (stats.totalVisitors === 0) return 0;
    return ((stats.visitorsByDevice[deviceType] || 0) / stats.totalVisitors) * 100;
  };

  const deviceColors: Record<string, string> = {
    mobile: '#10B981',
    desktop: '#1E3A8A',
    tablet: '#E6007E',
  };

  const deviceNames: Record<string, string> = {
    mobile: 'Móvil',
    desktop: 'PC',
    tablet: 'Tablet',
  };

  const getMapUrlForLocation = (location: { lat: number; lng: number }) => {
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  };

  // Simple pie chart using CSS
  const PieChart = () => {
    const total = Object.values(stats.visitorsByDevice).reduce((a, b) => (a || 0) + (b || 0), 0) || 1;
    const segments = Object.entries(stats.visitorsByDevice).map(([type, count]) => {
      const percentage = (count || 0) / total;
      return { type, percentage, color: deviceColors[type] };
    });

    let currentAngle = 0;
    const conicGradient = segments.map(seg => {
      const startAngle = currentAngle;
      currentAngle += seg.percentage * 360;
      return `${seg.color} ${startAngle}deg ${currentAngle}deg`;
    }).join(', ');

    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-48 h-48 rounded-full relative"
          style={{ background: `conic-gradient(${conicGradient})` }}
        />
        <div className="flex flex-wrap gap-3 justify-center">
          {segments.map(seg => (
            <div key={seg.type} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: seg.color }} />
              <span className="text-sm font-semibold text-gray-700">
                {deviceNames[seg.type]} ({Math.round(seg.percentage * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <EstadisticasLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  // If authenticated, show dashboard
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard de Estadísticas</h1>
            <p className="text-sm text-gray-500 mt-1">Datos de uso de la aplicación Namui Wam</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline">
              ← Volver al juego
            </a>
            <button 
              onClick={handleLogout}
              className="text-sm font-semibold text-red-600 hover:text-red-800 underline"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-blue-600">{stats.totalVisitors}</CardTitle>
              <CardDescription>Visitantes totales</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-green-600">{stats.visitorsByLocation.length}</CardTitle>
              <CardDescription>Ubicaciones únicas</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-purple-600">{stats.visitorsByDevice.mobile || 0}</CardTitle>
              <CardDescription>Usuarios en móvil</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-yellow-600">{stats.recentVisitors.length}</CardTitle>
              <CardDescription>Visitas recientes</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Charts and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Device Chart */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Dispositivos</CardTitle>
              <CardDescription>Distribución por tipo de dispositivo</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart />
            </CardContent>
          </Card>

          {/* Live Location Map */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>📍 Ubicación en Tiempo Real</CardTitle>
              <CardDescription>Tu ubicación actual actualizada en directo</CardDescription>
            </CardHeader>
            <CardContent>
              {currentLocation ? (
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      width="100%"
                      height="100%"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}&z=16&output=embed`}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="text-center">
                    <a 
                      href={getMapUrlForLocation(currentLocation)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-blue-600 hover:underline"
                    >
                      🔗 Abrir en Google Maps
                    </a>
                  </div>
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p>Obteniendo ubicación...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Visitors Table */}
        <Card className="shadow-md hover:shadow-lg transition-shadow mb-8">
          <CardHeader>
            <CardTitle>Historial de Visitas</CardTitle>
            <CardDescription>Listado completo de visitas recientes</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Ubicación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentVisitors.map((visitor, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{visitor.deviceName}</TableCell>
                      <TableCell>
                        <Badge style={{ backgroundColor: deviceColors[visitor.deviceType] }} className="text-white">
                          {deviceNames[visitor.deviceType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(visitor.timestamp).toLocaleString('es-ES')}
                      </TableCell>
                      <TableCell>
                        {visitor.location ? (
                          <a 
                            href={getMapUrlForLocation(visitor.location)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-blue-600 hover:underline"
                          >
                            📍 Ver en mapa
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">No disponible</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {stats.recentVisitors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                        No hay visitas registradas aún
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* All Locations */}
        {stats.visitorsByLocation.length > 0 && (
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Todas las Ubicaciones</CardTitle>
              <CardDescription>Listado de todas las ubicaciones registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.visitorsByLocation.map((location, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{location.name}</span>
                      <Badge className="bg-green-500 text-white">{location.count} visitas</Badge>
                    </div>
                    <a 
                      href={getMapUrlForLocation(location)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      🗺️ Abrir en Google Maps
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
