import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Builds list / save / remove hooks for a Supabase table.
 * `user_id` is filled in by the database (default auth.uid()) and enforced by RLS.
 */
function resource(table, order) {
  const key = [table];

  const useList = () =>
    useQuery({
      queryKey: key,
      queryFn: async () => {
        let q = supabase.from(table).select('*');
        for (const [column, ascending] of order) q = q.order(column, { ascending });
        const { data, error } = await q;
        if (error) throw error;
        return data;
      },
    });

  const useSave = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, ...fields }) => {
        const q = id
          ? supabase.from(table).update(fields).eq('id', id)
          : supabase.from(table).insert(fields);
        const { data, error } = await q.select().single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    });
  };

  const useRemove = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (id) => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => qc.invalidateQueries(),
    });
  };

  return { useList, useSave, useRemove };
}

export const Sessions = resource('practice_sessions', [['practiced_on', false], ['created_at', false]]);
export const Riffs = resource('riffs', [['created_at', false]]);
export const Goals = resource('goals', [['done', true], ['due_date', true], ['created_at', false]]);
