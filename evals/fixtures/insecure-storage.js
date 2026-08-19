// Fixture: Storing sensitive bearer tokens & credentials unencrypted in localStorage
function authenticateUser(sessionToken, masterSecretKey) {
    // Insecure storage: accessible via XSS
    localStorage.setItem('auth_bearer_token', sessionToken);
    localStorage.setItem('master_secret_key', masterSecretKey);
}

authenticateUser('jwt_token_example', 'super-secret-key-123');
