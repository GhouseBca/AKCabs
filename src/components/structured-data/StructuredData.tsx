type StructuredDataProps = {
  data: object;
};

/**
 * Renders a JSON-LD script tag. Server Components only — the serialized
 * payload is embedded in the static HTML for search engines.
 */
function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export { StructuredData };