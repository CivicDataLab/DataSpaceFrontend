type JsonLdProps = {
    json: string;
  };
  
  export default function JsonLd({ json }: JsonLdProps) {
    return (
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
    );
  }
  