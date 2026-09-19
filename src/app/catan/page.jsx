import CatanGame from '@/components/catan/CatanGame';

export const metadata = {
  title: 'Catan Table',
  description: 'Seating, turn order and dice for a game of Catan.',
  robots: { index: false, follow: false },
};

export default function CatanPage() {
  return <CatanGame />;
}
