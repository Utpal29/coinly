-- Create a function to delete a user
create or replace function delete_user()
returns void
language plpgsql
security definer
as $$
declare
  _user_id uuid;
begin
  -- Get the current user's ID
  _user_id := auth.uid();
  
  -- Check if user exists
  if _user_id is null then
    raise exception 'User not found';
  end if;

  -- Delete user's data from all tables in the correct order
  -- First delete transactions
  delete from public.transactions where user_id = _user_id;
  
  -- Then delete categories
  delete from public.categories where user_id = _user_id;
  
  -- Then delete the profile
  delete from public.profiles where id = _user_id;
  
  -- Finally delete the user from auth.users
  delete from auth.users where id = _user_id;
end;
$$; 