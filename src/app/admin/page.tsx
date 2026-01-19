import { SiteHeader } from "../../components/layout/SiteHeader";
async function fetchStats() {
  const res = await fetch("http://localhost:3000/api/admin/stats", {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to load stats");
  }
  return res.json();
}

export default async function AdminPage() {
  const stats = await fetchStats();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader title="Admin Dashboard" />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Store Metrics
        </h1>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">
              Total items purchased
            </div>
            <div className="mt-2 text-xl font-semibold">
              {stats.totalItemsPurchased}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">
              Total purchase amount
            </div>
            <div className="mt-2 text-xl font-semibold">
              ${stats.totalPurchaseAmount.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">
              Total discount given
            </div>
            <div className="mt-2 text-xl font-semibold">
              ${stats.totalDiscountAmount.toFixed(2)}
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-tight">
            Discount codes
          </h2>
          <div className="mt-3 overflow-hidden rounded-lg border bg-white shadow-sm">
            {stats.discountCodes.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">
                No discount codes generated yet.
              </p>
            ) : (
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Code</th>
                    <th className="px-4 py-2 font-medium">
                      Discount %
                    </th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.discountCodes.map((code: any) => (
                    <tr key={code.code} className="border-t">
                      <td className="px-4 py-2">{code.code}</td>
                      <td className="px-4 py-2">
                        {code.discountPercent}%
                      </td>
                      <td className="px-4 py-2">
                        {code.isUsed ? "Used" : "Active"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

