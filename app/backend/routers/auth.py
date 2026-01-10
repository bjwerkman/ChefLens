from fastapi import APIRouter, HTTPException, Depends
from app.backend.models import LoginRequest
from app.backend.services.auth_service import AuthService
from uuid import uuid4

router = APIRouter(prefix="/auth", tags=["auth"])

def get_auth_service():
    return AuthService()

@router.post("/cookidoo")
async def login_cookidoo(request: LoginRequest, service: AuthService = Depends(get_auth_service)):
    # In a real scenario, we'd authenticate against Cookidoo, get email, find/create Supabase user
    # For this scaffolding/mock phase:
    # We generate a dummy or temporary User ID if we can't find one. 
    # Since we can't easily query auth.users without admin privs usually (or we need logic)
    # We'll assume the client might send a user_id or we return a new one.
    
    # MOCK: Generate a UUID based on email hash or random for this session
    # In production: Check auth.users by email
    
    # Let's pretend we "create" a user ID for this session
    # Ideally: user = supabase.auth.admin.create_user(...)
    # We'll just generate a UUID to satisfy the FK constraint logic in our simulation
    # BUT wait, the schema has `user_id UUID REFERENCES auth.users(id)`.
    # Insertion into `user_tokens` will FAIL if user_id doesn't exist in `auth.users`.
    # AND we can't insert into `auth.users` easily without Service Role and specific calls.
    # The 'recipes' table calls depend on this.
    
    # SIMPLIFICATION FOR MVP WITHOUT SUPABASE ADMIN:
    # We might fail on FK constraint if we just make up a UUID.
    # However, if Supabase MCP set it up, maybe we are just using the public anon key?
    # RLS policies uses `auth.uid()`.
    # If backend uses Service Role, it bypasses RLS? Yes.
    # Does it bypass FK? No.
    
    # STRATEGY:
    # Return a success. The Frontend won't actually be authenticated with Supabase Auth.
    # The Backend uses Service Key (likely) to write to tables.
    # If the Backend uses Service Key, we can write ANY uuid to `user_id` column?
    # NO, FK constraint `REFERENCES auth.users(id)` is strict DB level.
    
    # WARNING: This is a tricky point in "Strict" arch without full Auth flow.
    # I will assume that for the purpose of this task (which is scaffolding), 
    # I will try to use a hardcoded "Testing" UUID that MUST exist, or I will catch the error.
    # OR better: I will instruct the user to create a user in Supabase or I'll try to sign up using the Supabase Client (if it supports it).
    
    # Let's try to Sign Up the user with the given credentials in Supabase as well?
    # service.supabase.auth.sign_up(...)
    
    try:
        # Try to sign in or sign up to Supabase to get a valid user ID (mirroring Cookidoo creds)
        # This is a common pattern: Use Cookidoo creds for Supabase implicitly
        try:
            auth_response = service.supabase.auth.sign_in_with_password({"email": request.email, "password": request.password})
            user_id = auth_response.user.id
        except Exception:
            # If sign in fails, try sign up
            auth_response = service.supabase.auth.sign_up({"email": request.email, "password": request.password})
            if auth_response.user:
                user_id = auth_response.user.id
            else:
                # Should not happen usually if auto confirm is on, or returns None
                raise HTTPException(status_code=400, detail="Could not register user in Supabase")

        success = await service.login_cookidoo(user_id, request.email, request.password)
        if success:
            return {"status": "success", "user_id": user_id}
        else:
            raise HTTPException(status_code=401, detail="Cookidoo login failed")
            
    except Exception as e:
        # Fallback for when we don't really want to tightly couple or if creds differ
        # Just fail for now
        raise HTTPException(status_code=400, detail=f"Auth Error: {str(e)}")
