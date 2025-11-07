import { ClipLoader } from "react-spinners";

type DataTableProps = {
    colNames: Map<string, string>;
    rows: any[];
    isLoading: boolean;
    isError: boolean;
    data: any;
    error: any;
    renderActions?: (item: any) => React.ReactNode;
}

export default function DataTable({ colNames, rows, isLoading, isError, data, error, renderActions }: DataTableProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                {isLoading && (
                    <div className="absolute top-1/2 left-1/2  flex flex-col gap-y-2 self-center text-center justify-center items-center pt-4">
                        <ClipLoader size={40} color="#06b6d4" />
                    </div>
                )}
                <table className="table-fixed w-full relative divide-y-2 divide-gray-200">
                    <thead className="bg-blue-400/90 backdrop-blur-md">
                        <tr>
                            {[...colNames].map(([key, value]) => (
                                <th key={key} className={`${value} px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider`}>{key}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {isError ? (
                            <tr className="flex flex-col gap-y-2 self-center justify-center items-center pt-4">
                                <p className="text-white">Veriler yüklenirken bir hata oluştu. <br /> Hata: {error.message} </p>
                            </tr>
                        ) : (
                            data?.map((data: any) => (
                                <tr key={data.id} className="hover:bg-gray-100 transition-all duration-300">
                                    {rows.map((row) => (
                                        <td className="p-4 text-sm md:text-base font-medium text-gray-900">
                                            {data[row] ?? 0}
                                        </td>
                                    ))}
                                    <td className="p-4 text-sm font-medium">
                                        <div className="flex gap-2">
                                            {renderActions?.(data)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}