import React, { useEffect, useState } from 'react';
import { trackingService, type TrackingStats, type VisitorData } from '@/utils/trackingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EstadisticasLogin } from './EstadisticasLogin';
import { ChevronDown, ChevronUp, RefreshCw, MapPin } from 'lucide-react';

export function Estadisticas() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<TrackingStats>(trackingService.getStats());
  const [isLoading, setIsLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorData | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const auth = localStorage.getItem('namuiWam_dashboard_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Verificar si estamos en HTTPS (requisito para geolocalización en móviles)
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    if (!isHttps && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.warn('[Dashboard] ADVERTENCIA: No estás en HTTPS! La geolocalización NO funcionará en dispositivos móviles.');
    }
    
    const initialize = async () => {
      setIsLoading(true);
      await syncData();
      setIsLoading(false);
      
      startLocationTracking();
    };
    initialize();

    return () => {
      trackingService.stopRealTimeTracking();
    };
  }, [isAuthenticated]);
  
  // Función para recargar la página en HTTPS
  const redirectToHttps = () => {
    if (typeof window !== 'undefined') {
      const httpsUrl = 'https://' + window.location.hostname + window.location.pathname + window.location.search;
      window.location.href = httpsUrl;
    }
  };

  const syncData = async () => {
    setIsLoading(true);
    const newStats = await trackingService.syncFromSupabase();
    setStats(newStats);
    setIsLoading(false);
  };

  const startLocationTracking = () => {
    trackingService.startRealTimeTracking((location) => {
      setCurrentLocation({ lat: location.latitude, lng: location.longitude });
      setStats(trackingService.getStats());
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('namuiWam_dashboard_auth');
    setIsAuthenticated(false);
  };

  const toggleRowExpansion = (visitorId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(visitorId)) {
        newSet.delete(visitorId);
      } else {
        newSet.add(visitorId);
      }
      return newSet;
    });
  };

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

  const deviceIcons: Record<string, string> = {
    mobile: '📱',
    desktop: '💻',
    tablet: '📟',
  };

  const getMapUrlForLocation = (location: { lat: number; lng: number }) => {
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  };

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

  if (!isAuthenticated) {
    return <EstadisticasLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard de Estadísticas</h1>
            <p className="text-sm text-gray-500 mt-1">Datos de uso de la aplicación Namui Wam</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Button 
              onClick={syncData} 
              disabled={isLoading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
            <a href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline">
              ← Volver al juego
            </a>
            <button 
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres borrar todos los datos de tracking?')) {
                  trackingService.clearAllData();
                  setStats(trackingService.getStats());
                }
              }}
              className="text-sm font-semibold text-orange-600 hover:text-orange-800 underline"
            >
              🗑️ Borrar datos
            </button>
            <button 
              onClick={handleLogout}
              className="text-sm font-semibold text-red-600 hover:text-red-800 underline"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Advertencia de HTTPS */}
        {!isHttps && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded shadow">
            <div className="flex items-center gap-3">
              <div className="text-red-500 text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-bold text-red-800 text-lg">Sin HTTPS - Geolocalización no funcionará en móviles!</h3>
                <p className="text-red-700 text-sm mt-1">
                  Estás accediendo mediante HTTP. Los navegadores móviles (Android/iOS) 
                  <strong> NO permiten geolocalización en conexiones inseguras</strong>.
                </p>
              </div>
              <Button 
                onClick={redirectToHttps} 
                variant="destructive" 
                className="flex items-center gap-2"
              >
                🔒 Ir a HTTPS
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-blue-600">{stats.totalVisitors}</CardTitle>
              <CardDescription>Visitantes totales</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-green-600">{stats.totalVisits}</CardTitle>
              <CardDescription>Visitas totales</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-purple-600">{stats.visitorsByLocation.length}</CardTitle>
              <CardDescription>Ubicaciones únicas</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-yellow-600">{stats.visitorsByDevice.mobile || 0}</CardTitle>
              <CardDescription>Usuarios en móvil</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Dispositivos</CardTitle>
              <CardDescription>Distribución por tipo de dispositivo</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart />
            </CardContent>
          </Card>

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

        <Card className="shadow-md hover:shadow-lg transition-shadow mb-8">
          <CardHeader>
            <CardTitle>Historial de Visitas</CardTitle>
            <CardDescription>Listado completo de visitas recientes (desde Supabase)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-[80px]">Detalles</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Visitas</TableHead>
                    <TableHead>Última visita</TableHead>
                    <TableHead>Ubicación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentVisitors.map((visitor, index) => (
                    <React.Fragment key={visitor.id}>
                      <TableRow className="cursor-pointer hover:bg-gray-50">
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleRowExpansion(visitor.id)}
                          >
                            {expandedRows.has(visitor.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium flex items-center gap-2">
                          <span className="text-2xl">{deviceIcons[visitor.deviceType]}</span>
                          {visitor.deviceName}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            style={{ backgroundColor: deviceColors[visitor.deviceType] || '#6b7280' }} 
                            className="text-white"
                          >
                            {deviceNames[visitor.deviceType] || visitor.deviceType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-blue-600">
                          {visitor.visitCount || 1}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(visitor.timestamp).toLocaleString('es-ES')}
                        </TableCell>
                        <TableCell>
                          {visitor.location ? (
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex items-center gap-1"
                                    onClick={() => setSelectedVisitor(visitor)}
                                  >
                                    <MapPin className="w-3 h-3" />
                                    Ver ubicación
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      📍 Ubicación de {visitor.deviceName}
                                    </DialogTitle>
                                  </DialogHeader>
                                  {selectedVisitor?.location && (
                                    <div className="space-y-4 pt-4">
                                      <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
                                        <iframe
                                          width="100%"
                                          height="100%"
                                          loading="lazy"
                                          allowFullScreen
                                          referrerPolicy="no-referrer-when-downgrade"
                                          src={`https://www.google.com/maps?q=${selectedVisitor.location.latitude},${selectedVisitor.location.longitude}&z=16&output=embed`}
                                          className="w-full h-full"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="font-semibold text-gray-500">Latitud:</span> {selectedVisitor.location.latitude.toFixed(6)}
                                        </div>
                                        <div>
                                          <span className="font-semibold text-gray-500">Longitud:</span> {selectedVisitor.location.longitude.toFixed(6)}
                                        </div>
                                        {selectedVisitor.location.accuracy && (
                                          <div className="col-span-2">
                                            <span className="font-semibold text-gray-500">Precisión:</span> {selectedVisitor.location.accuracy.toFixed(2)} metros
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex justify-end">
                                        <a 
                                          href={getMapUrlForLocation(selectedVisitor.location)} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm font-bold text-blue-600 hover:underline"
                                        >
                                          🔗 Abrir en Google Maps
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No disponible</span>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(visitor.id) && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50">
                            <div className="p-4 space-y-3">
                              <h4 className="font-semibold text-gray-800">Información detallada del dispositivo:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="space-y-1">
                                  <p><span className="font-semibold text-gray-600">ID del dispositivo:</span> <code className="bg-gray-200 px-1 rounded">{visitor.id}</code></p>
                                  <p><span className="font-semibold text-gray-600">Tipo:</span> {deviceNames[visitor.deviceType] || visitor.deviceType}</p>
                                  <p><span className="font-semibold text-gray-600">Número de visitas:</span> {visitor.visitCount || 1}</p>
                                </div>
                                <div className="space-y-1">
                                  <p><span className="font-semibold text-gray-600">Última visita:</span> {new Date(visitor.timestamp).toLocaleString('es-ES')}</p>
                                  {visitor.location && (
                                    <>
                                      <p><span className="font-semibold text-gray-600">Última ubicación:</span> {visitor.location.latitude.toFixed(4)}, {visitor.location.longitude.toFixed(4)}</p>
                                    </>
                                  )}
                                </div>
                              </div>
                              {visitor.userAgent && (
                                <div className="mt-3">
                                  <p className="font-semibold text-gray-600 text-sm mb-1">User Agent (Navegador):</p>
                                  <p className="text-xs text-gray-500 bg-gray-200 p-2 rounded font-mono break-all">{visitor.userAgent}</p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                  {stats.recentVisitors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        No hay visitas registradas aún. Haz clic en "Sincronizar" para cargar datos desde Supabase.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

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

        <Card className="shadow-md hover:shadow-lg transition-shadow mt-8">
          <CardHeader>
            <CardTitle>🔧 Solución de Problemas de Geolocalización</CardTitle>
            <CardDescription>Si no se solicita la ubicación o no funciona, sigue estos pasos:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600">📱 En Dispositivos Móviles</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Asegúrate de tener el GPS/ubicación activado en la configuración del dispositivo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Verifica que el navegador tenga permisos de ubicación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Si usas Chrome/Edge, abre la configuración del sitio (🔒 en la barra de direcciones) y permite la ubicación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>Si estás en modo incógnito, algunos navegadores bloquean la ubicación por defecto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">5.</span>
                    <span>Para Android: Configuración &gt; Ubicación &gt; Activar y modo "Alta precisión"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">6.</span>
                    <span>Para iOS: Configuración &gt; Privacidad y Seguridad &gt; Servicios de Localización &gt; [Tu navegador] &gt; "Mientras usa la app"</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-green-600">💻 En Computadoras</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Permite la ubicación cuando el navegador lo solicite</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Verifica la configuración del sitio: haz clic en el ícono 🔒 a la izquierda de la URL</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Asegúrate de que tu computadora tenga WiFi o GPS activado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>En Chrome: Configuración &gt; Privacidad y seguridad &gt; Configuración de sitios &gt; Ubicación</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="font-bold text-yellow-800">⚠️ Importante:</p>
              <p className="text-sm text-yellow-700">
                La geolocalización requiere una conexión segura (HTTPS). Si estás accediendo mediante HTTP (ej: localhost en una red), 
                la ubicación podría no funcionar en dispositivos móviles.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
