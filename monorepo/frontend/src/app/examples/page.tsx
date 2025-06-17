import { ClaimsExample } from "@/components/examples/ClaimsExample";
import { PolicyholderExample } from "@/components/examples/PolicyholderExample";

export default function ExamplesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">tRPC Examples</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <ClaimsExample />
        <PolicyholderExample />
      </div>
    </div>
  );
}
