-- Pin search_path so the function can't be tricked by a schema shadowing
-- attack (advisor: function_search_path_mutable).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
