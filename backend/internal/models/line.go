package models

type LineTokenResponse struct {
	AccessToken  string `json:"access_token"`
	IDToken      string `json:"id_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
}
type LineIDTokenClaims struct {
	Sub     string `json:"sub"`
	Name    string `json:"name"`    // Display name
	Picture string `json:"picture"` // Picture URL
}
