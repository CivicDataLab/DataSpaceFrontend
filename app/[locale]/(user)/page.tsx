import { Content } from './components/Content';
import Datasets from './components/Datasets';
import Sectors from './components/Sectors';

export default async function Home() {
  return (
    <div className="bg-surfaceDefault">
      <Content />
      <Datasets />
      <Sectors/>
    </div>
  );
}
