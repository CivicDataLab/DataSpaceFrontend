import { Content } from './components/Content';
import Datasets from './components/Datasets';
import Sectors from './components/Sectors';
import UseCases from './components/UseCases';

export default async function Home() {
  return (
    <div className="bg-surfaceDefault">
      <Content />
      <UseCases />
      <Sectors />
      <Datasets />
    </div>
  );
}
