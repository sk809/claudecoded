// Shown on login pages until Supabase is connected in Lovable.
export default function SetupNotice() {
  return (
    <div className="form-error" role="status">
      Accounts aren't switched on yet. In Lovable, connect Supabase (the Supabase button at the top right), then run the
      SQL in <code>supabase/migrations</code>. Log in and sign up will work after that.
    </div>
  );
}
