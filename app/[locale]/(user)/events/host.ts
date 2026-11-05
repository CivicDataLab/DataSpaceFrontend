import type { EntityCoverPublisher } from '@/components/entity-cover/EntityCover';
import {
  backendFileUrl,
  organizationPublisherHref,
  personPublisherHref,
} from '@/lib/public-entity';

import type { PublicEvent } from './queries';

export function eventHost(event: PublicEvent): EntityCoverPublisher | null {
  if (event.organization?.name) {
    const name = event.organization.name.trim();
    return {
      name,
      href: organizationPublisherHref(event.organization),
      imageSrc: backendFileUrl(event.organization.logo?.url),
      imageAlt: name,
      kindLabel: 'Host',
    };
  }

  const person = event.user;
  const name = person?.fullName?.trim() || person?.username?.trim();
  if (person?.id && name) {
    return {
      name,
      href: personPublisherHref(name, person.id),
      imageSrc: backendFileUrl(person.profilePicture?.url),
      imageAlt: name,
      kindLabel: 'Host',
    };
  }

  return null;
}
