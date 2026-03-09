from pydantic import BaseModel


class UserCreate(BaseModel):
    sid: str
    name: str


class UserLogin(BaseModel):
    sid: str
    name: str


class UserResponse(BaseModel):
    id: int
    sid: str
    name: str
    permission: int

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
