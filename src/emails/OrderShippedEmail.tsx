import {
  Html, Head, Body, Container, Section,
  Text, Heading, Link, Hr, Preview
} from '@react-email/components'

interface Props {
  orderNumber:  string
  customerName: string
  trackingCode?: string | null
  trackingUrl?:  string | null
  carrier?:      string | null
}

const brand = { bg: '#FAF7F2', primary: '#7A5C4A', dark: '#2C2C2C', muted: '#8A8A8A', border: '#E8E0D5' }

export function OrderShippedEmail({ orderNumber, customerName, trackingCode, trackingUrl, carrier }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>¡Tu pedido {orderNumber} fue despachado! 🚚 — Maria Caro Store</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily: 'Georgia, serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }}>
          <Section style={{ textAlign: 'center', paddingBottom: '20px' }}>
            <Heading style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: brand.primary, margin: 0, fontWeight: 300 }}>
              MariaCaro<span style={{ color: '#C4A26A' }}>Store</span>
            </Heading>
          </Section>
          <Hr style={{ borderColor: brand.border, margin: '0 0 24px' }} />

          <Section style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Text style={{ fontSize: '40px', margin: '0 0 12px' }}>🚚</Text>
            <Heading style={{ fontSize: '22px', color: brand.dark, margin: '0 0 8px', fontWeight: 600 }}>
              ¡Tu pedido está en camino!
            </Heading>
            <Text style={{ fontSize: '14px', color: brand.muted, margin: 0 }}>
              Hola {customerName}, tu pedido <strong style={{ color: brand.dark }}>{orderNumber}</strong> fue despachado.
            </Text>
          </Section>

          {trackingCode && (
            <Section style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE', padding: '20px 24px', marginBottom: '24px', textAlign: 'center' }}>
              <Text style={{ fontSize: '12px', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px', fontWeight: 600 }}>
                Código de seguimiento
              </Text>
              <Text style={{ fontSize: '22px', fontFamily: 'monospace', fontWeight: 700, color: '#1E40AF', margin: '0 0 4px' }}>
                {trackingCode}
              </Text>
              {carrier && (
                <Text style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px' }}>{carrier}</Text>
              )}
              {trackingUrl && (
                <Link
                  href={trackingUrl}
                  style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600 }}
                >
                  Rastrear envío →
                </Link>
              )}
            </Section>
          )}

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
              }}
            >
              Ver estado del pedido →
            </Link>
          </Section>

          <Hr style={{ borderColor: brand.border, margin: '0 0 20px' }} />
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '11px', color: brand.muted, margin: 0 }}>
              Maria Caro Store · Chile ·{' '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}`} style={{ color: brand.primary }}>mariacarostore.cl</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
