import type { ApiErrorResponse, FormError } from "../../types/apiError";

interface ErrorDisplayProps {
    error: FormError | null;
    className?: string;
}

export function ErrorDisplay({ error, className = "text-red-700 text-left mt-2" }: ErrorDisplayProps) {
    if (!error) return null;

    if (typeof error === "string") {
        return <p className={className}>{error}</p>;
    }

    if (typeof error === "object" && error !== null) {
        const apiError = error as ApiErrorResponse;
        
        return (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                {apiError.message && (!apiError.errors || Object.keys(apiError.errors).length === 0) && (
                    <div className={`${className} mb-2 font-semibold`}>
                        {apiError.message}
                    </div>
                )}

                {apiError.errors && Object.keys(apiError.errors).length > 0 && (
                    <div className="space-y-2">
                        {Object.entries(apiError.errors).map(([field, messages]) => (
                            <div key={field} className="border-l-4 border-red-400 pl-3">
                                {messages.map((message, index) => (
                                    <p key={`${field}-${index}`} className={`${className} text-sm`}>
                                        <span className="font-medium text-red-800">
                                            {getFieldDisplayName(field)}: 
                                        </span>
                                        <span className="ml-1">{message}</span>
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return <p className={className}>Bilinmeyen bir hata oluştu.</p>;
}

function getFieldDisplayName(field: string): string {
    const fieldNames: Record<string, string> = {
        'UserName': 'Kullanıcı Adı',
        'Password': 'Şifre',
    };
    
    return fieldNames[field] || field;
}