import { PublicationDraftProvider } from './context';

export default function PublicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicationDraftProvider>{children}</PublicationDraftProvider>;
}
