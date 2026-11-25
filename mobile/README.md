# Taxis Administrator — App móvil

App móvil (Android / iOS) del sistema Taxis Administrator, construida con **Expo SDK 58 + React Native + Expo Router + TypeScript**.

## Requisitos

- Node.js 20+
- Backend corriendo (`cd backend && npm run start:dev`)
- En el teléfono: app **Expo Go** (Android / iOS), o un emulador Android / simulador iOS

## Configuración

Crea `mobile/.env` a partir de `.env.example`:

```
EXPO_PUBLIC_API_URL=http://<IP-de-tu-PC-en-la-red-local>:3000
```

- **Teléfono físico:** usa la IP local de tu PC (ej. `192.168.1.10`), no `localhost`. El teléfono y el PC deben estar en la misma red Wi‑Fi.
- **Emulador Android:** `http://10.0.2.2:3000`
- **Simulador iOS:** `http://localhost:3000`

## Comandos

```bash
cd mobile
npm install
npm start            # abre Metro; escanea el QR con Expo Go
npm run android      # abre en emulador Android
npm run ios          # abre en simulador iOS (solo macOS)
npm run typecheck    # verificación de tipos
npx expo-doctor      # diagnóstico de dependencias
```

## Autenticación

La app usa `POST /api/auth/login/mobile`, que devuelve el JWT en el body (`data.accessToken`) en lugar de una cookie. El token se guarda en `expo-secure-store` (Keychain en iOS, Keystore en Android) y se envía como `Authorization: Bearer <token>`. Ante un `401` la sesión se cierra automáticamente.

## Estructura

```
src/
  app/                       # Rutas (Expo Router, basado en archivos)
    _layout.tsx              # Stack raíz + protección de rutas por sesión
    login.tsx
    (drawer)/                # Menú lateral (drawer)
      index.tsx              # Dashboard
      tarifas.tsx
      vehicles.tsx
      drivers.tsx
      profile.tsx
    tarifas/[id].tsx         # Detalle de tarifa
    tarifas/form.tsx         # Crear / editar tarifa (modal)
    vehicles/[id].tsx, vehicles/form.tsx
    drivers/[id].tsx, drivers/form.tsx
    deudas/[driverId].tsx    # Estado de cuenta del conductor
    deudas/form.tsx          # Crear / editar movimiento (modal)
    gastos/[vehicleId].tsx   # Historial de gastos del vehículo
    gastos/form.tsx          # Crear / editar gasto con ítems (modal)
    users/[id].tsx, users/form.tsx
  modules/{feature}/         # Igual que el frontend web: services, types, components
  components/                # Componentes compartidos y ui/
  contexts/AuthContext.tsx
  hooks/
  lib/                       # Cliente Axios, token, formateo de fechas/moneda
  theme/                     # Paleta claro / oscuro
```

## Funcionalidades (v1)

| Módulo | Funcionalidad |
|---|---|
| Login | Inicio de sesión con persistencia segura del token |
| Dashboard | KPIs, ganancias por día y ranking, con filtros Hoy / Semana / Mes |
| Tarifas | Listado paginado con búsqueda, detalle, crear, editar y eliminar |
| Autos | Listado paginado, crear, detalle con conductor asignado y documentos |
| Conductores | Listado paginado, crear, detalle con botones para llamar y WhatsApp |
| Deudas | Saldos por conductor con filtros, estado de cuenta con saldo acumulado; registrar deuda, abono o condonación; editar y eliminar movimientos |
| Gastos | Resumen por vehículo con alertas de cambio de aceite; historial por categoría; registrar, editar y eliminar gastos con ítems (repuestos, líquidos, mano de obra) |
| Usuarios | Listado paginado, detalle, crear, editar (rol, estado, contraseña) y eliminar |
| Perfil | Datos del usuario, roles y cierre de sesión |

Las secciones de administración solo se muestran a usuarios con rol `ADMIN` o `SUPERADMIN`.
