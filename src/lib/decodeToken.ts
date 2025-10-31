export function decodeToken(token: string) {
  if (!token) return null;
  const [, payload] = token.split(".");
  const decodedPayload = JSON.parse(atob(payload));
  return {
    id: decodedPayload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ],
    email:
      decodedPayload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ],
    role: decodedPayload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"
    ],
  };
}
