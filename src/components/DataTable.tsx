import type { DataTableModel } from "../types";

type DataTableProps = {
  title: string;
  table: DataTableModel;
};

export function DataTable({ title, table }: DataTableProps) {
  if (!table.columns.length || !table.rows.length) {
    return (
      <div className="min-w-0 rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Детальная таблица появится после подключения данных.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-emerald-950/10 bg-leaf-soft">
              {table.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 font-semibold text-emerald-950"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.join("|")} className="border-b border-emerald-950/10">
                {row.map((cell, index) => (
                  <td
                    key={`${cell}-${index}`}
                    className="px-4 py-3 align-top leading-6 text-stone-700"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
