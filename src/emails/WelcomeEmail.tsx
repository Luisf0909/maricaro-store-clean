import {
  Html, Head, Body, Container, Section,
  Text, Heading, Link, Hr, Preview
} from '@react-email/components'

interface Props {
  customerName: string
  email: string
}

const brand = { bg: '#FAF7F2', primary: '#7A5C4A', dark: '#2C2C2C', muted: '#8A8A8A', border: '#E8E0D5', cream: '#FBF8F4' }

export function WelcomeEmail({ customerName, email }: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>¡Bienvenida a Maria Caro Store, {customerName}! ✨</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily: 'Georgia, serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }}>
          <Section style={{ textAlign: 'center', padding: '32px 24px 24px' }}>
            <Heading style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: brand.primary, margin: '0 0 4px', fontWeight: 300 }}>
              MariaCaro<span style={{ color: '#C4A26A' }}>Store</span>
            </Heading>
            <Text style={{ fontSize: '10px', color: brand.muted, letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0 }}>
              Devocionales · Planners · Agendas
            </Text>
          </Section>

          <Hr style={{ borderColor: brand.border, margin: '0 0 28px' }} />

          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Text style={{ fontSize: '36px', margin: '0 0 16px' }}>🙏</Text>
            <Heading style={{ fontSize: '24px', color: brand.dark, margin: '0 0 12px', fontWeight: 600 }}>
              ¡Bienvenida, {customerName}!
            </Heading>
            <Text style={{ fontSize: '14px', color: brand.muted, lineHeight: 1.7, margin: 0 }}>
              Nos alegra tenerte en nuestra comunidad.<br />
              Desde aquí podrás acceder a nuestros devocionales, planners y agendas diseñados para acompañar tu caminar de fe.
            </Text>
          </Section>

          <Section style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: `1px solid ${brand.border}`, padding: '24px', marginBottom: '24px' }}>
            <Text style={{ fontSize: '13px', color: brand.dark, fontWeight: 600, margin: '0 0 16px' }}>¿Qué puedes hacer en tu cuenta?</Text>
            {[
              { icon: '📦', text: 'Ver el estado de tus pedidos en tiempo real' },
              { icon: '📥', text: 'Descargar tus productos digitales comprados' },
              { icon: '♥️', text: 'Guardar tus productos favoritos' },
              { icon: '⭐', text: 'Acumular puntos de fidelización por cada compra' },
              { icon: '💌', text: 'Recibir novedades y ofertas exclusivas' },
            ].map((item, idx) => (
              <Text key={idx} style={{ fontSize: '13px', color: brand.muted, margin: '8px 0', lineHeight: 1.5 }}>
                <span style={{ marginRight: '10px' }}>{item.icon}</span>{item.text}
              </Text>
            ))}
          </Section>

          <Section style={{ backgroundColor: `linear-gradient(135deg, ${brand.primary}, #4A7C7E)`, borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'center', background: 'linear-gradient(135deg, #8B6E5A 0%, #4A7C7E 100%)' }}>
            <Text style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '0 0 8px', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              &ldquo;Todo lo que hagan, háganlo de corazón,<br />como si fuera para el Señor.&rdquo;
            </Text>
            <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Colosenses 3:23
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Link
              href={`${process.env.NEXT_PUBLIC_APP_URL}/productos`}
              style={{
                display: 'inline-block',
                backgroundColor: brand.primary,
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '14px 32px',
                borderRadius: '10px',
              }}
            >
              Explorar productos →
            </Link>
          </Section>

          <Hr style={{ borderColor: brand.border, margin: '0 0 20px' }} />
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '11px', color: brand.muted, margin: 0 }}>
              Este email fue enviado a {email} porque creaste una cuenta en Maria Caro Store.<br />
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}`} style={{ color: brand.primary }}>mariacarostore.cl</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
