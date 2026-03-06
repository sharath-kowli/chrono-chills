
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- bookmarks
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;

CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- watch_history
DROP POLICY IF EXISTS "Users can delete their own watch history" ON public.watch_history;
DROP POLICY IF EXISTS "Users can insert their own watch history" ON public.watch_history;
DROP POLICY IF EXISTS "Users can update their own watch history" ON public.watch_history;
DROP POLICY IF EXISTS "Users can view their own watch history" ON public.watch_history;

CREATE POLICY "Users can view their own watch history" ON public.watch_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own watch history" ON public.watch_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own watch history" ON public.watch_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watch history" ON public.watch_history FOR DELETE TO authenticated USING (auth.uid() = user_id);
