'use client';

import { Text } from 'opub-ui';

interface DetailsProps {
  data: any;
}

export default function Details({ data }: DetailsProps) {
  if (!data) return null;

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* Input/Output Schema */}
      {(data.inputSchema && Object.keys(data.inputSchema).length > 0) ||
      (data.outputSchema && Object.keys(data.outputSchema).length > 0) ? (
        <div className="flex flex-col gap-4">
          <Text variant="headingLg" fontWeight="semibold">
            API Schema
          </Text>

          {data.inputSchema && Object.keys(data.inputSchema).length > 0 && (
            <div className="flex flex-col gap-2">
              <Text variant="bodyMd" fontWeight="semibold">
                Input Schema
              </Text>
              <pre className="overflow-x-auto rounded-lg border border-greyExtralight bg-surfaceSubdued p-4 text-sm">
                {JSON.stringify(data.inputSchema, null, 2)}
              </pre>
            </div>
          )}

          {data.outputSchema && Object.keys(data.outputSchema).length > 0 && (
            <div className="flex flex-col gap-2">
              <Text variant="bodyMd" fontWeight="semibold">
                Output Schema
              </Text>
              <pre className="overflow-x-auto rounded-lg border border-greyExtralight bg-surfaceSubdued p-4 text-sm">
                {JSON.stringify(data.outputSchema, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : null}

      {/* Additional Metadata */}
      {data.metadata && Object.keys(data.metadata).length > 0 && (
        <div className="flex flex-col gap-3">
          <Text variant="headingLg" fontWeight="semibold">
            Additional Information
          </Text>
          <div className="rounded-lg border border-greyExtralight p-4">
            {Object.entries(data.metadata).map(([key, value]) => (
              <div key={key} className="mb-3 last:mb-0">
                <Text variant="bodySm" className="text-textSubdued">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
                <Text variant="bodyMd" className="mt-1">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endpoints Information */}
      {data.endpoints && data.endpoints.length > 0 && (
        <div className="flex flex-col gap-3">
          <Text variant="headingLg" fontWeight="semibold">
            API Endpoints
          </Text>
          <div className="flex flex-col gap-3">
            {data.endpoints.map((endpoint: any, index: number) => (
              <div
                key={endpoint.id || index}
                className="rounded-lg border border-greyExtralight p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Text variant="bodyMd" fontWeight="semibold">
                    {endpoint.url}
                  </Text>
                  {endpoint.isPrimary && (
                    <span className="rounded bg-primaryBlue px-2 py-1 text-xs text-white">
                      Primary
                    </span>
                  )}
                </div>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-textSubdued">Method: </span>
                    <span>{endpoint.httpMethod}</span>
                  </div>
                  <div>
                    <span className="text-textSubdued">Auth Type: </span>
                    <span>{endpoint.authType}</span>
                  </div>
                  {endpoint.timeoutSeconds && (
                    <div>
                      <span className="text-textSubdued">Timeout: </span>
                      <span>{endpoint.timeoutSeconds}s</span>
                    </div>
                  )}
                  <div>
                    <span className="text-textSubdued">Status: </span>
                    <span>{endpoint.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
