import Table from '../../components/table/table';

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <div>
      <Table />
    </div>
  );
}
