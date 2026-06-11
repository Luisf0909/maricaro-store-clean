import {
  Html, Head, Body, Container, Section, Row, Column,
  Text, Heading, Link, Hr, Preview
} from '@react-email/components'
import { formatCLP } from '@/lib/utils'

interface OrderItem {
  product_name: string
  variant_name?: string | null
  quantity: number
  unit_price: number
  subtotal: number
  product_image_url?: string | null
}

interface Props {
  orderNumber:  string
  customerName: string
  items:        OrderItem[]
  shippingCost: number
  discount:     number
  total:        number
  shippingAddress?: {
    full_name: string
    address: string
    city: string
    region: string
  } | null
  isDigitalOnly?: boolean
  trackingUrl?: string | null
}

const brand = {
  bg:        '#FAF7F2',
  primary:   '#7A5C4A',
  dark:      '#2C2C2C',
  muted:     '#8A8A8A',
  border:    '#E8E0D5',
  cream:     '#FBF8F4',
}

export function OrderConfirmEmail({
  orderNumber, customerName, items, shippingCost,
  discount, total, shippingAddress, isDigitalOnly,
}: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>
        Tu pedido {orderNumber} está confirmado ✓ — Maria Caro Store
      </Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily: "'Georgia', serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }}>

          {/* Header */}
          <Section style={{ textAlign: 'center', paddingBottom: '24px' }}>
            <Heading style={{ fontFamily: "'Georgia', serif", fontSize: '28px', color: brand.primary, margin: 0, fontWeight: 300, letterSpacing: '0.05em' }}>
              MariaCaro<span style={{ color: '#C4A26A' }}>Store</span>
            </Heading>
            <Text style={{ fontSize: '10px', color: brand.muted, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '4px 0 0' }}>
              Devocionales · Planners · Agendas
            </Text>
          </Section>

          <Hr style={{ borderColor: brand.border, margin: '0 0 24px' }} />

          {/* Success message */}
          <Section style={{ backgroundColor: '#F0F7F0', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', textAlign: 'center' }}>
            <Text style={{ fontSize: '24px', margin: '0 0 8px' }}>✅</Text>
            <Heading style={{ fontSize: '18px', color: '#2D6A2D', margin: '0 0 6px', fontWeight: 600 }}>
              ¡Pedido confirmado!
            </Heading>
            <Text style={{ fontSize: '14px', color: '#4A7A4A', margin: 0 }}>
              Hola {customerName}, recibimos tu pedido y estamos procesándolo.
            </Text>
          </Section>

          {/* Order number */}
          <Section style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${brand.border}`, padding: '16px 20px', marginBottom: '20px' }}>
            <Row>
              <Column>
                <Text style={{ fontSize: '11px', color: brand.muted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
                  Número de pedido
                </Text>
                <Text style={{ fontSize: '20px', fontFamily: 'monospace', fontWeight: 700, color: brand.primary, margin: 0 }}>
                  {orderNumber}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Items */}
          <Section style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${brand.border}`, marginBottom: '20px', overflow: 'hidden' }}>
            <Section style={{ padding: '14px 20px', borderBottom: `1px solid ${brand.border}` }}>
              <Text style={{ fontSize: '13px', fontWeight: 600, color: brand.dark, margin: 0 }}>
                Productos del pedido
              </Text>
            </Section>
            {items.map((item, idx) => (
              <Section key={idx} style={{ padding: '12px 20px', borderBottom: idx < items.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                <Row>
                  <Column style={{ width: '100%' }}>
                    <Text style={{ fontSize: '13px', color: brand.dark, margin: '0 0 2px', fontWeight: 500 }}>
                      {item.product_name}
                      {item.variant_name && <span style={{ color: brand.muted, fontWeight: 400 }}> — {item.variant_name}</span>}
                    </Text>
                    <Text style={{ fontSize: '12px', color: brand.muted, margin: 0 }}>
                      Cantidad: {item.quantity} × {formatCLP(item.unit_price)}
                    </Text>
                  </Column>
                  <Column style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Text style={{ fontSize: '14px', fontWeight: 700, color: brand.dark, margin: 0 }}>
                      {formatCLP(item.subtotal)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}
            {/* Totals */}
            <Section style={{ padding: '12px 20px', backgroundColor: brand.cream, borderTop: `1px solid ${brand.border}` }}>
              {shippingCost > 0 && (
                <Row style={{ marginBottom: '4px' }}>
                  <Column><Text style={{ fontSize: '12px', color: brand.muted, margin: 0 }}>Envío</Text></Column>
                  <Column style={{ textAlign: 'right' }}><Text style={{ fontSize: '12px', color: brand.muted, margin: 0 }}>{formatCLP(shippingCost)}</Text></Column>
                </Row>
              )}
              {discount > 0 && (
                <Row style={{ marginBottom: '4px' }}>
                  <Column><Text style={{ fontSize: '12px', color: '#2D6A2D', margin: 0 }}>Descuento</Text></Column>
                  <Column style={{ textAlign: 'right' }}><Text style={{ fontSize: '12px', color: '#2D6A2D', margin: 0 }}>-{formatCLP(discount)}</Text></Column>
                </Row>
              )}
              <Row>
                <Column><Text style={{ fontSize: '15px', fontWeight: 700, color: brand.dark, margin: 0 }}>Total</Text></Column>
                <Column style={{ textAlign: 'right' }}><Text style={{ fontSize: '15px', fontWeight: 700, color: brand.primary, margin: 0 }}>{formatCLP(total)}</Text></Column>
              </Row>
            </Section>
          </Section>

          {/* Shipping or digital */}
          {isDigitalOnly ? (
            <Section style={{ backgroundColor: '#EBF5FF', borderRadius: '12px', border: '1px solid #BFDBFE', padding: '16px 20px', marginBottom: '20px' }}>
              <Text style={{ fontSize: '13px', color: '#1E40AF', fontWeight: 600, margin: '0 0 6px' }}>📥 Productos digitales</Text>
              <Text style={{ fontSize: '12px', color: '#3B82F6', margin: 0 }}>
                Recibirás el acceso a tus archivos en un email separado con los enlaces de descarga.
              </Text>
            </Section>
          ) : shippingAddress ? (
            <Section style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${brand.border}`, padding: '16px 20px', marginBottom: '20px' }}>
              <Text style={{ fontSize: '13px', color: brand.dark, fontWeight: 600, margin: '0 0 8px' }}>📦 Dirección de envío</Text>
              <Text style={{ fontSize: '12px', color: brand.muted, margin: '2px 0', lineHeight: 1.6 }}>
                {shippingAddress.full_name}<br />
                {shippingAddress.address}<br />
                {shippingAddress.city}, {shippingAddress.region}
              </Text>
            </Section>
          ) : null}

          {/* Tracking link */}
          <Section style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Link
              href={`${process.env.NEXT_PUBLIC_APP_URL}/seguimiento/${orderNumber}`}
              style={{
                display: 'inline-block',
                backgroundColor: brand.primary,
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '12px 28px',
                borderRadius: '8px',
                letterSpacing: '0.02em',
              }}
            >
              Ver estado del pedido →
            </Link>
          </Section>

          <Hr style={{ borderColor: brand.border, margin: '0 0 20px' }} />

          {/* Footer */}
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '12px', color: brand.muted, margin: '0 0 6px', fontStyle: 'italic', fontFamily: "'Georgia', serif" }}>
              &ldquo;Todo lo que hagan, háganlo de corazón, como si fuera para el Señor.&rdquo;
            </Text>
            <Text style={{ fontSize: '10px', color: '#BBBBBB', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 12px' }}>
              Colosenses 3:23
            </Text>
            <Text style={{ fontSize: '11px', color: brand.muted, margin: 0 }}>
              Maria Caro Store · Chile<br />
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}`} style={{ color: brand.primary }}>mariacarostore.cl</Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
