from pydantic import BaseModel


class CategoryCreate(BaseModel):
    title: str


class CategoryUpdate(BaseModel):
    title: str


class CategoryResponse(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True
