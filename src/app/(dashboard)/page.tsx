import {
  AverageTicketsCreated,
} from "@/components/chart-blocks";
import ProfessionalDashboard from "@/components/chart-blocks/charts/average-tickets-created";
// import Metrics from "@/components/metrics";
import Container from "@/components/container";

export default function Home() {
  return (
    <div>
      {/* <Metrics /> */}
      <div className="grid grid-cols-1 divide-y border-b border-border laptop:grid-cols-3 laptop:divide-x laptop:divide-y-0 laptop:divide-border">
        <Container className="py-6 laptop:col-span-3">
          <ProfessionalDashboard />
        </Container>
      </div>
    </div>
  );
}
