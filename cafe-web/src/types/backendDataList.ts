export interface BackendDataList<T> {
    data: T[] | null;
    isLoading: boolean;
    error: any | null;
}

type BackendDataListAction<T> =
    | { type: "FETCH_START" }
    | { type: "FETCH_SUCCESS"; payload: T[] }
    | { type: "FETCH_ERROR"; payload: string };


export default function BackendDataListReducer<T>(state: BackendDataList<T>, action: BackendDataListAction<T>): BackendDataList<T> {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, isLoading: true, error: null };
        case "FETCH_SUCCESS":
            return { data: action.payload, isLoading: false, error: null };
        case "FETCH_ERROR":
            return { ...state, isLoading: false, error: action.payload };
        default:
            return state;
    }
}
