import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EstadisticasLoginProps {
  onLogin: () => void;
}

export function EstadisticasLogin({ onLogin }: EstadisticasLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Cambia esta contraseña por la que quieras
  const CORRECT_PASSWORD = 'Arandom123';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem('namuiWam_dashboard_auth', 'true');
      onLogin();
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">🔐 Acceso Restringido</CardTitle>
          <p className="text-gray-500 mt-2">Dashboard de Estadísticas</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                autoComplete="off"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm font-semibold text-center">{error}</p>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Ingresar al Dashboard
            </Button>
            <a href="/" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4">
              ← Volver al juego
            </a>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
