# Guía de Integración - Mercado Pago Checkout Pro

## 📋 Requisitos Previos

✅ Estar logueado en el panel de admin  
✅ Tener credenciales de Mercado Pago (Access Token + Public Key)  
✅ Tener variable de entorno `NEXT_PUBLIC_BASE_URL` configurada  

## 🚀 Paso 1: Configurar Mercado Pago en Admin

1. Ve a `https://tu-dominio.com/admin`
2. Busca **Pagos** → **Métodos de pago**
3. Haz clic en **Nuevo método** (botón rojo)
4. Completa:
   - **Nombre**: "Mercado Pago - Principal"
   - **Proveedor**: Mercado Pago
   - **Access Token**: Tu token de Mercado Pago
   - **Public Key**: Tu clave pública
   - **Ambiente**: 
     - ☑️ "Prueba (Sandbox)" para testing
     - ☑️ "Producción" para producción
   - **Activo en la tienda**: ☑️

5. Haz clic en **Crear**

### Dónde obtener credenciales

1. Ve a https://www.mercadopago.com.ar (o tu país)
2. Inicia sesión o crea cuenta
3. Ve a **Configuración** → **Integraciones** → **Credenciales**
4. Copia:
   - **Access Token** (comienza con `APP_USR_`)
   - **Public Key** (comienza con `APP_USR_`)

## 📝 Paso 2: Endpoint de Preferencia de Pago

**Ubicación**: `/api/pagos/mercadopago/preference`

**Método**: POST

**Parámetros requeridos**:
```json
{
  "orderId": "uuid-de-la-orden",
  "items": [
    {
      "product_id": "uuid-producto",
      "product_name": "Nombre del producto",
      "variant_name": "Variante (opcional)",
      "quantity": 1,
      "unit_price": 19990
    }
  ],
  "userEmail": "cliente@example.com",
  "userName": "Juan Pérez (opcional)",
  "userPhone": "9123456789 (opcional)",
  "userRut": "12345678-9 (opcional)"
}
```

**Respuesta exitosa**:
```json
{
  "id": "preference-id",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
}
```

## 🎨 Paso 3: Integrar Checkout Pro en tu flujo

### Opción A: Usar el componente MercadoPagoCheckout

```tsx
import { MercadoPagoCheckout } from '@/components/store/MercadoPagoCheckout'
import type { CartItem } from '@/types'

export function CheckoutPage() {
  const items: CartItem[] = [/* tu carrito */]
  
  return (
    <MercadoPagoCheckout
      orderId="order-123"
      items={items}
      userEmail="cliente@example.com"
      userName="Juan Pérez"
      userPhone="9123456789"
      userRut="12345678-9"
      isProduction={false}  // Cambiar a true en producción
      onPaymentInitiated={() => console.log('Pago iniciado')}
    />
  )
}
```

### Opción B: Integración Manual

```tsx
// 1. Crear preferencia
const response = await fetch('/api/pagos/mercadopago/preference', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId,
    items,
    userEmail,
    userName,
    userPhone,
    userRut,
  }),
})

const preference = await response.json()

// 2. Cargar script de MP
const script = document.createElement('script')
script.src = 'https://sdk.mercadopago.com/js/v2'
document.body.appendChild(script)

script.onload = () => {
  const mp = new window.MercadoPago(preference.public_key, {
    locale: 'es-CL',
  })

  mp.checkout({
    preference: { id: preference.id },
    render: {
      container: '#mp-container',
      label: 'Pagar',
    },
  })
}
```

## 🔔 Paso 4: Webhook - Confirmar Pagos

**Ubicación**: `/api/webhooks/mercadopago`

**Cómo configura Mercado Pago**:

1. Ve a https://www.mercadopago.com/developers/panel
2. Busca **Configuración** → **Webhooks** (o **Notificaciones**)
3. Agrega nueva notificación:
   - **URL**: `https://tu-dominio.com/api/webhooks/mercadopago`
   - **Eventos**: Selecciona `payment.created` y `payment.updated`
4. Guarda

**¿Qué hace el webhook?**

Cuando se completa un pago, Mercado Pago envía una notificación:

1. El webhook recibe la notificación
2. Consulta detalles del pago en Mercado Pago
3. Actualiza el estado de la orden:
   - ✅ `approved` → `paid` (pago confirmado)
   - ⏳ `pending` → `pending` (pago en revisión)
   - ❌ `rejected` → `failed` (pago rechazado)
4. Registra el cambio en `order_status_history`

## 🧪 Paso 5: Testing (Sandbox)

### Tarjetas de prueba

```
Tarjeta aprobada:
Número: 4111 1111 1111 1111
Vencimiento: 11/25
CVV: 123

Tarjeta rechazada:
Número: 4000 0000 0000 0002
Vencimiento: 11/25
CVV: 123

Tarjeta sospechosa (pending):
Número: 4000 0000 0000 9995
Vencimiento: 11/25
CVV: 123
```

### Flujo de test

1. Crear orden con `is_production: false`
2. Iniciar Checkout Pro
3. Usar tarjeta de prueba
4. Completar formulario
5. Ver confirmación en `/confirmacion/[orderId]`
6. Verificar estado en `/admin/pedidos`

## 📊 Paso 6: Monitorear Pagos

### En Admin Panel

- Ve a **Pagos** → **Métodos de pago**
- Verifica que Mercado Pago esté **Activo**
- Verifica ambiente (Producción o Prueba)

### En Base de Datos

```sql
-- Ver órdenes con estado de pago
SELECT id, payment_method, payment_status, created_at 
FROM orders 
WHERE payment_method = 'mercadopago' 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver historial de cambios
SELECT * FROM order_status_history 
WHERE order_id = 'order-id' 
ORDER BY created_at DESC;
```

## 🔒 Seguridad

### ✅ Buenas prácticas

- **Backend**: El Access Token nunca se expone al cliente
- **Frontend**: Solo usa Public Key en el navegador
- **Webhook**: Verifica siempre con Mercado Pago los detalles del pago
- **HTTPS**: Usa HTTPS en todas las URLs

### ❌ Errores comunes

- ❌ Confiar solo en `back_urls` (el usuario puede no regresar)
- ❌ Confiar en datos del cliente sin verificar con MP
- ❌ Dejar logs con datos sensibles
- ❌ Usar Access Token en el frontend

## 🐛 Troubleshooting

### "Mercado Pago no está configurado"

- Verifica que el método de pago esté creado en admin
- Verifica que `is_active = true`
- Verifica que tenga `access_token` configurado

### "Error creando preferencia"

- Verifica que `NEXT_PUBLIC_BASE_URL` esté configurado en `.env.local`
- Verifica credenciales de Mercado Pago
- Revisa logs en `/api/webhooks/mercadopago`

### "Webhook no actualiza la orden"

- Verifica que el webhook esté configurado en Mercado Pago
- Verifica que `order_id` coincida con `external_reference`
- Revisa logs del servidor

### "El script de MP no carga"

- Verifica que el navegador pueda acceder a `sdk.mercadopago.com`
- Verifica que no haya bloqueadores de anuncios
- Usa DevTools para ver errores de red

## 📞 Recursos útiles

- Documentación oficial: https://developers.mercadopago.com/docs
- Sandbox vs Producción: https://developers.mercadopago.com/docs/overview
- API Reference: https://developers.mercadopago.com/reference
- Ejemplos: https://github.com/mercadopago

## 🎯 Checklist de Producción

- [ ] Cambiar credenciales a producción en admin
- [ ] Cambiar `is_production` a true en método de pago
- [ ] Probar flujo completo en producción
- [ ] Configurar webhook en Mercado Pago
- [ ] Verificar HTTPS en todas las URLs
- [ ] Monitorear primeros pagos
- [ ] Configurar alertas de errores
- [ ] Documentar proceso para equipo

## Preguntas Frecuentes

**P: ¿Puedo tener múltiples métodos de Mercado Pago?**
R: Sí, puedes crear varios con diferentes nombres (ej: "MP - Principal", "MP - Backup")

**P: ¿Cómo cambio de Sandbox a Producción?**
R: Edita el método en admin, cambia `is_production` a true e ingresa credenciales reales

**P: ¿Qué pasa si el cliente no regresa del checkout?**
R: El webhook actualiza la orden automáticamente cuando Mercado Pago recibe la notificación

**P: ¿Los datos de tarjeta se almacenan?**
R: No, Mercado Pago procesa y cifra los datos. Tu servidor nunca ve números de tarjeta

**P: ¿Hay límite de transacciones?**
R: Depende de tu cuenta de Mercado Pago. Contacta a soporte para más info
