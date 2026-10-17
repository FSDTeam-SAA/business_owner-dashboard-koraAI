import { Suspense } from 'react';
import { OwnerOnboarding } from '@/components/owner/onboarding';
import './onboarding.css';
import '@/components/owner/onboarding-refinement.css';
export default function OnboardingPage() { return <Suspense><OwnerOnboarding /></Suspense>; }
