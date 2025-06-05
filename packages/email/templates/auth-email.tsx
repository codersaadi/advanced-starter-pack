import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface EmailTemplateProps {
  link: string;
  type: 'verify' | 'reset' | 'confirmation';
  username?: string;
}

const templateConfig = {
  verify: {
    previewText: 'Verify your email address',
    heading: 'Verify your email',
    mainText:
      'Thanks for signing up! Please verify your email address to get started.',
    buttonText: 'Verify Email',
    footerText: "If you didn't request this email, you can safely ignore it.",
  },
  reset: {
    previewText: 'Reset your password',
    heading: 'Reset your password',
    mainText:
      'We received a request to reset your password. Click the button below to choose a new password.',
    buttonText: 'Reset Password',
    footerText: "If you didn't request this email, you can safely ignore it.",
  },
  confirmation: {
    previewText: 'Confirm your email address',
    heading: 'Confirm your email address',
    mainText:
      'Thanks for signing up! Please confirm your email address to get started.',
    buttonText: 'Confirm Email',
    footerText: "If you didn't request this email, you can safely ignore it.",
  },
};

export function AuthEmailTemplate({
  link,
  type,
  username,
}: EmailTemplateProps) {
  const config = templateConfig[type];
  const logoUrl = 'your_logo_url';
  return (
    <Html>
      <Head />
      <Preview>{config.previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-lg border border-gray-200 border-solid bg-white p-8 shadow-sm">
            {/* Logo Section */}
            <Section className="text-center">
              <Img
                src={logoUrl}
                width="40"
                height="40"
                alt="Logo"
                className="mx-auto"
              />
            </Section>

            {/* Header Section */}
            <Heading className="mx-0 my-6 text-center font-bold text-2xl text-gray-800">
              {config.heading}
            </Heading>

            {/* Greeting */}
            <Text className="mb-4 text-base text-gray-700">
              Hello {username ? username : 'there'},
            </Text>

            {/* Main Content */}
            <Text className="mb-6 text-base text-gray-700">
              {config.mainText}
            </Text>

            {/* CTA Button */}
            <Section className="mb-8 text-center">
              <Button
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-sm text-white no-underline"
                href={link}
              >
                {config.buttonText}
              </Button>
            </Section>

            {/* Alternative Link */}
            <Text className="mb-6 text-gray-600 text-sm">
              Or copy and paste this URL into your browser:{' '}
              <Link href={link} className="break-all text-blue-600">
                {link}
              </Link>
            </Text>

            <Hr className="my-6 border border-gray-200 border-solid" />

            {/* Footer */}
            <Text className="text-gray-500 text-sm">{config.footerText}</Text>

            <Section className="mt-8">
              <Text className="text-center text-gray-400 text-xs">
                © {new Date().getFullYear()} Your App Name. All rights reserved.
                <br />
                123 Street Name, City, Country
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
