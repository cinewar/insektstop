import {Card} from './components/Card';
import {Cards} from './components/Cards';
import {Hero} from './components/Hero';

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col bg-secondary'>
      <Hero />
      <Cards>
        <Card>Card 1</Card>
        <Card>Card 1</Card>
        <Card>Card 1</Card>
        <Card>Card 1</Card>
        <Card>Card 1</Card>
        <Card>Card 1</Card>
      </Cards>
    </div>
  );
}
