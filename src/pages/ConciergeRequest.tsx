import { Navigation } from "@/components/layout/Navigation";
import { RequestDetail } from "@/components/concierge/RequestDetail";

const ConciergeRequest = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <RequestDetail />
    </div>
  );
};

export default ConciergeRequest;
