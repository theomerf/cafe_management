export interface BackendDataObject<T> {
    data: T | null;
    isLoading: boolean;
    error: any | null;
}

type BackendDataObjectAction<T> =
    | { type: "FETCH_START" }
    | { type: "FETCH_SUCCESS"; payload: T }
    | { type: "FETCH_ERROR"; payload: string };


export default function BackendDataObjectReducer<T>(state: BackendDataObject<T>, action: BackendDataObjectAction<T>): BackendDataObject<T> {
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
