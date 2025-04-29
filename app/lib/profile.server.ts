import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * 사용자의 프로필이 존재하는지 확인하고, 없으면 생성합니다.
 * @param supabase Supabase 클라이언트 인스턴스
 * @param user 인증된 사용자 객체 (getUser() 결과)
 */
export async function ensureUserProfileExists(supabase: SupabaseClient, user: User) {
  try {
    // 프로필 존재 여부 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error(`Error checking profile for user ${user.id}:`, profileError);
      return; // 오류 발생 시 중단
    }

    if (!profile) {
      // 프로필이 없으면 생성
      const metadata = user.user_metadata || {};
      let username = metadata.user_name || metadata.preferred_username;
      if (!username || username.length < 3) {
        username = `user_${user.id.substring(0, 8)}`;
      }

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: username,
          full_name: metadata.name || metadata.full_name,
          avatar_url: metadata.avatar_url
        });

      if (insertError) {
        console.error(`Failed to auto-create profile for user ${user.id}:`, insertError);
      } else {
        console.log(`Profile auto-created successfully for user ${user.id}`);
      }
    }
  } catch (e) {
    console.error(`Unexpected error during profile ensure process for user ${user.id}:`, e);
  }
} 