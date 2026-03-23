export interface CreateInviteDto {
  type: number;
  school_id: string;
  grade?: string;
  class_id?: string;
  ttl?: number;
}

export interface InviteItem {
  code: string;
  type: number;
  school_id: string;
  school_name?: string;
  creater_id: string;
  creater_name?: string;
  grade?: string;
  class_id?: string;
  create_time: number;
  ttl: number;
}

export interface InviteListParams {
  code?: string;
  creater_id?: string;
  school_id?: string;
  class_id?: string;
  grade?: string;
  type?: number;
  page?: number;
  pageSize?: number;
}
