# Configuración de Métodos de Pago

Este documento explica cómo configurar y usar el módulo de métodos de pago en MariaCaro Store.

## 🚀 Instalación

### Paso 1: Ejecutar la migración en Supabase

1. Ve a tu dashboard de Supabase: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **SQL Editor** → **New Query**
4. Copia el contenido del archivo `SUPABASE_MIGRATION_PAYMENT_METHODS.sql`
5. Pega el SQL en el editor
6. Haz clic en **Run** (o presiona `Ctrl+Enter`)

La migración creará:
- Tabla `payment_methods` con todos los campos necesarios
- Índices para optimizar búsquedas
- Políticas de seguridad (RLS) para proteger los datos
- Permisos para que solo administradores puedan acceder

### Paso 2: Acceder al módulo en admin

1. Ve a tu admin panel: `https://tu-dominio.com/admin`
2. Busca **Pagos** en el sidebar izquierdo
3. Haz clic en **Métodos de pago**

## 🎯 Usar el módulo

### Crear un nuevo método de pago

1. Haz clic en **"Nuevo método"** (botón rojo)
2. Completa el formulario:
   - **Nombre**: Identificador para el método (ej: "Transbank - Principal")
   - **Proveedor**: Selecciona entre Transbank, Mercado Pago, Stripe o PayPal
   - **Credenciales**: Ingresa las API keys según el proveedor
   - **Ambiente**: Marca "Producción" para usar credenciales reales, o deja "Prueba (Sandbox)" para testing
   - **Activo**: Marca para que el método aparezca en el checkout

3. Haz clic en **"Crear"**

### Campos por proveedor

#### 🏦 Transbank (WebPay)
- **Código de comercio**: Tu código de comercio asignado por Transbank
- **API Key**: Tu API key de Transbank

#### 💳 Mercado Pago
- **Access Token**: Tu token de acceso (comienza con "APP_USR-")
- **Public Key**: Tu llave pública

#### ⚡ Stripe
- **Publishable Key**: Tu clave publicable (comienza con "pk_")
- **Secret Key**: Tu clave secreta (comienza con "sk_")

#### 🅿️ PayPal
- **Client ID**: Tu ID de cliente
- **Client Secret**: Tu secreto de cliente

### Editar un método de pago

1. En la tabla de métodos, haz clic en el ícono ✏️
2. Modifica los campos necesarios
3. Haz clic en **"Actualizar"**

### Eliminar un método de pago

1. En la tabla de métodos, haz clic en el ícono 🗑️
2. Confirma la eliminación
3. El método será eliminado de la base de datos

## 🔐 Seguridad

- **Credenciales encriptadas**: Los API keys se almacenan de forma segura en Supabase
- **Acceso restringido**: Solo administradores pueden ver/editar métodos de pago
- **Row Level Security (RLS)**: Activo en Supabase para proteger datos
- **Nunca compartas**: No publiques credenciales en Git o en otros lugares públicos

## 🧪 Ambiente de prueba vs Producción

### Prueba (Sandbox)
- Usa credenciales de prueba del proveedor
- Los pagos no son reales
- Ideal para testing y desarrollo
- Marca como **"Prueba"** en el formulario

### Producción
- Usa credenciales reales
- Los pagos son procesados realmente
- **CUIDADO**: Asegúrate de tener las credenciales correctas
- Marca como **"Producción"** en el formulario

## 📊 Dashboard

El módulo te muestra:
- ✅ **Métodos Activos**: Cuántos métodos están habilitados
- ⚠️ **En Producción**: Cuántos métodos usan credenciales reales
- 🧪 **En Prueba**: Cuántos métodos están en sandbox

## 🔄 Integración en checkout

Los métodos de pago activos (is_active = true) aparecerán automáticamente en el checkout de tu tienda.

Para usar los métodos en tu código:

```typescript
// Obtener todos los métodos activos
const response = await fetch('/api/admin/payment-methods')
const methods = await response.json()

// Filtrar solo activos
const activeMethods = methods.filter(m => m.is_active)
```

## ❓ Preguntas frecuentes

**P: ¿Puedo tener múltiples métodos del mismo proveedor?**
R: Sí, puedes crear varios métodos de Mercado Pago o Stripe con diferentes credenciales.

**P: ¿Qué pasa si elimino un método que ya tiene pedidos?**
R: Los pedidos no se eliminan, pero el método no aparecerá en el historial de selección. Considera desactivar en lugar de eliminar.

**P: ¿Cómo cambio de prueba a producción?**
R: Edita el método, marca como "Producción" e ingresa tus credenciales reales.

**P: ¿Las credenciales están en texto plano?**
R: Se almacenan en Supabase. Para mayor seguridad, considera usar variables de entorno (.env) y usar solo tokens de acceso limitados.

## 📞 Soporte

Si tienes problemas:
1. Verifica que la tabla `payment_methods` existe en Supabase
2. Verifica que las políticas RLS están configuradas correctamente
3. Revisa los logs del navegador (F12 → Console)
4. Revisa los logs de Supabase en el dashboard
