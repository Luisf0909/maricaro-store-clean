import {
  Html, Head, Body, Container, Section,
  Text, Heading, Link, Hr, Preview
} from '@react-email/components'

interface DownloadItem {
  productName: string
  downloadUrl: string
  expiresAt:   string
  maxDownloads: number
}

interface Props {
  orderNumber:  string
  customerName: string
  downloads:    DownloadItem[]
}

const brand = { bg: '#FAF7F2', primary: '#7A5C4A', dark: '#2C2C2C', muted: '#8A8A8A', border: '#E8E0D5' }

export function DigitalDeliveryEmail({ orderNumber, customerName, downloads }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tus archivos digitales están listos 📥 — {orderNumber}</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily: 'Georgia, serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }}>
          <Section style={{ textAlign: 'center', paddingBottom: '20px' }}>
            <Heading style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: brand.primary, margin: 0, fontWeight: 300 }}>
              MariaCaro<span style={{ color: '#C4A26A' }}>Store</span>
            </Heading>
          </Section>
          <Hr style={{ borderColor: brand.border, margin: '0 0 24px' }} />

          <Section style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Text style={{ fontSize: '40px', margin: '0 0 12px' }}>📥</Text>
            <Heading style={{ fontSize: '22px', color: brand.dark, margin: '0 0 8px', fontWeight: 600 }}>
              ¡Tus archivos están listos!
            </Heading>
            <Text style={{ fontSize: '14px', color: brand.muted, margin: 0 }}>
              Hola {customerName}, aquí tienes el acceso a tus productos digitales del pedido <strong>{orderNumber}</strong>.
            </Text>
          </Section>

          {downloads.map((dl, idx) => (
            <Section key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${brand.border}`, padding: '20px', marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', color: brand.dark, fontWeight: 600, margin: '0 0 12px' }}>
                📄 {dl.productName}
              </Text>
              <Link
                href={dl.downloadUrl}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                }}
              >
                ⬇️ Descargar archivo
              </Link>
              <Text style={{ fontSize: '11px', color: brand.muted, margin: '8px 0 0' }}>
                Disponible hasta: {new Date(dl.expiresAt).toLocaleDateString('es-CL')} · Máx. {dl.maxDownloads} descargas
              </Text>
            </Section>
          ))}

          <Section style={{ backgroundColor: '#FFF8E7', borderRadius: '12px', border: '1px solid #FDE68A', padding: '14px 20px', marginBottom: '24px' }}>
            <Text style={{ fontSize: '12px', color: '#92400E', margin: 0 }}>
              ⚠️ Los enlaces de descarga son personales y vencen según la fecha indicada. Si tienes problemas para descargar,{' '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/cuenta/descargas`} style={{ color: '#B45309' }}>
                accede a tu cuenta
              </Link>{' '}
              o contáctanos.
            </Text>
          </Section>

          <Hr style={{ borderColor: brand.border, margin: '0 0 20px' }} />
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '12px', color: brand.muted, margin: '0 0 8px', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              &ldquo;Tu Palabra es lámpara a mis pies y luz en mi camino.&rdquo; — Salmo 119:105
            </Text>
            <Text style={{ fontSize: '11px', color: '#BBBBBB', margin: 0 }}>
              Maria Caro Store · Chile ·{' '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}`} style={{ color: brand.primary }}>mariacarostore.cl</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
