import DiceRoller from '@/components/DiceRoller';

export const metadata = {
  title: 'Dice of Catan',
  description: 'A 3D dice roller.',
  robots: { index: false, follow: false },
};

export default function DiceRollPage() {
  return <DiceRoller />;
}
