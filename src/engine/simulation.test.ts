import { describe, expect, it } from "vitest";
import { createCompany, buyAircraft, openRoute } from "./company";
import { simulateMonth } from "./simulation";

function companyWithRoute(fare: number, weeklyFrequency = 5) {
  let company = createCompany("Test Air");
  company = buyAircraft(company, "nb180", "owned");
  const aircraftId = company.fleet[0].id;
  company = openRoute(company, {
    originCode: "ICN",
    destCode: "NRT",
    assignedAircraftId: aircraftId,
    weeklyFrequency,
    fare,
  });
  return company;
}

describe("simulateMonth", () => {
  it("advances the month counter and records history", () => {
    const company = companyWithRoute(150);
    const { company: next, report } = simulateMonth(company);
    expect(next.month).toBe(1);
    expect(next.history).toHaveLength(1);
    expect(report.month).toBe(1);
  });

  it("never exceeds the route's seat capacity", () => {
    const company = companyWithRoute(50, 7);
    const { report } = simulateMonth(company);
    const [routeReport] = report.routeReports;
    expect(routeReport.passengers).toBeLessThanOrEqual(routeReport.capacity);
    expect(routeReport.loadFactor).toBeLessThanOrEqual(1);
  });

  it("charges lease costs for leased aircraft even if flown", () => {
    let company = createCompany("Test Air");
    company = buyAircraft(company, "nb180", "leased");
    const aircraftId = company.fleet[0].id;
    company = openRoute(company, {
      originCode: "ICN",
      destCode: "NRT",
      assignedAircraftId: aircraftId,
      weeklyFrequency: 3,
      fare: 150,
    });

    const { report } = simulateMonth(company);
    expect(report.leaseCosts).toBeGreaterThan(0);
  });

  it("degrades aircraft condition after flying", () => {
    const company = companyWithRoute(150);
    const { company: next } = simulateMonth(company);
    expect(next.fleet[0].condition).toBeLessThan(100);
  });

  it("yields higher profit at a well-priced fare than at a wildly overpriced one", () => {
    const cheapCompany = companyWithRoute(120);
    const expensiveCompany = companyWithRoute(2000);

    const cheapResult = simulateMonth(cheapCompany).report;
    const expensiveResult = simulateMonth(expensiveCompany).report;

    expect(cheapResult.revenue).toBeGreaterThan(0);
    expect(expensiveResult.routeReports[0].passengers).toBeLessThan(
      cheapResult.routeReports[0].passengers,
    );
  });
});
