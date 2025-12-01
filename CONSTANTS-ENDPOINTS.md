# 🍻 Francachela POS API -- Documentación de Endpoints

API REST para el sistema de Punto de Venta **Francachela POS**,
desarrollado con **NestJS + PostgreSQL**, orientado a la gestión de
ventas, inventario, clientes, promociones, caja, delivery, reportes y
exportación de datos.

------------------------------------------------------------------------

## 🚀 Tecnologías

-   **Backend:** NestJS + TypeScript
-   **Base de Datos:** PostgreSQL
-   **ORM:** TypeORM
-   **Autenticación:** JWT Bearer
-   **Documentación:** Swagger / OpenAPI
-   **Mensajería:** WhatsApp (Baileys)
-   **Reportes:** ExcelJS

------------------------------------------------------------------------

## 🌐 URL Base

  Entorno      URL
  ------------ -----------------------------
  Desarrollo   http://localhost:3000
  Producción   https://api.francachela.com

------------------------------------------------------------------------

## 🔐 Autenticación

Todos los endpoints protegidos requieren el siguiente header:

``` http
Authorization: Bearer <TOKEN_JWT>
```

### Roles del sistema

-   **ADMIN:** Acceso total
-   **CAJERO:** Ventas, clientes y consultas
-   **INVENTARIOS:** Productos y stock

------------------------------------------------------------------------

## 📌 Estructura de Respuesta Estándar

``` json
{
  "status": true,
  "message": "Operación exitosa",
  "data": {}
}
```

### Error

``` json
{
  "status": false,
  "message": "Mensaje de error",
  "error": "Detalle técnico"
}
```

------------------------------------------------------------------------

# 📖 ENDPOINTS

## ✅ App

  Método   Endpoint   Descripción
  -------- ---------- ----------------------------------
  GET      `/`        Verificación de estado de la API

------------------------------------------------------------------------

## 🔐 Autenticación

  Método   Endpoint          Descripción
  -------- ----------------- ----------------------------------------
  POST     `/auth/login`     Iniciar sesión
  GET      `/auth/profile`   Obtener perfil del usuario autenticado

### Ejemplo Login

``` bash
curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@mail.com","password":"123456"}'
```

------------------------------------------------------------------------

## 👥 Usuarios

  Método   Endpoint                 Descripción
  -------- ------------------------ ------------------------
  POST     `/users`                 Crear usuario
  GET      `/users`                 Listar usuarios
  GET      `/users/{id}`            Obtener usuario por ID
  PATCH    `/users/{id}`            Actualizar usuario
  DELETE   `/users/{id}`            Desactivar usuario
  PATCH    `/users/{id}/activate`   Activar usuario

------------------------------------------------------------------------

## 📦 Productos

  Método   Endpoint           Descripción
  -------- ------------------ ---------------------
  POST     `/products`        Crear producto
    ### payload example: 
        {
          "productoDescripcion": "Cerveza Pilsen 650ml",
          "codigoBarra": "7751271001234",
          "imagen": "string",
          "costo": 2.5,
          "precio": 4,
          "precioMayoreo": 3.5,
          "cantidadActual": 100,
          "cantidadMinima": 10,
          "proveedor": "Backus",
          "categoria": "Bebidas",
          "valorPuntos": 5,
          "mostrar": true,
          "usaInventario": true
        }
  GET      `/products`        Listar productos
  GET      `/products/{id}`   Obtener producto
  GET    `/productos/search`   (Buscar productos por descripción, código de barras, categoría o proveedor con query)
  GET: `/productos/categorias` ( Obtener todas las categorías de productos)
  GET: `/productos/stock-bajo`  (Obtener productos con stock bajo)
  GET: `/productos/categoria/{categoria}`  (Obtener productos por categoría)
  GET: `/productos/movimientos`  (Obtener historial de movimientos de inventario)

  PATCH    `/products/{id}`   Actualizar producto
    ### payload example: 
        {
          "productoDescripcion": "Cerveza Pilsen 650ml",
          "codigoBarra": "7751271001234",
          "imagen": "string",
          "costo": 2.5,
          "precio": 4,
          "precioMayoreo": 3.5,
          "cantidadActual": 100,
          "cantidadMinima": 10,
          "proveedor": "Backus",
          "categoria": "Bebidas",
          "valorPuntos": 5,
          "mostrar": true,
          "usaInventario": true
        }

  DELETE   `/products/{id}`   Eliminar producto (soft delete)
  PATCH: `/productos/{id}/stock`   (Actualizar stock del producto)
    ### payload example: 
        {
          "cantidad": 50,
          "tipo": "ENTRADA",
          "observaciones": "Compra de mercancía",
          "proveedor": "Distribuidora ABC",
          "numeroFactura": "F001-00001234"
        }
  PATCH: `/productos/{id}/activate`  (Mostrar producto nuevamente)

------------------------------------------------------------------------

## 🧾 Ventas

  | Método | Endpoint                                       | Descripción                |
| ------ | ---------------------------------------------- | -------------------------- |
| POST   | `/ventas`                                       | Registrar venta            |
        ### payload example: 
            {
              "clienteId": 1,
              "listaProductos": [
                {
                  "productoId": 1,
                  "cantidad": 2,
                  "precioUnitario": 4.5
                }
              ],
              "descuento": 5,
              "metodoPago": "EFECTIVO",
              "comentario": "Cliente frecuente",
              "tipoCompra": "LOCAL",
              "montoRecibido": 50,
              "puntosUsados": 10
            }
| GET    | `/ventas`                                       | Listar todas las ventas    |
| GET    | `/ventas/{id}`                                  | Obtener detalle de venta   |
| GET    | `/ventas/cliente/{clienteId}`                 | Obtener estadisticas de ventas por rango de fecha|
| GET    | `/ventas/estadisticas`                 | Obtener ventas de un cliente especifico|
| GET    | `/ventas/rango?from=YYYY-MM-DD&to=YYYY-MM-DD` | Ventas por rango de fechas |
| GET    | `/ventas/ticket/{ticketId}`                      | Ventas por ticket ID         |
| PATCH  | `/ventas/{id}/anular`                           | Anular venta               |
| POST   | `/ventas/devolucion/{id}`                       | Devolución                 |
| GET    | `/ventas/hoy`                                 | Ventas del día             |

------------------------------------------------------------------------

## 👤 Clientes

  Método   Endpoint            Descripción
  -------- ------------------- --------------------
  POST     `/clientes`        Crear cliente
    ### payload example: 
        {
          "nombres": "Juan Carlos",
          "apellidos": "García López",
          "dni": "12345678",
          "fechaNacimiento": "1990-05-15",
          "telefono": "987654321",
          "direccion": "Av. Lima 123, San Isidro"
        }
  GET      `/clientes`        Listar clientes
  GET      `/clientes/{id}`   Obtener cliente
  GET: `/clientes/search`  (Buscar clientes por nombre, apellido, DNI, teléfono o código por query)
  GET: `/clientes/cumpleañeros`  (Obtener clientes que cumplen años hoy)
  GET: `/clientes/top`   (Obtener clientes con más puntos)
  GET: `/clientes/dni/{dni}`   (Obtener cliente por DNI)
  GET: `/clientes/codigo/{codigoCorto}`  (Obtener cliente por código corto)
  PATCH    `/clientes/{id}`   Actualizar cliente
    ### payload example: 
          {
            "nombres": "Juan Carlos",
            "apellidos": "García López",
            "dni": "12345678",
            "fechaNacimiento": "1990-05-15",
            "telefono": "987654321",
            "direccion": "Av. Lima 123, San Isidro"
          }

  DELETE   `/clientes/{id}`   Eliminar cliente
  GET: `/clientes/{id}/estadisticas`   (Obtener estadísticas del cliente)
  PATCH: `/clientes/{id}/activate`   (Activar cliente nuevamente)
------------------------------------------------------------------------

## 💸 Promociones

| Método | Endpoint                      | Descripción          |
| ------ | ----------------------------- | -------------------- |
| POST   | `/promociones`                 | Crear promoción      |
         ### payload example: 
                {
                  "nombre": "Descuento de Verano",
                  "descripcion": "20% de descuento en bebidas",
                  "tipo": "PORCENTAJE",
                  "descuento": 20,
                  "fechaInicio": "2024-01-01",
                  "fechaFin": "2024-01-31",
                  "productosAplicables": [
                    1,
                    2,
                    3
                  ],
                  "montoMinimo": 50,
                  "cantidadMaximaUsos": 100,
                  "activo": true
                }         
| GET    | `/promociones`                 | Listar promociones   |
| GET    | `/promociones/activas`            | Obtener promoción activas   |
| GET    | `/promociones/vencidas`            | Obtener promoción vencidas    |
| GET    | `/promociones/tipo/{tipo}`            | Obtener promoción por tipo   |
| GET    | `/promociones/{id}`            | Obtener promoción por ID   |
| PATCH  | `/promociones/{id}`            | Actualizar promoción |
| DELETE | `/promociones/{id}`            | Eliminar promoción   |
| PATCH  | `/promociones/{id}/activate`   | Activar              |
| PATCH  | `/promociones/{id}/desactivar-vencidas` | Desactivar           |


------------------------------------------------------------------------
## 💸 Combos

| Método | Endpoint                  | Descripción      |
| ------ | ------------------------- | ---------------- |
| POST   | `/combos`                 | Crear combo      |
        ### payload example: 
            {
              "nombre": "Combo Familiar",
              "descripcion": "2 hamburguesas + 2 papas + 2 gaseosas",
              "productos": [
                {
                  "productoId": 1,
                  "cantidad": 2
                },
                {
                  "productoId": 2,
                  "cantidad": 2
                }
              ],
              "precioOriginal": 45,
              "precioCombo": 35,
              "puntosExtra": 10,
              "active": true
            }

| GET    | `/combos`                 | Listar combos    |
| GET    | `/combos/activos`            | Obtener combo  activos  |
| GET    | `/combos/populares`            | Obtener combo mas populares  |
| GET    | `/combos/{id}`            | Obtener combo por ID  |
| PATCH  | `/combos/{id}`            | Actualizar combo por ID  |
| DELETE | `/combos/{id}`            | Eliminar combo  por ID  |
| GET    | `/combos/{id}/disponibilidad`| Verificar disponibilidad del combo    |
| GET    | `/combos/{id}/ahorro`| Calcular ahorro del combo    |
| PATCH  | `/combos/{id}/activate`   | Activar          |
| PATCH  | `/combos/{id}/deactivate` | Desactivar       |



------------------------------------------------------------------------
## 💸 Caja

| Método | Endpoint                  | Descripción        |
| ------ | ------------------------- | ------------------ |
| POST   | `/caja/abrir`              | Apertura de caja   |
         ### payload example: 
            {
              "montoInicial": 100,
              "observaciones": "Apertura normal del día"
            }         
| PATCH   | `/caja/{id}/cerrar`             | Cierre de caja     |
          ### payload example: 
            {
              "montoFinal": 450,
              "observaciones": "Cierre normal, sin novedades"
            }
| GET    | `/caja`           | ontener historial de cajas  |
| GET    | `/caja/actual`           | Caja actual del cajero  |
| GET    | `/caja/resumen`           |obtener resumen de la caja actual |
| GET    | `/caja/estadisticas`           | Historial de cajas por rango de fecha |
| GET    | `/caja/{id}`              | Detalle de caja  por ID  |
| GET    | `/caja/rango`        | Ventas por caja por rango de fecha    |


------------------------------------------------------------------------

## 📊 Gastos

| Método | Endpoint                                          | Descripción      |
| ------ | ------------------------------------------------- | ---------------- |
| POST   | `/gastos`                                       | Registrar gasto  |
          ### payload example: 
            {
              "descripcion": "Compra de productos de limpieza",
              "monto": 25.5,
              "categoria": "OPERATIVO",
              "metodoPago": "EFECTIVO",
              "proveedor": "Distribuidora ABC",
              "numeroComprobante": "F001-00001234",
              "comprobante": "https://example.com/comprobante.pdf"
            }
| GET    | `/gastos`                                       | Listar gastos    |
| GET    | `/gastos/hoy`                                       | Listar gastos del dia actual   |
| GET    | `/gastos/categorias`                             | Listar categorias de gastos disponibles |
| GET    | `/gastos/estadisticas`                             | Listar estadisticas de gastos por rango de fecha |
| GET    | `/gastos/search`                             | buscar gastos por descripcion, proveedor o comprobante |
| GET    | `/gastos/rango?from=YYYY-MM-DD&to=YYYY-MM-DD` | Gastos por rango de fecha |
| GET    | `/gastos/categoria/{categoria}`                 | Detalle de gastos por categoria |
| GET    | `/gastos/cajero/{cajero}`                 | Detalle de gastos por cajero |
| GET    | `/gastos/{id}`                                  | Detalle de gasto por id |
| PATCH  | `/gastos/{id}`                                  | Editar gasto     |
| DELETE | `/gastos/{id}`                                  | Eliminar gasto   |


------------------------------------------------------------------------

## 📊 Delivery

| Método | Endpoint                  | Descripción           |
| ------ | ------------------------- | --------------------- |
| POST   | `/delivery`               | Crear pedido delivery |
       ### payload example: 
              {
                "clienteId": 1,
                "pedidoId": 1,
                "direccion": "Av. Principal 123, San Isidro",
                "repartidor": "Juan Pérez",
                "phone": "987654321",
                "deliveryFee": 5,
                "notes": "Casa de color azul, segundo piso"
              }       
| GET    | `/delivery`               | Listar pedidos        |
| GET    | `/delivery/hoy`         | Pedidos del día       |
| GET    | `/delivery/repartidores`  | lista de repartidores     |
| GET    | `/delivery/estadisticas`  | obtener estadisticas de pedidos por rango de fechas   |
| GET    | `/delivery/estado/{estado}`  | lista de pedidos por estado   |
| GET    | `/delivery/repartidor/{repartidor}`  | lista de pedidos por repartidor   |
| GET    | `/delivery/rango`          | listar pedidos por rango de fechas     |
| GET    | `/delivery/{id}`          | Detalle pedido        |
| PATCH  | `/delivery/{id}` | Actualizar Pedido     |
          ### payload example: 
              {
                "clienteId": 1,
                "pedidoId": 1,
                "direccion": "Av. Principal 123, San Isidro",
                "repartidor": "Juan Pérez",
                "phone": "987654321",
                "deliveryFee": 5,
                "notes": "Casa de color azul, segundo piso",
                "estado": "EN_CAMINO",
                "horaSalida": "14:30",
                "horaEntrega": "15:15"
              }
| PATCH  | `/delivery/{id}/asignar` | asignar repartidor a pedido     |
| PATCH  | `/delivery/{id}/en-camino` | marcar pedido en camino     |
| PATCH  | `/delivery/{id}/entregado` | Marcar pedido como entregado      |
| PATCH  | `/delivery/{id}/cancelar`   | Cancelar pedido       |



------------------------------------------------------------------------

## 📊 Movimiento inventario

| Método | Endpoint                                      | Descripción        |
| ------ | --------------------------------------------- | ------------------ |
| POST   | `/movimiento-inventario`                  |crear nuevo movimiento de inventario|
           ### payload example: 
              {
                "codigoBarra": "7501234567890",
                "tipo": "ENTRADA",
                "cantidad": 10,
                "costo": 15.5,
                "precioVenta": 25,
                "cajero": "Juan Pérez",
                "proveedor": "Distribuidora ABC"
              }
| GET    | `/movimiento-inventario`                        | Listar movimientos |
| GET    | `/movimiento-inventario/hoy`                        | Listar movimientos del dia|
| GET    | `/movimiento-inventario/estadisticas`          | Listar estadisticas de movimientos por rango de fecha|
| GET    | `/movimiento-inventario/tipo/{tipo}`          | Listar  movimientos por tipo|
| GET    | `/movimiento-inventario/cajero/{cajero}`          | Listar  movimientos por cajero|
| GET    | `/movimiento-inventario/rango`          | Listar movimientos por rango de fecha|
| GET    | `/movimiento-inventario/{id}`                   | Detalle de movimiento por id           |
| POST   | `/movimiento-inventario/entrada`                    | registrar entrada de mercancia   |
| POST   | `/movimiento-inventario/ajuste`                    | registrar ajuste de inventario    |
| POST   | `/movimiento-inventario/venta`             | registrar salido por venta       |


------------------------------------------------------------------------

## 📩 WhatsApp

| Método | Endpoint                 | Descripción           |
| ------ | ------------------------ | --------------------- |
| POST   | `/whatsapp/send`         | Enviar mensaje        |
       ### payload example: 
          {
            "phone": "51987654321",
            "message": "¡Gracias por tu compra!",
            "ventaId": 1
          }
| GET    | `/whatsapp/status`       | Estado del servicio   |
| POST   | `/whatsapp/logout`       | Cerrar sesión         |


------------------------------------------------------------------------

## 📊 EXPORTACIÓN A EXCEL

| Método | Endpoint                       | Descripción          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/excel/export-ventas`         | Exportar ventas      |
| GET    | `/excel/export-productos`      | Exportar productos   |
| GET    | `/excel/export-clientes`     | Exportar clientes    |
| GET    | `/excel/export-inventario`     | Exportar inventario  |
| GET    | `/excel/export-delivery`          | Exportación de pedidos deliveries |


------------------------------------------------------------------------

## 📜 Licencia

Proyecto privado -- Uso exclusivo de Francachela.

------------------------------------------------------------------------

📌 **Swagger disponible en:**\
http://localhost:3000/api
