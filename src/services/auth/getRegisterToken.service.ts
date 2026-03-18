const REGISTER_TOKEN_KEY = "register_token";

/** sessionStorage에서 회원가입용 Register Token 조회 */
export function getRegisterToken(): string | null {
  return sessionStorage.getItem(REGISTER_TOKEN_KEY);
}
