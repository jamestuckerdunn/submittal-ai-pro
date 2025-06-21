'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';

const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 3 projects',
      'Basic compliance tracking',
      'Document upload and storage',
      'Email notifications',
      'Basic reporting',
    ],
    limitations: [
      'Limited to 3 projects',
      'Basic support only',
      'No Procore integration',
    ],
    popular: false,
    buttonText: 'Get Started Free',
    buttonVariant: 'outline' as const,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 20,
    interval: 'month',
    description: 'Best for growing construction companies',
    features: [
      'Unlimited projects',
      'Advanced compliance tracking',
      'Procore integration',
      'Custom compliance profiles',
      'Advanced reporting & analytics',
      'Priority email support',
      'Document request automation',
      'Expiration alerts',
      'Team collaboration tools',
    ],
    limitations: [],
    popular: true,
    buttonText: 'Start Free Trial',
    buttonVariant: 'default' as const,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    interval: 'month',
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Professional',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced security features',
      'Custom compliance workflows',
      'API access',
      'Single sign-on (SSO)',
      'Custom training & onboarding',
      'SLA guarantees',
    ],
    limitations: [],
    popular: false,
    buttonText: 'Contact Sales',
    buttonVariant: 'outline' as const,
  },
];

export default function PricingPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your construction compliance needs. 
            Start free and upgrade as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  </span>
                  {typeof plan.price === 'number' && (
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.limitations.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Limitations:
                    </p>
                    <div className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-muted-foreground text-sm">• {limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full mt-8" 
                  variant={plan.buttonVariant}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Can I change plans at any time?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Is there a free trial for the Professional plan?
              </h3>
              <p className="text-muted-foreground">
                Yes, we offer a 14-day free trial for the Professional plan. No credit card required to start.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, MasterCard, American Express) and ACH bank transfers for annual plans.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Do you offer discounts for annual billing?
              </h3>
              <p className="text-muted-foreground">
                Yes, we offer a 20% discount when you pay annually. Contact our sales team for more details.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                What kind of support do you provide?
              </h3>
              <p className="text-muted-foreground">
                Free plan users get basic email support. Professional plan users get priority email support with faster response times. Enterprise customers get dedicated account management and phone support.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of construction professionals who trust Compliance Manager Pro 
                to streamline their compliance processes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline">
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}