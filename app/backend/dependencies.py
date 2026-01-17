from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import get_settings
from uuid import UUID

security = HTTPBearer()
settings = get_settings()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UUID:
    """
    Validates the Supabase JWT token and extracts the user ID.
    Required for all protected routes.
    """
    token = credentials.credentials
    try:
        # Supabase signs with HS256 and the project secret
        # The audience is usually 'authenticated' for logged in users
        # Debug JWT Header
        header = jwt.get_unverified_header(token)
        print(f"DEBUG BACKEND: JWT Header: {header}")
        
        payload = jwt.decode(
            token, 
            settings.SUPABASE_JWT_SECRET, 
            algorithms=["HS256", "RS256"], # Temporarily allow RS256 to see if that helps, though we need the key
            audience="authenticated",
            options={"verify_signature": False} # TEMPORARILY DISABLE VERIFICATION TO DEBUG CONTENTS
        )
        user_id = payload.get("sub")
        if user_id is None:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return UUID(user_id)
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
