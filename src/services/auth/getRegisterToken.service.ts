const REGISTER_TOKEN_KEY = "register_token";

/** localStorage에서 회원가입용 Register Token 조회 */
export function getRegisterToken(): string | null {
  return localStorage.getItem(REGISTER_TOKEN_KEY);
}
