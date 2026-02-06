import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {getPeople,addPerson,removePerson,getExpenses,addExpense, removeExpense} from "./store";

export const QUERY_KEYS = {
    people: ["people"] as const,
    expenses: ["expenses"] as const,
};


export function usePeople() {
    return useQuery({
        queryKey: QUERY_KEYS.people,
    queryFn: getPeople,
    initialData: [],
    });
}


export function useAddPerson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addPerson,
    onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.people });
        },
    });
}


export function useRemovePerson() {
const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removePerson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.people });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses });
        },
    });
}


export function useExpenses() {
    return useQuery({
        queryKey: QUERY_KEYS.expenses,
    queryFn: getExpenses,
        initialData: [],
    });
}

export function useAddExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addExpense, onSuccess: () => {
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses });
        },
    });
}


export function useRemoveExpense() {
    const queryClient = useQueryClient();

    return useMutation({
    mutationFn: removeExpense,
onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses });
        },
    });
}
