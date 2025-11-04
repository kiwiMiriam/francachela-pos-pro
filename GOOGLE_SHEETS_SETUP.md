# Configuración de Google Sheets como Base de Datos

Este documento explica cómo configurar Google Sheets como fuente de datos para el sistema POS Francachela.

## 📋 Estructura de Hojas Requeridas

El documento de Google Sheets debe contener las siguientes hojas:

### 1. Productos
Columnas:
- ID (número único)
- PRODUCTO_DESCRIPCION (texto)
- CODIGO_BARRA (texto opcional)
- IMAGEN (URL opcional)
- COSTO (número)
- PRECIO (número)
- PRECIO_MAYOREO (número opcional)
- CANTIDAD_ACTUAL (número)
- CANTIDAD_MINIMA (número)
- PROVEEDOR (texto opcional)
- CATEGORIA (texto)
- VALOR_PUNTOS (número)
- MOSTRAR (boolean: TRUE/FALSE)
- USA_INVENTARIO (boolean: TRUE/FALSE)

### 2. Clientes
Columnas:
- ID (número único)
- NOMBRES (texto)
- APELLIDOS (texto)
- DNI (texto)
- FECHA_NACIMIENTO (fecha opcional)
- TELEFONO (texto opcional)
- FECHA_REGISTRO (fecha/hora)
- PUNTOS_ACUMULADOS (número)
- HISTORIAL_COMPRAS (IDs separados por coma)
- HISTORIAL_CANJES (IDs separados por coma)

### 3. Ventas
Columnas:
- ID (número único)
- TICKET_ID (texto)
- FECHA (fecha/hora)
- CLIENTE_ID (número opcional)
- LISTA_PRODUCTOS (JSON string)
- TOTAL (número)
- DESCUENTO (número)
- METODO_PAGO (texto: Efectivo/Yape/Plin/Tarjeta)
- COMENTARIO (texto opcional)
- CAJERO (texto)
- ESTADO (texto: completada/cancelada)
- PUNTOS_OTORGADOS (número)
- PUNTOS_USADOS (número)

### 4. Movimientos_Inventario
Columnas:
- ID (número único)
- HORA (fecha/hora)
- CODIGO_BARRA (texto opcional)
- DESCRIPCION (texto)
- COSTO (número)
- PRECIO_VENTA (número)
- EXISTENCIA (número)
- INV_MINIMO (número)
- TIPO (texto: salida/ajuste/entrada)
- CANTIDAD (número)
- CAJERO (texto)
- PROVEEDOR (texto opcional)

### 5. Promociones
Columnas:
- ID (número único)
- name (texto)
- description (texto)
- type (texto: percentage/fixed/2x1/3x2)
- value (número)
- startDate (fecha)
- endDate (fecha)
- active (boolean)
- applicableProducts (IDs separados por coma)

### 6. Combos
Columnas:
- ID (número único)
- name (texto)
- description (texto)
- products (JSON string)
- originalPrice (número)
- comboPrice (número)
- active (boolean)

### 7. Caja
Columnas:
- ID (número único)
- cashier (texto)
- openedAt (fecha/hora)
- closedAt (fecha/hora opcional)
- initialCash (número)
- finalCash (número opcional)
- totalSales (número)
- totalExpenses (número)
- status (texto: open/closed/pending)
- paymentBreakdown (JSON string)

### 8. Gastos
Columnas:
- ID (número único)
- date (fecha/hora)
- category (texto)
- description (texto)
- amount (número)
- paymentMethod (texto)
- cashRegisterId (número opcional)

### 9. Delivery
Columnas:
- ID (número único)
- saleId (número)
- clientId (número)
- address (texto)
- phone (texto)
- status (texto: pending/in-transit/delivered/cancelled)
- driver (texto opcional)
- deliveryFee (número)
- estimatedTime (texto opcional)
- notes (texto opcional)

### 10. Configuracion
Columnas:
- key (texto)
- value (JSON string)

## 🔧 Configuración de Google Apps Script

1. Abre tu documento de Google Sheets
2. Ve a **Extensiones → Apps Script**
3. Copia y pega el siguiente código:

```javascript
function doPost(e) {
  try {
    const operation = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(operation.sheet);
    
    switch(operation.action) {
      case 'read':
        return handleRead(sheet, operation);
      case 'write':
        return handleWrite(sheet, operation);
      case 'update':
        return handleUpdate(sheet, operation);
      case 'delete':
        return handleDelete(sheet, operation);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleRead(sheet, operation) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  if (operation.id) {
    // Buscar por ID
    const row = rows.find(r => r[0] == operation.id);
    if (!row) throw new Error('Not found');
    return createJsonResponse(rowToObject(headers, row));
  }
  
  if (operation.range === 'current') {
    // Para caja actual (estado open)
    const openRow = rows.find(r => r[headers.indexOf('status')] === 'open');
    if (!openRow) throw new Error('No open register');
    return createJsonResponse(rowToObject(headers, openRow));
  }
  
  // Devolver todos los registros
  const objects = rows.map(row => rowToObject(headers, row));
  return createJsonResponse(objects);
}

function handleWrite(sheet, operation) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newId = sheet.getLastRow(); // Simple ID auto-increment
  
  const rowData = headers.map(header => {
    if (header === 'ID' || header === 'id') return newId;
    return operation.data[header] || '';
  });
  
  sheet.appendRow(rowData);
  
  const newObject = rowToObject(headers, rowData);
  return createJsonResponse(newObject);
}

function handleUpdate(sheet, operation) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const rowIndex = rows.findIndex(r => r[0] == operation.id);
  if (rowIndex === -1) throw new Error('Not found');
  
  const actualRowIndex = rowIndex + 2; // +1 for header, +1 for 0-based index
  
  headers.forEach((header, colIndex) => {
    if (operation.data[header] !== undefined) {
      sheet.getRange(actualRowIndex, colIndex + 1).setValue(operation.data[header]);
    }
  });
  
  const updatedRow = sheet.getRange(actualRowIndex, 1, 1, headers.length).getValues()[0];
  return createJsonResponse(rowToObject(headers, updatedRow));
}

function handleDelete(sheet, operation) {
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  
  const rowIndex = rows.findIndex(r => r[0] == operation.id);
  if (rowIndex === -1) throw new Error('Not found');
  
  sheet.deleteRow(rowIndex + 2); // +1 for header, +1 for 0-based index
  return createJsonResponse({ success: true });
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index];
  });
  return obj;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Guarda el script con un nombre (ej: "POS_API")
5. Ve a **Implementar → Nueva implementación**
6. Selecciona **Aplicación web**
7. Configuración:
   - **Ejecutar como**: Tu cuenta
   - **Quién tiene acceso**: Cualquier persona
8. Haz clic en **Implementar**
9. Copia la **URL de la aplicación web**

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Modo de operación
VITE_USE_MOCKS=false
VITE_USE_GOOGLE_SHEETS=true

# URL del script de Google Sheets
VITE_GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/TU_SCRIPT_ID/exec
```

## 🧪 Modo de Prueba (Mocks)

Para desarrollo sin conexión a Google Sheets:

```env
VITE_USE_MOCKS=true
VITE_USE_GOOGLE_SHEETS=false
```

## 🔄 Flujo de Datos

1. **Frontend** → Llama a servicios en `src/services/api.ts`
2. **API Service** → Detecta si usar mocks o Google Sheets
3. **Google Sheets Service** → Envía petición POST al script
4. **Google Apps Script** → Lee/Escribe en las hojas
5. **Respuesta** → Datos JSON de vuelta al frontend

## ⚡ Consideraciones de Rendimiento

- Google Sheets tiene límites de lectura/escritura
- Implementa caché en el frontend para reducir peticiones
- Considera usar persistencia local temporal
- Para producción con alta concurrencia, evalúa migrar a base de datos real

## 🔍 Debugging

Logs en Apps Script:
```javascript
Logger.log('Debug message');
```

Ver logs: **Ejecuciones** en el editor de Apps Script

## 📱 Sincronización en Tiempo Real

El sistema actual no usa websockets. Para actualizaciones en tiempo real:
- Implementa polling periódico (cada 30s-60s)
- O usa Google Apps Script triggers para notificaciones push
