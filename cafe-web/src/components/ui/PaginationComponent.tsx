import type PaginationHeader from "../../types/paginationHeader";
import { Pagination } from "./Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList } from "@fortawesome/free-solid-svg-icons";
import type RequestParameters from "../../types/requestParameters";
import { useSearchParams } from "react-router-dom";

type PaginationComponentProps = {
    data: any[] | null;
    pagination: PaginationHeader;
    isLoading: boolean;
    error: string | null;
    up: Record<"lg" | "sm" | "md" | "xl" | "2xl", boolean>;
}

export default function PaginationComponent({ data, pagination, isLoading, error, up }: PaginationComponentProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('pageNumber', newPage.toString());
            return prev;
        });
    };

    const handlePageSizeChange = (newSize: number) => {
        setSearchParams(prev => {
            prev.set('pageSize', newSize.toString());
            prev.set('pageNumber', '1');
            return prev;
        });
    };

    const shouldShowPagination = pagination.TotalPage! > 1 && !isLoading && !error;

    return (
        <>
            {data && data.length > 0 && (
                <div className="flex flex-col lg:flex-row lg:gap-x-20 gap-y-5 items-center lg:justify-center mt-10">
                    {shouldShowPagination && (
                        <div className="border-2 border-white/90 flex gap-x-5 w-fit bg-white shadow-lg rounded-xl">
                            <Pagination
                                currentPage={pagination.CurrentPage!}
                                totalPages={pagination.TotalPage!}
                                onPageChange={handlePageChange}
                                maxVisible={up.lg ? 3 : 2}
                                showFirstLast={up.lg ? true : false}
                                showPrevNext={up.lg ? true : false}
                            />
                        </div>
                    )}

                    <div className="border-2 border-white/90 flex w-fit bg-white gap-x-5 shadow-lg px-2 py-3 rounded-xl">
                        <p className="font-semibold self-center">
                            <FontAwesomeIcon icon={faList} className="mr-2" />
                            Sayfa Başına
                        </p>
                        <select
                            className="ml-auto bg-gray-50 border-2 border-gray-100 rounded-lg px-4"
                            value={searchParams.get("pageSize") || 8}
                            onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                        >
                            <option value="8">8</option>
                            <option value="16">16</option>
                            <option value="24">24</option>
                        </select>
                    </div>
                </div>
            )}
        </>
    )
}