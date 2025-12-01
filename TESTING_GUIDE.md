# Guía de Prueba - Verificación de Autenticación

## ✅ Cómo Probar la Solución

### 1. Iniciar la Aplicación

```bash
npm run dev
```

Asegúrate de que en tu `.env`:
```
VITE_USE_MOCKS=true
VITE_ENABLE_LOGGING=true
VITE_API_BASE_URL=http://localhost:3000
```

### 2. Abrir Consola del Navegador

Presiona `F12` para abrir las DevTools y ve a la pestaña **Console**.

### 3. Hacer Login

1. Ve a `http://localhost:5173/login`
2. Usa credenciales:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`
3. Deberías ver en la consola:

```
[HttpClient] Making POST request to: http://localhost:3000/auth/login
[AuthService] Login exitoso (mock): admin
[Auth] Sesión recuperada: admin
```

### 4. Probar la Navegación (El Test Crítico)

Una vez autenticado en `/home`:

1. **Haz clic en cualquier módulo del sidebar** (ej: Inventario, Clientes, Ventas)
2. **Observa la consola**

#### ✅ Comportamiento Esperado (CORRECTO):

```
[Auth] Token expirado durante navegación - limpiando  ← NO DEBE APARECER
[Auth] No saved user found                            ← NO DEBE APARECER
```

En su lugar deberías ver:
```
[Auth] Sesión recuperada: admin  ← Esto significa que se recuperó correctamente
```

O si todo está bien, no debería ver ningún mensaje de error.

#### ❌ Comportamiento Anterior (PROBLEMA RESUELTO):

```
[Auth] No saved user found
```
Luego redirige a `/login` perdiendo la sesión.

---

### 5. Verificar Storage en Console

Ejecuta esto en la consola del navegador:

```javascript
// Ver si el token está guardado
console.log('Token:', localStorage.getItem('auth_token'));

// Ver si el usuario está guardado
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Ver si el token está expirado
const token = localStorage.getItem('auth_token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Token expira en:', new Date(payload.exp * 1000));
```

**Resultado esperado:**
- Token debe estar presente
- User debe estar presente con estructura: `{id, username, role, nombre, token}`
- Fecha de expiración debe ser 24 horas en el futuro

---

### 6. Probar Refresh de Página (Refresh Crítico)

1. Navega a `/productos` (cualquier módulo autenticado)
2. **Presiona F5** para refrescar la página completamente
3. Espera a que cargue

#### ✅ Comportamiento Esperado:

- ✅ La página carga correctamente sin redirigir a login
- ✅ El usuario permanece autenticado
- ✅ El sidebar y header muestran la información del usuario
- ✅ En consola ves: `[Auth] Sesión recuperada: admin`

#### ❌ Comportamiento Anterior (PROBLEMA):

- ❌ Se muestra "Cargando..." brevemente
- ❌ Se redirige a `/login` automáticamente
- ❌ Se ve mensaje: `[Auth] No saved user found`

---

### 7. Probar Cierre de Sesión

1. Haz clic en el botón **"Cerrar Sesión"** en el AppHeader
2. Observa que:
   - ✅ Se redirige a `/login`
   - ✅ El localStorage está limpio
   - ✅ En consola ves: `[Auth] Cerrando sesión...`

Verifica en console:
```javascript
localStorage.getItem('auth_token')   // null
localStorage.getItem('user')         // null
```

---

### 8. Probar Token Expirado

Para simular un token expirado (desarrollo):

```javascript
// En la consola del navegador:
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('auth_token');

// Modificar token para que esté expirado (cambiar el exp)
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
payload.exp = Math.floor(Date.now() / 1000) - 3600; // Expirado hace 1 hora
const newPayload = btoa(JSON.stringify(payload));
const expiredToken = `${parts[0]}.${newPayload}.${parts[2]}`;

localStorage.setItem('auth_token', expiredToken);

// Ahora navega o recarga
```

Deberías ver que se limpie automáticamente y redirige a login.

---

## 📊 Lista de Verificación

### Autenticación
- [ ] Login exitoso con credenciales correctas
- [ ] Error con credenciales incorrectas
- [ ] Token se guarda en localStorage
- [ ] Usuario se guarda en localStorage

### Navegación
- [ ] Navegar entre módulos sin perder sesión
- [ ] Cada navegación recupera sesión del storage
- [ ] No aparece mensaje de "No saved user found"

### Refrescamiento de Página
- [ ] Refrescar página en módulo autenticado permanece autenticado
- [ ] Sesión se recupera automáticamente
- [ ] No hay redirección no deseada a login

### Cierre de Sesión
- [ ] Botón logout limpia storage
- [ ] Redirige a /login correctamente
- [ ] localStorage queda vacío después de logout

### Validación de Token
- [ ] Token expirado se detecta automáticamente
- [ ] Token expirado limpia sesión
- [ ] Redirige a login si token está expirado

### ProtectedRoute
- [ ] Rutas protegidas requieren autenticación
- [ ] Sin autenticación redirige a login
- [ ] Muestra loader durante verificación

---

## 🔍 Debugging

### Para ver todos los logs:

```javascript
// En consola:
const logs = [];
const originalLog = console.log;
console.log = function(...args) {
  logs.push(args);
  originalLog.apply(console, args);
};

// Luego ver todos los logs de autenticación:
logs.filter(l => l[0]?.includes?.('[Auth]') || l[0]?.includes?.('[AuthService]'))
```

### Ver estado actual de autenticación:

```javascript
// En consola:
console.log({
  token: localStorage.getItem('auth_token'),
  user: JSON.parse(localStorage.getItem('user')),
  keys: Object.keys(localStorage),
});
```

---

## 🚨 Problemas Comunes y Soluciones

### Problema: "No saved user found" al navegar

**Posibles causas:**
1. localStorage no se persistió correctamente
2. Storage Service no está funcionando
3. AuthContext no se está recuperando

**Solución:**
1. Verificar que `VITE_USE_MOCKS=true` en `.env`
2. Ejecutar en consola: `localStorage.getItem('user')`
3. Si está vacío, el login no funcionó

### Problema: Recarga de página redirige a login

**Posibles causas:**
1. El useEffect de recuperación de sesión falla
2. StorageService no puede acceder a localStorage
3. Token está realmente expirado

**Solución:**
1. Ver logs en consola
2. Ejecutar: `authService.isTokenExpired()` en consola
3. Si retorna `true`, el token está expirado

### Problema: Spinner infinito en ProtectedRoute

**Posibles causas:**
1. `isLoading` nunca se pone en `false`
2. `recoverSession()` nunca se completa
3. Error no capturado en recuperación

**Solución:**
1. Ver logs de error en consola
2. Abrir DevTools Network para ver si hay requests bloqueadas
3. Reiniciar la aplicación con `npm run dev`

---

## ✅ Prueba de Regresión

Para verificar que las rutas NO autenticadas aún funcionan:

1. **Login Page**: `http://localhost:5173/login` ✅ Debe cargar
2. **Landing Page**: `http://localhost:5173/landing` ✅ Debe cargar
3. **Logout**: Cerrar sesión ✅ Debe redirigir a `/login`

---

## 📝 Notas

- Los logs prefijados con `[Auth]`, `[AuthService]`, `[HttpClient]` son informativos
- La primera carga después del login puede mostrar "Verificando autenticación..."
- Los cambios en localStorage se reflejan en consola en tiempo real
- El token mock expira en 24 horas (configurable en `authService.ts`)

---

## 🎯 Criterio de Éxito

La refactorización es **EXITOSA** si:

✅ Iniciar sesión y navegar entre módulos SIN perder autenticación
✅ Refrescar página en módulo autenticado permanece autenticado
✅ Token se valida automáticamente en cada navegación
✅ No hay mensaje de "No saved user found" innecesario
✅ Cierre de sesión limpia storage y redirige correctamente
