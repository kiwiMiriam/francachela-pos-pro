# 🍻 Sistema POS Francachela

Sistema de Punto de Venta completo con integración a Google Sheets como base de datos.

## 🚀 Características Principales

### ✅ Módulos Implementados

1. **POS (Punto de Venta)**
   - ✅ Multi-ticket (múltiples ventas simultáneas)
   - ✅ Búsqueda de productos por nombre o código de barras
   - ✅ Gestión de cantidades
   - ✅ Asociación de clientes a ventas
   - ✅ Sistema de puntos automático
   - ✅ Aplicación de descuentos
   - ✅ Comentarios por venta
   - ✅ Múltiples métodos de pago (Efectivo, Yape, Plin, Tarjeta)
   - ✅ Generación de tickets

2. **Gestión de Clientes**
   - ✅ CRUD completo
   - ✅ Registro con DNI, nombres, apellidos, teléfono
   - ✅ Historial de compras
   - ✅ Puntos de fidelidad acumulados
   - ✅ Historial de canjes
   - ✅ Filtros por cumpleaños y deudas

3. **Inventario de Productos**
   - ✅ CRUD completo
   - ✅ Código de barras
   - ✅ Gestión de stock
   - ✅ Stock mínimo y alertas
   - ✅ Precio normal y mayoreo
   - ✅ Categorías
   - ✅ Valor en puntos por producto
   - ✅ Control de visibilidad
   - ✅ Movimientos de inventario (entradas, salidas, ajustes)

4. **Historial de Ventas**
   - ✅ Registro completo de transacciones
   - ✅ Detalles de productos vendidos
   - ✅ Puntos otorgados/usados
   - ✅ Filtros por fecha y método de pago
   - ✅ Anulación de ventas
   - ✅ Reversión de inventario

5. **Promociones y Combos**
   - ✅ CRUD de promociones
   - ✅ Tipos: porcentaje, monto fijo, 2x1, 3x2
   - ✅ Combos de productos
   - ✅ Precios especiales
   - ✅ Aplicación automática en POS

6. **Caja Registradora**
   - ✅ Apertura/cierre de caja
   - ✅ Monto inicial
   - ✅ Desglose por método de pago
   - ✅ Control de gastos
   - ✅ Historial de cajas

7. **Gastos**
   - ✅ Registro de gastos operativos
   - ✅ Categorías
   - ✅ Vinculación con caja registradora

8. **Puntos de Fidelidad**
   - ✅ Acumulación automática
   - ✅ Canje de puntos
   - ✅ Historial de transacciones
   - ✅ Configuración de equivalencias

9. **Delivery**
   - ✅ Gestión de pedidos
   - ✅ Estados de entrega
   - ✅ Asignación de repartidores
   - ✅ Costo de delivery

10. **Dashboard**
    - ✅ Métricas en tiempo real
    - ✅ Ventas del día/semana/mes
    - ✅ Productos más vendidos
    - ✅ Alertas de inventario bajo
    - ✅ Clientes con más puntos

11. **Configuraciones**
    - ✅ Datos del negocio
    - ✅ Métodos de pago
    - ✅ Sistema de puntos
    - ✅ Notificaciones

## 🏗️ Arquitectura

```
src/
├── components/
│   ├── layout/        # Layout principal con sidebar
│   └── ui/           # Componentes UI (shadcn)
├── config/
│   └── api.ts        # Configuración de API y endpoints
├── contexts/
│   └── POSContext.tsx # Estado global del POS
├── pages/
│   ├── POS.tsx       # Punto de venta
│   ├── Productos.tsx # Gestión de productos
│   ├── Clientes.tsx  # Gestión de clientes
│   ├── Ventas.tsx    # Historial de ventas
│   ├── Promociones.tsx # Promociones y combos
│   ├── Caja.tsx      # Caja registradora
│   ├── Gastos.tsx    # Control de gastos
│   ├── Puntos.tsx    # Sistema de puntos
│   ├── Delivery.tsx  # Gestión de delivery
│   ├── Dashboard.tsx # Dashboard principal
│   └── Configuraciones.tsx # Configuración
├── services/
│   ├── api.ts        # Capa de abstracción API
│   ├── mockData.ts   # Datos de prueba
│   └── googleSheets.ts # Integración Google Sheets
├── types/
│   └── index.ts      # Definiciones TypeScript
└── utils/
    └── pointsCalculator.ts # Utilidades de puntos
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Modo de desarrollo con mocks
VITE_USE_MOCKS=true
VITE_USE_GOOGLE_SHEETS=false

# Para producción con Google Sheets
VITE_USE_MOCKS=false
VITE_USE_GOOGLE_SHEETS=true
VITE_GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/TU_SCRIPT_ID/exec
```

### Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 📊 Integración con Google Sheets

El sistema puede usar Google Sheets como base de datos. Ver documentación completa en `GOOGLE_SHEETS_SETUP.md`.

### Modos de operación:

1. **Modo Mock** (`VITE_USE_MOCKS=true`): Usa datos de prueba locales
2. **Modo API Rest** (`VITE_USE_MOCKS=false`, `VITE_USE_GOOGLE_SHEETS=false`): Conecta a API backend
3. **Modo Google Sheets** (`VITE_USE_GOOGLE_SHEETS=true`): Usa Google Sheets como BD

## 🎯 Flujo de Trabajo Típico

### Venta Normal

1. Abrir/seleccionar ticket en POS
2. Buscar y agregar productos
3. (Opcional) Asociar cliente
4. (Opcional) Aplicar descuento o promoción
5. Seleccionar método de pago
6. Completar venta
7. Se registra automáticamente:
   - Venta en historial
   - Descuento de inventario
   - Puntos acumulados al cliente
   - Movimiento en caja registradora

### Gestión de Inventario

1. Ver productos con stock bajo
2. Registrar entrada de mercancía
3. Ajustar stock manualmente
4. Ver historial de movimientos

### Cierre de Caja

1. Abrir caja al inicio del día
2. Registrar ventas durante el día
3. Registrar gastos
4. Cerrar caja al final
5. Ver desglose por método de pago
6. Verificar diferencias

## 🔐 Seguridad

- Validación de datos en frontend
- Sanitización de inputs
- Control de permisos por rol (admin, cajero, supervisor)
- Logs de auditoría en Google Sheets

## 🚧 Próximas Funcionalidades

- [ ] Exportación de reportes PDF/CSV
- [ ] Envío de puntos por WhatsApp
- [ ] Notificaciones push
- [ ] Modo offline con sincronización
- [ ] App móvil nativa
- [ ] Impresión de tickets térmica
- [ ] Dashboard en tiempo real con websockets

## 📱 Soporte

- UI optimizada para pantallas táctiles
- Responsive design
- Funciona en tablets y móviles
- Soporte para lectores de código de barras

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Estado**: React Context API
- **Formularios**: React Hook Form + Zod
- **Backend**: Google Sheets + Apps Script (o API REST)
- **Routing**: React Router DOM

## 📄 Licencia

Proyecto privado - Francachela POS

---

**Desarrollado con ❤️ para mejorar la gestión de tu negocio**
