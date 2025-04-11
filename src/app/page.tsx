import {
  Layout,
  Container,
  Hero,
  FeaturesGrid,
  CallToAction,
  Footer
} from '@/components/home';
import Link from 'next/link';

export default function Home() {
  // Define features
  const features = [
    {
      title: 'AI Logging',
      description: 'Comprehensive logging for all your AI models. Track inputs, outputs, and performance metrics in one place.',
      buttonText: 'Learn More',
      buttonVariant: 'default' as const
    },
    {
      title: 'Multi-tenant Support',
      description: 'Securely isolate data between different teams or customers with our robust multi-tenant architecture.',
      buttonText: 'Explore',
      buttonVariant: 'outline' as const
    },
    {
      title: 'Real-time Analytics',
      description: 'Monitor your AI systems in real-time with powerful dashboards and visualization tools.',
      buttonText: 'See Demo',
      buttonVariant: 'default' as const
    },
    {
      title: 'API Integration',
      description: 'Easily integrate with your existing AI systems using our comprehensive API and SDKs.',
      buttonText: 'View Docs',
      buttonVariant: 'outline' as const
    }
  ];

  // Define CTA buttons
  const ctaButtons = [
    {
      text: 'Sign Up',
      variant: 'default' as const,
      size: 'lg' as const,
      href: '/sign-up'
    },
    {
      text: 'Log In',
      variant: 'outline' as const,
      size: 'lg' as const,
      href: '/login'
    },
    {
      text: 'Documentation',
      variant: 'subtle' as const,
      size: 'lg' as const,
      href: '#'
    }
  ];

  return (
    <Layout>
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">NeuralLog</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 rounded-md text-sm font-medium">
                Log In
              </Link>
              <Link href="/sign-up" className="bg-brand-600 text-white hover:bg-brand-700 px-3 py-2 rounded-md text-sm font-medium">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <Container>
        <Hero
          title="NeuralLog - AI Logging Platform"
          description="The comprehensive logging and monitoring solution for AI systems. Track, analyze, and improve your AI models with ease."
        />

        <FeaturesGrid features={features} />

        <div className="bg-brand-50 dark:bg-gray-700 p-6 rounded-lg mb-8 border border-brand-200 dark:border-gray-600">
          <h2 className="text-2xl font-semibold mb-4 text-center text-brand-600 dark:text-brand-400">Ready to get started?</h2>
          <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
            Join thousands of developers who are already using NeuralLog to improve their AI systems.
            Sign up for free and start logging your AI models today.
          </p>
          <CallToAction buttons={ctaButtons} />
        </div>
      </Container>

      <Footer companyName="NeuralLog" />
    </Layout>
  );
}
