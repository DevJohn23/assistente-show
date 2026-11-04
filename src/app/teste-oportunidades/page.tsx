import { notFound } from 'next/navigation';
import { OpportunityLocalPreview } from './preview';

export default function OpportunityTestPage() {
  if(process.env.NODE_ENV !== 'development') notFound();
  return <OpportunityLocalPreview/>;
}
