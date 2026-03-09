export interface User {
  id: number;
  sid: string;
  name: string;
  permission: number;
}

export interface Category {
  id: number;
  title: string;
}

export interface Item {
  id: number;
  name: string;
  eid: number;
  category: Category;
  status: string;
  uuid: string;
}

export interface ItemWithStatus extends Item {
  is_rented: boolean;
}

export interface Rental {
  id: number;
  borrower: User;
  item: Item;
  rental_start: string;  // 대여 시작일
  rental_end: string;  // 반납 기한
  return_date: string | null;  // 실제 반납일
  is_returned: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserLogin {
  sid: string;
  name: string;
}

export interface CategoryCreate {
  title: string;
}

export interface ItemCreate {
  name: string;
  eid: number;
  category_id: number;
  status: string;
}

export interface ItemUpdate {
  name?: string;
  eid?: number;
  category_id?: number;
  status?: string;
}
